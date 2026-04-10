import { Router } from "express";
import { createAdminToken } from "../auth/admin.js";

const router = Router();

const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "admin111";

/**
 * POST /api/admin/auth/login
 * Token-based: login=admin, parol=admin111 (DB ishlatilmaydi)
 * Returns: { token, admin: { login } }
 */
router.post("/login", (req, res) => {
  try {
    const { login, password } = req.body || {};
    const loginStr = login != null ? String(login).trim() : "";
    const passwordStr = password != null ? String(password) : "";
    if (!loginStr || !passwordStr) {
      return res.status(400).json({ error: "login va parol kerak" });
    }
    if (loginStr !== ADMIN_LOGIN || passwordStr !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }
    const token = createAdminToken(1);
    res.json({
      token,
      admin: { id: 1, login: ADMIN_LOGIN },
    });
  } catch (err) {
    console.error("[admin/auth/login]", err);
    const msg = err?.message || "Xato";
    res.status(500).json({ error: process.env.NODE_ENV === "development" ? msg : "Xato" });
  }
});

export default router;
