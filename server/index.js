import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ensureDb } from "./db/init.js";
import authRoutes from "./routes/auth.js";
import stylesRoutes from "./routes/styles.js";
import generateStyleRoutes from "./routes/generate-style.js";
import userRoutes from "./routes/user.js";
import wardrobeRoutes from "./routes/wardrobe.js";
import weatherRoutes from "./routes/weather.js";
import aiRoutes from "./routes/ai.js";
import visualStylistRoutes from "./routes/visual-stylist.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import adminRoutes from "./routes/admin.js";
import { startBotWithPolling } from "./bot/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const BASE_PORT = parseInt(process.env.PORT || "4444", 10);
let activeServer = null;
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://style-orpin.vercel.app",
];

function parseAllowedOrigins(raw) {
  if (!raw) return new Set(DEFAULT_ALLOWED_ORIGINS);
  const items = raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...items]);
}

const allowedOrigins = parseAllowedOrigins(process.env.CORS_ORIGINS);
const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server calls and same-origin requests without Origin.
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Telegram-Init-Data"],
  optionsSuccessStatus: 200,
};

// Admin API — cache o'chirilgan (304 va eski ma'lumot yo'q)
app.use("/api/admin", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});
app.set("etag", false);

// Ensure data dir exists
import fs from "fs";
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// Health
app.get("/health", (_, res) => res.json({ ok: true }));

// Public API (no auth)
app.use("/api/auth", authRoutes);
app.use("/api/styles", stylesRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/visual-stylist", visualStylistRoutes);

// Admin: login (public) + rest (token)
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

// Protected API (requires Telegram initData)
app.use("/api/generate-style", generateStyleRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wardrobe", wardrobeRoutes);

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`[Server] Running on http://localhost:${port}`);
      activeServer = server;
      resolve(server);
    });
    server.on("error", reject);
  });
}

async function tryPorts() {
  for (let i = 0; i < 10; i++) {
    const port = BASE_PORT + i;
    try {
      const server = await startServer(port);
      return server;
    } catch (err) {
      if (err.code === "EADDRINUSE") {
        console.log(`[Server] Port ${port} busy, trying ${port + 1}...`);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Ports ${BASE_PORT}-${BASE_PORT + 9} are all in use`);
}

function setupGracefulShutdown() {
  const shutdown = (signal) => {
    if (!activeServer) process.exit(0);
    try {
      activeServer.close(() => {
        console.log(`[Server] Closed (${signal})`);
        process.exit(0);
      });
      // If close hangs, force exit after short timeout
      setTimeout(() => process.exit(0), 1500).unref?.();
    } catch {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("beforeExit", () => shutdown("beforeExit"));
}

// Start server after DB init
ensureDb()
  .then(() => {
    setupGracefulShutdown();
    const botPollingEnabled = process.env.BOT_POLLING === "1" || process.env.BOT_POLLING === "true";
    if (process.env.BOT_TOKEN && botPollingEnabled) {
      startBotWithPolling();
      console.log("[Bot] Polling started");
    }
    return tryPorts();
  })
  .catch((err) => {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
  });
