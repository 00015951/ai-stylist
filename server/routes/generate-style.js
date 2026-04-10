import { Router } from "express";
import { requireTelegramAuth } from "../middleware/auth.js";
import { generateStyle } from "../services/groq.js";
import { db } from "../db/init.js";

const router = Router();

/**
 * POST /api/generate-style
 * Requires: X-Telegram-Init-Data header or body.initData
 * Body: { occasion, language?, profile?, stylePreferences?, weather?, trendInspired? }
 */
const FREE_AI_LIMIT = Number(process.env.FREE_AI_LIMIT || 100);

router.post("/", requireTelegramAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const { occasion } = body;
    if (!occasion?.trim()) {
      return res.status(400).json({ error: "Occasion description is required" });
    }

    const userId = req.dbUser?.id;
    if (userId) {
      try {
        db.prepare("INSERT OR IGNORE INTO subscriptions (user_id, plan, started_at) VALUES (?, 'free', datetime('now'))").run(userId);
      } catch (_) {}
      const sub = db.prepare("SELECT plan, expires_at FROM subscriptions WHERE user_id = ?").get(userId);
      const isPro = sub && sub.plan === "pro" && (!sub.expires_at || new Date(sub.expires_at) > new Date());
      if (!isPro) {
        const count = db.prepare("SELECT COUNT(*) as c FROM ai_requests WHERE user_id = ?").get(userId).c;
        if (count >= FREE_AI_LIMIT) {
          return res.status(402).json({
            error: "UPGRADE_TO_PRO",
            message: "Free limit exceeded. Upgrade to Pro for unlimited AI styling.",
          });
        }
      }
    }

    const result = await generateStyle({
      occasion: occasion.trim(),
      language: body.language || "en",
      profile: body.profile,
      stylePreferences: body.stylePreferences || [],
      weather: body.weather,
      trendInspired: body.trendInspired,
    });

    try {
      const preview = result.personaSummary?.slice(0, 200) || result.occasion || "";
      db.prepare(
        "INSERT INTO ai_requests (user_id, occasion, response_preview) VALUES (?, ?, ?)"
      ).run(req.dbUser?.id ?? null, occasion?.trim() ?? null, preview);
    } catch (_) {}

    res.json(result);
  } catch (err) {
    console.error("[generate-style]", err);
    res.status(500).json({ error: "Failed to generate style recommendation" });
  }
});

export default router;
