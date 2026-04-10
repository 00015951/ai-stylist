import crypto from "crypto";

const SECRET =
  process.env.TELEGRAM_SESSION_SECRET ||
  process.env.SESSION_SECRET ||
  (process.env.BOT_TOKEN ? `${process.env.BOT_TOKEN}:tg-mini-app` : null);

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Long-lived session token for Mini App API (Bearer) — initData 24 soatdan keyin ham ishlaydi.
 */
export function createTelegramSessionToken(userId, telegramId) {
  if (!SECRET) return null;
  const payload = {
    uid: Number(userId),
    tid: Number(telegramId),
    exp: Date.now() + TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyTelegramSessionToken(token) {
  if (!SECRET || !token || typeof token !== "string") return null;
  const parts = token.trim().split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!payload.uid || !payload.tid) return null;
    if (payload.exp && payload.exp < Date.now()) return null;
    return { userId: payload.uid, telegramId: payload.tid };
  } catch {
    return null;
  }
}
