import { verifyAdminToken } from "../auth/admin.js";

/**
 * Require valid admin token: Authorization: Bearer <token>
 * Sets req.adminId on success
 */
export function requireAdminToken(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const adminId = verifyAdminToken(token);
  if (!adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.adminId = adminId;
  next();
}
