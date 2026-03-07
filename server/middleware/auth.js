import { validateInitData } from "../auth/telegram.js";
import { db } from "../db/init.js";

/**
 * Middleware: require valid Telegram initData and resolve user
 * Expects header: X-Telegram-Init-Data or body.initData
 */
export function requireTelegramAuth(req, res, next) {
  const initData =
    req.headers["x-telegram-init-data"] ||
    req.body?.initData ||
    req.query?.initData;
  const tgUser = validateInitData(initData);
  if (!tgUser) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing initData" });
  }
  const stmt = db.prepare("SELECT * FROM users WHERE telegram_id = ?");
  const user = stmt.get(tgUser.id);
  if (!user) {
    return res.status(404).json({ error: "User not found. Complete registration in bot first." });
  }
  req.telegramUser = tgUser;
  req.dbUser = user;
  next();
}
