import { Router } from "express";
import { requireTelegramAuth } from "../middleware/auth.js";
import { db } from "../db/init.js";

const router = Router();

/**
 * GET /api/wardrobe
 * Returns user's saved outfits
 */
router.get("/", requireTelegramAuth, (req, res) => {
  const user = req.dbUser;
  const rows = db
    .prepare(
      "SELECT id, occasion, image_url, outfit_json, persona_summary, shopping_json, created_at FROM saved_outfits WHERE user_id = ? ORDER BY created_at DESC"
    )
    .all(user.id);

  const favorites = rows.map((r) => ({
    id: String(r.id),
    occasion: r.occasion,
    imageUrl: r.image_url,
    outfit: JSON.parse(r.outfit_json),
    personaSummary: r.persona_summary,
    shopping: r.shopping_json ? JSON.parse(r.shopping_json) : undefined,
    createdAt: r.created_at,
  }));

  res.json({ favorites });
});

/**
 * POST /api/wardrobe
 * Save outfit to favorites
 */
router.post("/", requireTelegramAuth, (req, res) => {
  const user = req.dbUser;
  const { occasion, imageUrl, outfit, personaSummary, shopping } = req.body || {};
  if (!occasion || !outfit) {
    return res.status(400).json({ error: "occasion and outfit required" });
  }

  const stmt = db.prepare(`
    INSERT INTO saved_outfits (user_id, occasion, image_url, outfit_json, persona_summary, shopping_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const r = stmt.run(
    user.id,
    occasion,
    imageUrl || null,
    JSON.stringify(outfit),
    personaSummary || null,
    shopping ? JSON.stringify(shopping) : null
  );

  res.status(201).json({
    id: String(r.lastInsertRowid),
    occasion,
    imageUrl,
    outfit,
    personaSummary,
    shopping,
    createdAt: new Date().toISOString(),
  });
});

/**
 * DELETE /api/wardrobe/:id
 */
router.delete("/:id", requireTelegramAuth, (req, res) => {
  const user = req.dbUser;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const stmt = db.prepare(
    "DELETE FROM saved_outfits WHERE id = ? AND user_id = ?"
  );
  const r = stmt.run(id, user.id);
  if (r.changes === 0) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json({ ok: true });
});

export default router;
