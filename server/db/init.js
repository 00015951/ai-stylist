import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const ADMIN_SALT = "virtual-ai-stylist-admin-salt";
export function hashAdminPassword(password) {
  return crypto.pbkdf2Sync(password, ADMIN_SALT, 100000, 64, "sha512").toString("hex");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "stylist.db");

let dbInstance = null;
let persistDb = () => {};

function createDbWrapper(db) {
  return {
    exec(sql) {
      db.run(sql);
      persistDb();
    },
    prepare(sql) {
      const stmt = db.prepare(sql);
      return {
        run(...params) {
          if (params.length) stmt.bind(params);
          stmt.step();
          stmt.free();
          const changes = dbInstance.getRowsModified();
          const lid = dbInstance.exec("SELECT last_insert_rowid()");
          const lastInsertRowid = lid.length && lid[0].values?.[0]?.[0] != null ? lid[0].values[0][0] : 0;
          persistDb();
          return { lastInsertRowid, changes };
        },
        get(...params) {
          if (params.length) stmt.bind(params);
          const row = stmt.step() ? stmt.getAsObject() : null;
          stmt.free();
          return row;
        },
        all(...params) {
          if (params.length) stmt.bind(params);
          const rows = [];
          while (stmt.step()) rows.push(stmt.getAsObject());
          stmt.free();
          return rows;
        },
      };
    },
  };
}

export async function initDb() {
  if (dbInstance) return dbInstance;
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(buf);
  } else {
    dbInstance = new SQL.Database();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = createDbWrapper(dbInstance);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE NOT NULL,
      phone TEXT,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      height INTEGER DEFAULT 170,
      weight INTEGER DEFAULT 70,
      gender TEXT DEFAULT 'other',
      body_type TEXT DEFAULT 'average',
      default_event TEXT,
      budget TEXT DEFAULT 'medium',
      style_preferences TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_outfits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      occasion TEXT NOT NULL,
      image_url TEXT,
      outfit_json TEXT NOT NULL,
      persona_summary TEXT,
      shopping_json TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS styles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name_en TEXT,
      name_ru TEXT,
      name_uz TEXT,
      image_url TEXT,
      description TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'free',
      started_at DATETIME DEFAULT (datetime('now')),
      expires_at DATETIME,
      created_at DATETIME DEFAULT (datetime('now')),
      UNIQUE(user_id)
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      occasion TEXT,
      response_preview TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  // Indexes — tez qidiruv uchun
  try {
    db.exec("CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_styles_key ON styles(key)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_ai_requests_created ON ai_requests(created_at)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_saved_outfits_user ON saved_outfits(user_id)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id)");
  } catch (_) {}

  const defaultAdminHash = hashAdminPassword("admin111");
  try {
    db.prepare(
      "INSERT OR IGNORE INTO admin_users (login, password_hash) VALUES (?, ?)"
    ).run("admin", defaultAdminHash);
    // Ensure default password is always admin111 (e.g. after reset)
    db.prepare(
      "UPDATE admin_users SET password_hash = ? WHERE login = 'admin'"
    ).run(defaultAdminHash);
  } catch (_) {}

  const styles = [
    {
      key: "casual",
      name_en: "Casual",
      name_ru: "Повседневный",
      name_uz: "Kundalik",
      image_url:
        "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&h=800&fit=crop&q=85",
    },
    {
      key: "business",
      name_en: "Business",
      name_ru: "Деловой",
      name_uz: "Biznes",
      image_url:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&q=85",
    },
    {
      key: "streetwear",
      name_en: "Streetwear",
      name_ru: "Стритвир",
      name_uz: "Streetwear",
      image_url:
        "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=800&fit=crop&q=85",
    },
    {
      key: "elegant",
      name_en: "Elegant",
      name_ru: "Элегантный",
      name_uz: "Zebozor",
      image_url:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=85",
    },
    {
      key: "sporty",
      name_en: "Sporty",
      name_ru: "Спортивный",
      name_uz: "Sport",
      image_url:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=800&fit=crop&q=85",
    },
    {
      key: "bohemian",
      name_en: "Bohemian",
      name_ru: "Бохо",
      name_uz: "Bohemian",
      image_url:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&q=85",
    },
  ];
  for (const s of styles) {
    try {
      // INSERT or UPDATE — always keeps image_url fresh (fixes stockmann.ru 403 etc.)
      db.prepare(
        "INSERT INTO styles (key, name_en, name_ru, name_uz, image_url) VALUES (?, ?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET image_url=excluded.image_url, name_en=excluded.name_en, name_ru=excluded.name_ru, name_uz=excluded.name_uz"
      ).run(s.key, s.name_en, s.name_ru, s.name_uz, s.image_url);
    } catch (_) {}
  }

  // Persist to disk after writes and on process shutdown.
  const save = () => {
    const data = dbInstance.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  };
  persistDb = save;
  process.on("beforeExit", save);
  process.on("exit", save);
  process.on("SIGINT", save);
  process.on("SIGTERM", save);

  return db;
}

// Sync wrapper - for routes we need db to be ready
let dbReady = null;
export const db = {
  prepare(sql) {
    if (!dbReady) throw new Error("DB not initialized. Call initDb() first.");
    return dbReady.prepare(sql);
  },
  exec(sql) {
    if (!dbReady) throw new Error("DB not initialized.");
    dbReady.exec(sql);
  },
};

export async function ensureDb() {
  if (!dbReady) {
    dbReady = await initDb();
  }
  return dbReady;
}
