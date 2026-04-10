import crypto from "crypto";

const BOT_TOKEN = process.env.BOT_TOKEN;
const MAX_AGE_SEC = 86400; // 24 hours

/**
 * Validate Telegram Web App initData
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData) {
  if (!initData || !BOT_TOKEN) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const authDate = params.get("auth_date");
    params.delete("hash");
    if (!hash || !authDate) return null;
    const authTs = parseInt(authDate, 10);
    if (Date.now() / 1000 - authTs > MAX_AGE_SEC) return null;
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(BOT_TOKEN)
      .digest();
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");
    if (calculatedHash !== hash) return null;
    const userStr = params.get("user");
    if (!userStr) return null;
    return JSON.parse(decodeURIComponent(userStr));
  } catch {
    return null;
  }
}
