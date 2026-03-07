import { Router } from "express";
import { requireTelegramAuth } from "../middleware/auth.js";
import { db } from "../db/init.js";

const router = Router();

/**
 * GET /api/user/profile
 * Returns full user profile: Telegram data + onboarding profile
 */
router.get("/profile", requireTelegramAuth, (req, res) => {
  const user = req.dbUser;
  const stmt = db.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  );
  const profile = stmt.get(user.id);

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  res.json({
    telegram: {
      id: user.id,
      telegramId: user.telegram_id,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      fullName: fullName || user.username || "User",
      photoUrl: user.photo_url,
    },
    onboarding: profile
      ? {
          height: profile.height,
          weight: profile.weight,
          gender: profile.gender,
          bodyType: profile.body_type,
          defaultEvent: profile.default_event,
          budget: profile.budget,
          stylePreferences: profile.style_preferences
            ? JSON.parse(profile.style_preferences)
            : [],
        }
      : null,
  });
});

/**
 * PUT /api/user/profile
 * Update onboarding profile
 */
router.put("/profile", requireTelegramAuth, (req, res) => {
  const user = req.dbUser;
  const {
    height,
    weight,
    gender,
    bodyType,
    defaultEvent,
    budget,
    stylePreferences,
  } = req.body || {};

  const h = height ?? 170;
  const w = weight ?? 70;
  const g = gender ?? "other";
  const bt = bodyType ?? "average";
  const de = defaultEvent ?? null;
  const b = budget ?? "medium";
  const prefs = Array.isArray(stylePreferences)
    ? JSON.stringify(stylePreferences)
    : "[]";

  const stmt = db.prepare(`
    INSERT INTO user_profiles (user_id, height, weight, gender, body_type, default_event, budget, style_preferences, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      height = excluded.height,
      weight = excluded.weight,
      gender = excluded.gender,
      body_type = excluded.body_type,
      default_event = excluded.default_event,
      budget = excluded.budget,
      style_preferences = excluded.style_preferences,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(user.id, h, w, g, bt, de, b, prefs);

  res.json({ ok: true });
});

export default router;
