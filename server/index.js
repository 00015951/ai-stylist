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
import { startBotWithPolling } from "./bot/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const BASE_PORT = parseInt(process.env.PORT || "4444", 10);

// Ensure data dir exists
import fs from "fs";
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health
app.get("/health", (_, res) => res.json({ ok: true }));

// Public API (no auth)
app.use("/api/auth", authRoutes);
app.use("/api/styles", stylesRoutes);
app.use("/api/weather", weatherRoutes);

// Protected API (requires Telegram initData)
app.use("/api/generate-style", generateStyleRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wardrobe", wardrobeRoutes);

function startServer(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`[Server] Running on http://localhost:${port}`);
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

// Start server after DB init
ensureDb()
  .then(() => {
    if (process.env.BOT_TOKEN) {
      startBotWithPolling();
      console.log("[Bot] Polling started");
    }
    return tryPorts();
  })
  .catch((err) => {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
  });
