import { Router } from "express";
import { db } from "../db/init.js";

const router = Router();

/**
 * GET /api/styles
 * Returns all available style categories
 */
router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM styles ORDER BY id").all();
  res.json({
    styles: rows.map((r) => ({
      id: r.id,
      key: r.key,
      name: { en: r.name_en, ru: r.name_ru, uz: r.name_uz },
      imageUrl: r.image_url,
      description: r.description,
    })),
  });
});

export default router;
