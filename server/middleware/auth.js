import { validateInitData } from "../auth/telegram.js";
import { verifyTelegramSessionToken } from "../auth/telegram-session.js";
import { db } from "../db/init.js";

/**
 * Middleware: valid Telegram initData OR Bearer session token → req.dbUser
 * Priority: initData (header / body / query), then Authorization: Bearer
 */
export function requireTelegramAuth(req, res, next) {
  const initData =
    req.headers["x-telegram-init-data"] ||
    req.body?.initData ||
    req.query?.initData;
  const tgUser = validateInitData(initData);
  if (tgUser) {
    const user = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(tgUser.id);
    if (!user) {
      return res.status(404).json({ error: "User not found. Start the bot with /start first." });
    }
    req.telegramUser = tgUser;
    req.dbUser = user;
    return next();
  }

  const bearer =
    typeof req.headers.authorization === "string" && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice(7).trim()
      : null;
  if (bearer) {
    const session = verifyTelegramSessionToken(bearer);
    if (session) {
      const user = db
        .prepare("SELECT * FROM users WHERE id = ? AND telegram_id = ?")
        .get(session.userId, session.telegramId);
      if (user) {
        req.telegramUser = { id: user.telegram_id };
        req.dbUser = user;
        return next();
      }
    }
  }

  return res.status(401).json({ error: "Unauthorized: invalid or missing initData / session" });
}
