import { Router } from "express";
import { requireTelegramAuth } from "../middleware/auth.js";
import { generateStyle } from "../services/groq.js";

const router = Router();

/**
 * POST /api/generate-style
 * Requires: X-Telegram-Init-Data header or body.initData
 * Body: { occasion, language?, profile?, stylePreferences?, weather?, trendInspired? }
 */
router.post("/", requireTelegramAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const { occasion } = body;
    if (!occasion?.trim()) {
      return res.status(400).json({ error: "Occasion description is required" });
    }

    const result = await generateStyle({
      occasion: occasion.trim(),
      language: body.language || "en",
      profile: body.profile,
      stylePreferences: body.stylePreferences || [],
      weather: body.weather,
      trendInspired: body.trendInspired,
    });

    res.json(result);
  } catch (err) {
    console.error("[generate-style]", err);
    res.status(500).json({ error: "Failed to generate style recommendation" });
  }
});

export default router;
