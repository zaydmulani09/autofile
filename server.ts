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

// --- Validation Schemas ---
const sanitize = (str: string) => xss(str);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const userUpdateSchema = z.object({
  name: z.string().min(2).max(50),
});

const noteSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

const fileSchema = z.object({
  userId: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string().url(),
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- 1. GLOBAL MIDDLEWARE ---
  
  // Trust proxy is required for express-rate-limit to work correctly behind Vercel/Nginx
  app.set('trust proxy', 1);

  // Request Logger
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Security Headers
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

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });
  app.use("/api", limiter);

  // Body Parsing
  app.use(express.json({ limit: '10kb' }));

  // --- 2. AUTH CONFIGURATION ---
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("WARNING: Google OAuth credentials missing.");
  }

  // --- 3. API ROUTES ---
  const apiRouter = express.Router();

  // Debug route
  apiRouter.get("/debug", (req, res) => {
    res.json({ 
      status: "ok", 
      config: {
        hasGoogleId: !!GOOGLE_CLIENT_ID,
        hasGoogleSecret: !!GOOGLE_CLIENT_SECRET,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    });
  });

  // Google Auth URL
  apiRouter.get("/auth/google/url", (req, res) => {
    try {
      const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
      const REDIRECT_URI = `${appUrl}/auth/google/callback`;

      if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: "Google Client ID not configured." });
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
      res.status(500).json({ error: "Error generating auth URL" });
    }
  });

  // Health Check
  apiRouter.get("/health", async (req, res) => {
    try {
      const { error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (error) throw error;
      res.json({ status: "ok", supabase: "connected" });
    } catch (error: any) {
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Signup
  apiRouter.post("/auth/signup", async (req, res) => {
    try {
      const validated = signupSchema.parse(req.body);
      const email = sanitize(validated.email);
      const name = sanitize(validated.name);
      const password = validated.password;

      const id = Math.random().toString(36).substr(2, 9);
      const avatarColor = ['#3b82f6', '#a855f7', '#ef4444', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)];

      const { data: newUser, error } = await supabase
        .from('profiles')
        .insert([{ id, email, password, name, avatar_color: avatarColor }])
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') return res.status(400).json({ error: "Email already exists" });
        return res.status(500).json({ error: error.message });
      }

      res.json({ id: newUser.id, email: newUser.email, name: newUser.name, avatarColor: newUser.avatar_color });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Validation failed" });
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Login
  apiRouter.post("/auth/login", async (req, res) => {
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

      if (error) return res.status(401).json({ error: "Invalid credentials" });
      res.json({ id: user.id, email: user.email, name: user.name, avatarColor: user.avatar_color });
    } catch (error: any) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: "Validation failed" });
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User Profile
  apiRouter.get("/user/:id", async (req, res) => {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, email, name, avatar_color')
      .eq('id', req.params.id)
      .single();
    if (user) res.json({ ...user, avatarColor: user.avatar_color });
    else res.status(404).json({ error: "User not found" });
  });

  apiRouter.patch("/user/:id", async (req, res) => {
    try {
      const validated = userUpdateSchema.parse(req.body);
      const { error } = await supabase.from('profiles').update({ name: sanitize(validated.name) }).eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Notes
  apiRouter.get("/notes/:userId", async (req, res) => {
    const { data: notes, error } = await supabase.from('notes').select('*').eq('user_id', req.params.userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(notes);
  });

  apiRouter.post("/notes", async (req, res) => {
    try {
      const validated = noteSchema.parse(req.body);
      const { data: note, error } = await supabase.from('notes').insert([{ user_id: sanitize(validated.userId), content: sanitize(validated.content), title: sanitize(validated.title) }]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Files
  apiRouter.get("/files/:userId", async (req, res) => {
    const { data: files, error } = await supabase.from('files').select('*').eq('user_id', req.params.userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(files);
  });

  apiRouter.post("/files", async (req, res) => {
    try {
      const validated = fileSchema.parse(req.body);
      const { data: file, error } = await supabase.from('files').insert([{ user_id: sanitize(validated.userId), name: sanitize(validated.name), size: validated.size, type: validated.type, url: validated.url }]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Conversion
  apiRouter.post("/convert", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const targetFormat = z.string().min(1).max(10).parse(req.body.targetFormat);
      const inputPath = req.file.path;
      const outputFilename = `converted-${Date.now()}.${targetFormat}`;
      const outputPath = path.join(tempDir, outputFilename);
      const mimeType = req.file.mimetype;
      if (mimeType.startsWith('image/')) await sharp(inputPath).toFormat(targetFormat as any).toFile(outputPath);
      else if (mimeType.startsWith('video/')) {
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath).toFormat(targetFormat).on('end', resolve).on('error', reject).save(outputPath);
        });
      } else throw new Error('Conversion not supported');
      const stats = fs.statSync(outputPath);
      const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
      res.json({ url: `${appUrl}/temp/${outputFilename}`, size: stats.size });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pwned
  apiRouter.get("/auth/pwned/:prefix", async (req, res) => {
    try {
      const prefix = z.string().length(5).parse(req.params.prefix).toUpperCase();
      const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
      const hashes = response.data.split('\n').map((line: string) => {
        const [suffix, count] = line.split(':');
        return { suffix: suffix.trim(), count: parseInt(count.trim()) };
      });
      res.json({ hashes });
    } catch (error) {
      res.status(500).json({ error: "Failed to check pwned database" });
    }
  });

  // 404 handler for API routes (must be after all apiRouter routes)
  apiRouter.use("*", (req, res) => {
    res.status(404).json({ error: "API route not found", method: req.method, path: req.originalUrl });
  });

  // Mount API Router
  app.use("/api", apiRouter);

  // --- 4. NON-API ROUTES ---
  
  // Google Auth Callback (Note: This is NOT under /api)
  app.get("/auth/google/callback", async (req, res) => {
    const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
    const REDIRECT_URI = `${appUrl}/auth/google/callback`;
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send("<h1>Auth Failed</h1><p>No code provided</p>");
    }

    try {
      const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      });

      const { access_token } = tokenResponse.data;
      const userResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const { sub: googleId, email, name } = userResponse.data;

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .or(`google_id.eq.${googleId},email.eq.${email}`)
        .maybeSingle();

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
        const { data: updatedUser, error: updateError } = await supabase
          .from('profiles')
          .update({ google_id: googleId })
          .eq('id', user.id)
          .select()
          .single();
        if (updateError) throw updateError;
        user = updatedUser;
      }

      const userData = { id: user.id, email: user.email, name: user.name, avatarColor: user.avatar_color };

      res.send(`
        <html><body><script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: ${JSON.stringify(userData)} }, '*');
            window.close();
          } else { window.location.href = '/'; }
        </script></body></html>
      `);
    } catch (error: any) {
      console.error("Google Auth Error:", error.message);
      res.status(500).send("<h1>Auth Failed</h1>");
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
