/**
 * DB faylini o'chirib, server qayta ishga tushganda yangi yaratilishi uchun
 * Usage: node scripts/reset-db.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "stylist.db");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("[DB] stylist.db o'chirildi. Server qayta ishga tushganda yangi DB yaratiladi.");
} else {
  console.log("[DB] stylist.db topilmadi (allaqachon bo'sh).");
}
