import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { promisify } from 'util';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const forbiddenExtensions = ['.exe', '.sh', '.bat', '.cmd', '.msi'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (forbiddenExtensions.includes(ext)) {
      return cb(new Error('Executable files are not allowed'));
    }
    cb(null, true);
  }
});

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google OAuth configuration
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  // Auth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
    const REDIRECT_URI = `${appUrl}/auth/google/callback`;

    if (!GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is missing");
      return res.status(500).json({ error: "Google Client ID not configured" });
    }
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
    const REDIRECT_URI = `${appUrl}/auth/google/callback`;
    const { code } = req.query;
    if (!code) return res.status(400).send("No code provided");

    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      });

      const { access_token } = tokenResponse.data;

      // Get user info from Google
      const userResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { sub: googleId, email, name, picture } = userResponse.data;

      // Check if user exists in Supabase
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .or(`google_id.eq.${googleId},email.eq.${email}`)
        .single();

      let user = existingUser;

      if (!user) {
        const id = Math.random().toString(36).substr(2, 9);
        const avatarColor = ['#3b82f6', '#a855f7', '#ef4444', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)];
        
        const { data: newUser, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id, email, name, avatar_color: avatarColor, google_id: googleId }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        user = newUser;
      } else if (!user.google_id) {
        // Link existing email-only account to Google
        const { data: updatedUser, error: updateError } = await supabase
          .from('profiles')
          .update({ google_id: googleId })
          .eq('id', user.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        user = updatedUser;
      }

      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarColor: user.avatar_color,
      };

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: ${JSON.stringify(userData)} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Google Auth Error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed");
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    const avatarColor = ['#3b82f6', '#a855f7', '#ef4444', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)];

    try {
      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert([{ id, email, password, name, avatar_color: avatarColor }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') return res.status(400).json({ error: "Email already exists" });
        throw error;
      }

      res.json({ id: newUser.id, email: newUser.email, name: newUser.name, avatarColor: newUser.avatar_color });
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (user) {
      res.json({ id: user.id, email: user.email, name: user.name, avatarColor: user.avatar_color });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, name, avatar_color')
      .eq('id', req.params.id)
      .single();
    
    if (user) {
      res.json({ ...user, avatarColor: user.avatar_color });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    const { name } = req.body;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notes and Files Routes
  app.get("/api/notes/:userId", async (req, res) => {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', req.params.userId);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(notes);
  });

  app.post("/api/notes", async (req, res) => {
    const { userId, content, title } = req.body;
    const { data: note, error } = await supabase
      .from('notes')
      .insert([{ user_id: userId, content, title }])
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(note);
  });

  app.get("/api/files/:userId", async (req, res) => {
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', req.params.userId);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(files);
  });

  app.post("/api/files", async (req, res) => {
    const { userId, name, size, type, url } = req.body;
    const { data: file, error } = await supabase
      .from('files')
      .insert([{ user_id: userId, name, size, type, url }])
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(file);
  });

  // File Conversion Route
  app.post("/api/convert", upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { targetFormat } = req.body;
    if (!targetFormat) return res.status(400).json({ error: "No target format specified" });

    const inputPath = req.file.path;
    const outputFilename = `converted-${Date.now()}.${targetFormat}`;
    const outputPath = path.join(tempDir, outputFilename);

    try {
      const mimeType = req.file.mimetype;
      
      if (mimeType.startsWith('image/')) {
        await sharp(inputPath).toFormat(targetFormat as any).toFile(outputPath);
      } else if (mimeType.startsWith('video/')) {
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .toFormat(targetFormat)
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath);
        });
      } else {
        // Mock document conversion for now as LibreOffice is not available
        // In a real environment, we would use: exec(`soffice --headless --convert-to ${targetFormat} ${inputPath}`)
        throw new Error('Document conversion not supported in this environment');
      }

      const stats = fs.statSync(outputPath);
      const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
      
      res.json({
        url: `${appUrl}/temp/${outputFilename}`,
        size: stats.size
      });
    } catch (error: any) {
      console.error('Conversion error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pwned Check Route (Proxy)
  app.get("/api/auth/pwned/:prefix", async (req, res) => {
    const { prefix } = req.params;
    try {
      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const lines = response.data.split('\n');
      const hashes = lines.map((line: string) => {
        const [suffix, count] = line.split(':');
        return { suffix: suffix.trim(), count: parseInt(count.trim()) };
      });
      res.json({ hashes });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to check pwned database" });
    }
  });

  // Serve temp files
  app.use('/temp', express.static(tempDir));

  // Cleanup Job: Delete files older than 1 hour
  cron.schedule('0 * * * *', () => {
    const now = Date.now();
    fs.readdir(tempDir, (err, files) => {
      if (err) return;
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;
          if (now - stats.mtimeMs > 3600000) {
            fs.unlink(filePath, () => {});
          }
        });
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    // Only serve index.html if not an API/Auth route (handled by Vercel routes)
    app.get(/^(?!\/(api|auth)).*$/, (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Only call listen if not running in a serverless environment (like Vercel)
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

const appPromise = startServer();

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
