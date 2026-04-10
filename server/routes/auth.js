import { Router } from "express";
import { validateInitData } from "../auth/telegram.js";
import { createTelegramSessionToken } from "../auth/telegram-session.js";
import { db } from "../db/init.js";

const router = Router();

/**
 * POST /api/auth/telegram
 * Body: { initData: string } - Telegram Web App initData
 * Returns: { user, token } — token = Bearer sessiya (7 kun), Mini App API uchun
 */
router.post("/telegram", (req, res) => {
  const { initData } = req.body || {};
  const tgUser = validateInitData(initData);
  if (!tgUser) {
    return res.status(401).json({ error: "Invalid or expired initData" });
  }

  const telegramId = tgUser.id;
  const photoUrl = tgUser.photo_url ? String(tgUser.photo_url) : null;
  const fn = tgUser.first_name || "";
  const ln = tgUser.last_name || "";
  const un = tgUser.username || "";

  const stmt = db.prepare(
    "SELECT id, telegram_id, phone, first_name, last_name, username, photo_url FROM users WHERE telegram_id = ?"
  );
  let user = stmt.get(telegramId);

  if (!user) {
    const insert = db.prepare(`
      INSERT INTO users (telegram_id, first_name, last_name, username, photo_url)
      VALUES (?, ?, ?, ?, ?)
    `);
    const r = insert.run(telegramId, fn, ln, un, photoUrl);
    const newId = r.lastInsertRowid;
    try {
      db.prepare(
        "INSERT OR IGNORE INTO subscriptions (user_id, plan, started_at) VALUES (?, 'free', datetime('now'))"
      ).run(newId);
    } catch (_) {}
    user = {
      id: newId,
      telegram_id: telegramId,
      phone: null,
      first_name: fn,
      last_name: ln,
      username: un,
      photo_url: photoUrl,
    };
  } else {
    try {
      db.prepare(`
        UPDATE users SET
          first_name = ?,
          last_name = ?,
          username = ?,
          photo_url = COALESCE(?, photo_url),
          updated_at = datetime('now')
        WHERE telegram_id = ?
      `).run(fn, ln, un, photoUrl, telegramId);
      user = {
        ...user,
        first_name: fn,
        last_name: ln,
        username: un,
        photo_url: photoUrl || user.photo_url,
      };
    } catch (_) {}
  }

  const token = createTelegramSessionToken(user.id, user.telegram_id);
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  res.json({
    user: {
      id: user.id,
      telegramId: user.telegram_id,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      fullName: fullName || user.username || "User",
      photoUrl: user.photo_url,
    },
    ...(token ? { token } : {}),
  });
});

export default router;
