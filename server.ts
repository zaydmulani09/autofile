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
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import xss from "xss";

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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("CRITICAL: Supabase environment variables are missing!");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy is required for express-rate-limit to work correctly behind Vercel/Nginx
  app.set('trust proxy', 1);

  // --- AUTH ROUTES (Priority) ---
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("WARNING: Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) are missing. Google Login will not work.");
  }

  app.get("/api/auth/google/url", (req, res) => {
    try {
      const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
      const REDIRECT_URI = `${appUrl}/auth/google/callback`;

      if (!GOOGLE_CLIENT_ID) {
        console.error("GOOGLE_CLIENT_ID is missing");
        return res.status(500).json({ error: "Google Client ID not configured. Please set GOOGLE_CLIENT_ID in your environment variables." });
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
    } catch (error: any) {
      console.error("Error generating Google Auth URL:", error);
      res.status(500).json({ error: "Internal server error while generating auth URL" });
    }
  });

  app.get("/auth/google/callback", async (req, res) => {
    const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
    const REDIRECT_URI = `${appUrl}/auth/google/callback`;
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>Authentication Failed</h1>
            <p>No authorization code received from Google.</p>
            <button onclick="window.close()">Close Window</button>
          </body>
        </html>
      `);
    }

    try {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error("Google OAuth credentials are not configured on the server.");
      }

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

      const { sub: googleId, email, name } = userResponse.data;

      // Check if user exists in Supabase
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .or(`google_id.eq.${googleId},email.eq.${email}`)
        .maybeSingle();

      if (fetchError) throw fetchError;

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
      const errorMessage = error.response?.data?.error_description || error.message || "Authentication failed";
      res.status(500).send(`
        <html>
          <body>
            <h1>Authentication Failed</h1>
            <p>${errorMessage}</p>
            <button onclick="window.close()">Close Window</button>
          </body>
        </html>
      `);
    }
  });

  // 1. Security Headers (OWASP Best Practice)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:", "http:"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "connect-src": ["'self'", "https:", "http:"],
      },
    },
  }));

  // 2. Rate Limiting (OWASP Best Practice)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });

  app.use("/api", limiter);

  // Debug route to check API connectivity
  app.get("/api/debug", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "API is reachable", 
      timestamp: new Date().toISOString(),
      config: {
        hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL
      }
    });
  });

  app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS

  // 3. Input Validation Schemas (Zod)
  const signupSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(100),
    name: z.string().min(1).max(100),
  });

  const loginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().max(100),
  });

  const noteSchema = z.object({
    userId: z.string().max(50),
    title: z.string().min(1).max(200),
    content: z.string().max(10000),
  });

  const fileSchema = z.object({
    userId: z.string().max(50),
    name: z.string().min(1).max(255),
    size: z.number().positive(),
    type: z.string().max(100),
    url: z.string().url().max(1000),
  });

  const userUpdateSchema = z.object({
    name: z.string().min(1).max(100),
  });

  // Helper for sanitization
  const sanitize = (str: string) => xss(str);

  // Health Check
  app.get("/api/health", async (req, res) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (error) throw error;
      res.json({ status: "ok", supabase: "connected" });
    } catch (error: any) {
      console.error("Health Check Error:", error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validated = signupSchema.parse(req.body);
      const email = sanitize(validated.email);
      const name = sanitize(validated.name);
      const password = validated.password; // Don't sanitize passwords as they are hashed/stored securely

      const id = Math.random().toString(36).substr(2, 9);
      const avatarColor = ['#3b82f6', '#a855f7', '#ef4444', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)];

      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert([{ id, email, password, name, avatar_color: avatarColor }])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase Signup Error:", error);
        if (error.code === '23505') return res.status(400).json({ error: "Email already exists" });
        return res.status(500).json({ error: error.message });
      }

      res.json({ id: newUser.id, email: newUser.email, name: newUser.name, avatarColor: newUser.avatar_color });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error("Signup Route Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validated = loginSchema.parse(req.body);
      const email = sanitize(validated.email);
      const password = validated.password;

      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error) {
        console.error("Supabase Login Error:", error);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user) {
        res.json({ id: user.id, email: user.email, name: user.name, avatarColor: user.avatar_color });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      console.error("Login Route Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
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
    try {
      const validated = userUpdateSchema.parse(req.body);
      const name = sanitize(validated.name);
      
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notes and Files Routes
  app.get("/api/notes/:userId", async (req, res) => {
    try {
      const userId = z.string().max(50).parse(req.params.userId);
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId);
      
      if (error) return res.status(500).json({ error: error.message });
      res.json(notes);
    } catch (error) {
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validated = noteSchema.parse(req.body);
      const userId = sanitize(validated.userId);
      const title = sanitize(validated.title);
      const content = sanitize(validated.content);

      const { data: note, error } = await supabase
        .from('notes')
        .insert([{ user_id: userId, content, title }])
        .select()
        .single();
      
      if (error) return res.status(500).json({ error: error.message });
      res.json(note);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/files/:userId", async (req, res) => {
    try {
      const userId = z.string().max(50).parse(req.params.userId);
      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId);
      
      if (error) return res.status(500).json({ error: error.message });
      res.json(files);
    } catch (error) {
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const validated = fileSchema.parse(req.body);
      const userId = sanitize(validated.userId);
      const name = sanitize(validated.name);
      const url = validated.url; // URL is validated by Zod

      const { data: file, error } = await supabase
        .from('files')
        .insert([{ user_id: userId, name, size: validated.size, type: validated.type, url }])
        .select()
        .single();
      
      if (error) return res.status(500).json({ error: error.message });
      res.json(file);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // File Conversion Route
  app.post("/api/convert", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      
      const targetFormatSchema = z.string().min(1).max(10).regex(/^[a-zA-Z0-9]+$/);
      const targetFormat = targetFormatSchema.parse(req.body.targetFormat);

      const inputPath = req.file.path;
      const outputFilename = `converted-${Date.now()}.${targetFormat}`;
      const outputPath = path.join(tempDir, outputFilename);

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
        throw new Error('Document conversion not supported in this environment');
      }

      const stats = fs.statSync(outputPath);
      const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
      
      res.json({
        url: `${appUrl}/temp/${outputFilename}`,
        size: stats.size
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid target format" });
      }
      console.error('Conversion error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pwned Check Route (Proxy)
  app.get("/api/auth/pwned/:prefix", async (req, res) => {
    try {
      const prefixSchema = z.string().length(5).regex(/^[0-9A-F]+$/i);
      const prefix = prefixSchema.parse(req.params.prefix).toUpperCase();

      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const lines = response.data.split('\n');
      const hashes = lines.map((line: string) => {
        const [suffix, count] = line.split(':');
        return { suffix: suffix.trim(), count: parseInt(count.trim()) };
      });
      res.json({ hashes });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid prefix format" });
      }
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
