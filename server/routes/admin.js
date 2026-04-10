import { Router } from "express";
import { requireAdminToken } from "../middleware/admin.js";
import { db } from "../db/init.js";
import { formatStyles, formatStyleRow } from "../lib/styles.js";

const router = Router();

router.get("/stats", requireAdminToken, (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
    const totalPro = db
      .prepare(
        "SELECT COUNT(*) as c FROM subscriptions WHERE plan = 'pro' AND (expires_at IS NULL OR expires_at > datetime('now'))"
      )
      .get().c;
    const totalOutfits = db.prepare("SELECT COUNT(*) as c FROM saved_outfits").get().c;
    const totalAiRequests = db.prepare("SELECT COUNT(*) as c FROM ai_requests").get().c;
    const usersLast7Days = db
      .prepare(
        "SELECT COUNT(*) as c FROM users WHERE created_at >= datetime('now', '-7 days')"
      )
      .get().c;
    const aiRequestsLast7Days = db
      .prepare(
        "SELECT COUNT(*) as c FROM ai_requests WHERE created_at >= datetime('now', '-7 days')"
      )
      .get().c;
    res.json({
      totalUsers,
      totalPro,
      totalOutfits,
      totalAiRequests,
      usersLast7Days,
      aiRequestsLast7Days,
    });
  } catch (err) {
    console.error("[admin/stats]", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats/daily", requireAdminToken, (req, res) => {
  try {
    const days = 7;
    const usersByDay = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= date('now', ?)
      GROUP BY date(created_at)
      ORDER BY date
    `).all(`-${days} days`);
    const aiByDay = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM ai_requests
      WHERE created_at >= date('now', ?)
      GROUP BY date(created_at)
      ORDER BY date
    `).all(`-${days} days`);
    const outfitsByDay = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM saved_outfits
      WHERE created_at >= date('now', ?)
      GROUP BY date(created_at)
      ORDER BY date
    `).all(`-${days} days`);
    const labels = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toISOString().slice(0, 10));
    }
    const fillMap = (arr, key) => {
      const map = {};
      arr.forEach((r) => { map[r.date] = r.count; });
      return labels.map((d) => ({ date: d, [key]: map[d] || 0 }));
    };
    res.json({
      labels,
      users: fillMap(usersByDay, "users"),
      aiRequests: fillMap(aiByDay, "aiRequests"),
      outfits: fillMap(outfitsByDay, "outfits"),
    });
  } catch (err) {
    console.error("[admin/stats/daily]", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", requireAdminToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.id, u.telegram_id, u.phone, u.first_name, u.last_name, u.username, u.photo_url, u.created_at,
             s.plan as subscription_plan, s.expires_at as subscription_expires
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ORDER BY u.created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    console.error("[admin/users]", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/users/:id", requireAdminToken, (req, res) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(parseInt(req.params.id, 10));
    if (!user) return res.status(404).json({ error: "User not found" });
    const profile = db.prepare("SELECT * FROM user_profiles WHERE user_id = ?").get(user.id);
    const sub = db.prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(user.id);
    res.json({ ...user, profile, subscription: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:id", requireAdminToken, (req, res) => {
  try {
    const r = db.prepare("DELETE FROM users WHERE id = ?").run(parseInt(req.params.id, 10));
    if (r.changes === 0) return res.status(404).json({ error: "User not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/subscriptions", requireAdminToken, (req, res) => {
  try {
    // Barcha foydalanuvchilar va ularning obuna holati
    const rows = db.prepare(`
      SELECT u.id as user_id, u.first_name, u.last_name, u.username, u.telegram_id, u.created_at as user_created_at,
             s.id, s.plan, s.started_at, s.expires_at, s.created_at
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ORDER BY s.plan = 'pro' DESC, u.created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/subscriptions", requireAdminToken, (req, res) => {
  try {
    const { userId, plan = "pro", expiresAt } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    db.prepare(
      "INSERT OR REPLACE INTO subscriptions (user_id, plan, expires_at, started_at) VALUES (?, ?, ?, datetime('now'))"
    ).run(userId, plan, expiresAt || null);
    const row = db.prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(userId);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/subscriptions/:id", requireAdminToken, (req, res) => {
  try {
    const { plan, expiresAt } = req.body;
    const id = parseInt(req.params.id, 10);
    db.prepare("UPDATE subscriptions SET plan = COALESCE(?, plan), expires_at = ? WHERE id = ?").run(
      plan,
      expiresAt ?? undefined,
      id
    );
    const row = db.prepare("SELECT * FROM subscriptions WHERE id = ?").get(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/subscriptions/:id", requireAdminToken, (req, res) => {
  try {
    const r = db.prepare("DELETE FROM subscriptions WHERE id = ?").run(parseInt(req.params.id, 10));
    if (r.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/ai-requests", requireAdminToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT ar.*, u.first_name, u.last_name, u.username
      FROM ai_requests ar
      LEFT JOIN users u ON ar.user_id = u.id
      ORDER BY ar.created_at DESC
      LIMIT 500
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/ai-requests/:id", requireAdminToken, (req, res) => {
  try {
    const r = db.prepare("DELETE FROM ai_requests WHERE id = ?").run(parseInt(req.params.id, 10));
    if (r.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/styles", requireAdminToken, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM styles ORDER BY id").all();
    res.json(formatStyles(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/styles", requireAdminToken, (req, res) => {
  try {
    const { key, name_en, name_ru, name_uz, image_url, description } = req.body;
    if (!key) return res.status(400).json({ error: "key required" });
    db.prepare(
      "INSERT INTO styles (key, name_en, name_ru, name_uz, image_url, description) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(key, name_en || null, name_ru || null, name_uz || null, image_url || null, description || null);
    const row = db.prepare("SELECT * FROM styles WHERE key = ?").get(key);
    res.status(201).json(formatStyleRow(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/styles/:id", requireAdminToken, (req, res) => {
  try {
    const { key, name_en, name_ru, name_uz, image_url, description } = req.body;
    const id = parseInt(req.params.id, 10);
    const row = db.prepare("SELECT * FROM styles WHERE id = ?").get(id);
    if (!row) return res.status(404).json({ error: "Not found" });
    const k = key ?? row.key;
    const ne = name_en ?? row.name_en;
    const nr = name_ru ?? row.name_ru;
    const nz = name_uz ?? row.name_uz;
    const img = image_url ?? row.image_url;
    const desc = description ?? row.description;
    db.prepare(
      "UPDATE styles SET key=?, name_en=?, name_ru=?, name_uz=?, image_url=?, description=? WHERE id = ?"
    ).run(k, ne, nr, nz, img, desc, id);
    const updated = db.prepare("SELECT * FROM styles WHERE id = ?").get(id);
    res.json(formatStyleRow(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/styles/:id", requireAdminToken, (req, res) => {
  try {
    const r = db.prepare("DELETE FROM styles WHERE id = ?").run(parseInt(req.params.id, 10));
    if (r.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/outfits", requireAdminToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT so.*, u.first_name, u.last_name, u.username
      FROM saved_outfits so
      JOIN users u ON so.user_id = u.id
      ORDER BY so.created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/outfits/:id", requireAdminToken, (req, res) => {
  try {
    const r = db.prepare("DELETE FROM saved_outfits WHERE id = ?").run(parseInt(req.params.id, 10));
    if (r.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
