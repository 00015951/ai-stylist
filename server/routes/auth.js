import { Router } from "express";
import { validateInitData } from "../auth/telegram.js";
import { db } from "../db/init.js";

const router = Router();

/**
 * POST /api/auth/telegram
 * Body: { initData: string } - Telegram Web App initData
 * Returns: { user, token? } - Telegram user from initData + DB user if exists
 */
router.post("/telegram", (req, res) => {
  const { initData } = req.body || {};
  const tgUser = validateInitData(initData);
  if (!tgUser) {
    return res.status(401).json({ error: "Invalid or expired initData" });
  }

  const telegramId = tgUser.id;
  const stmt = db.prepare(
    "SELECT id, telegram_id, phone, first_name, last_name, username, photo_url FROM users WHERE telegram_id = ?"
  );
  let user = stmt.get(telegramId);

  if (!user) {
    const insert = db.prepare(`
      INSERT INTO users (telegram_id, first_name, last_name, username)
      VALUES (?, ?, ?, ?)
    `);
    const r = insert.run(
      telegramId,
      tgUser.first_name || "",
      tgUser.last_name || "",
      tgUser.username || ""
    );
    user = {
      id: r.lastInsertRowid,
      telegram_id: telegramId,
      phone: null,
      first_name: tgUser.first_name || "",
      last_name: tgUser.last_name || "",
      username: tgUser.username || "",
      photo_url: null,
    };
  }

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
  });
});

export default router;
