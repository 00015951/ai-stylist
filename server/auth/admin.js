import crypto from "crypto";

const SECRET = process.env.ADMIN_SECRET || "virtual-ai-stylist-admin-secret-change-in-production";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function base64urlEncode(buf) {
  return Buffer.from(buf).toString("base64url");
}
function base64urlDecode(str) {
  return Buffer.from(str, "base64url");
}

export function createAdminToken(adminId) {
  const payload = {
    id: adminId,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.trim().split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(base64urlDecode(payloadB64).toString("utf8"));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload.id ?? null;
  } catch {
    return null;
  }
}
