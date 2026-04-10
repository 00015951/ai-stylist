/**
 * POST /api/visual-stylist
 * Body: { request: string, language?: "uz"|"ru"|"en", profile?: {...} }
 * Returns: { summary, looks: [...] }
 */

import express from "express";
import { generateVisualLooks } from "../services/visual-stylist.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { request: userRequest, language = "uz", profile = {} } = req.body;

    if (!userRequest?.trim()) {
      return res.status(400).json({ error: "request is required" });
    }

    console.log(`[VisualStylist] "${userRequest}" (${language})`);

    const result = await generateVisualLooks(userRequest.trim(), language, profile);

    return res.json(result);
  } catch (err) {
    console.error("[VisualStylist Route] Error:", err?.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
