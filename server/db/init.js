import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "stylist.db");

let dbInstance = null;

function createDbWrapper(db) {
  return {
    exec(sql) {
      db.run(sql);
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

  const styles = [
    { key: "casual", name_en: "Casual", name_ru: "Повседневный", name_uz: "Kundalik", image_url: "https://stockmann.ru/istk/kJ7eucI5BKCWPSIXgC6-J6sYcfhkiSpQRKukKT5p4jA/rs:fill:747::1/g:no/bG9jYWw6Ly8vdXBsb2FkLy9jbXMvc3RhdGljL2Zhc2hpb24tYmxvZy9hcnRpY2xlLzY3ZDk4YzkzNzRkMWMyNzA2OTAzZDMyYy9ibG9jay82N2Q5OGU1OTBhNzliMWQ1MjgwMjVkZTMvaWVhdGlYN3dYMDg1NnAwSU9ZWWw0MWY3SUFRYldKcmN1c2VURWNtcy5qcGc.jpg" },
    { key: "business", name_en: "Business", name_ru: "Деловой", name_uz: "Biznes", image_url: "https://raslov.ua/wp-content/uploads/2022/02/aksessuary-pod-delovoj-stil-zhenshhiny-min.jpg" },
    { key: "streetwear", name_en: "Streetwear", name_ru: "Стритвир", name_uz: "Streetwear", image_url: "https://techwear-outfits.com/cdn/shop/files/womens-streetwear-pants-techwear-458.webp" },
    { key: "elegant", name_en: "Elegant", name_ru: "Элегантный", name_uz: "Zebozor", image_url: "https://www.myfashionlife.com/wp-content/uploads/2023/03/elegantandclassy_5-1-819x1024.jpg" },
    { key: "sporty", name_en: "Sporty", name_ru: "Спортивный", name_uz: "Sport", image_url: "https://images.pexels.com/photos/7235677/pexels-photo-7235677.jpeg" },
    { key: "bohemian", name_en: "Bohemian", name_ru: "Бохо", name_uz: "Bohemian", image_url: "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg" },
  ];
  for (const s of styles) {
    try {
      db.prepare(
        "INSERT OR IGNORE INTO styles (key, name_en, name_ru, name_uz, image_url) VALUES (?, ?, ?, ?, ?)"
      ).run(s.key, s.name_en, s.name_ru, s.name_uz, s.image_url);
    } catch (_) {}
  }

  // Persist on close
  const orig = db;
  const save = () => {
    const data = dbInstance.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  };
  process.on("beforeExit", save);

  return orig;
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
