import { Router } from "express";
import { db } from "../db/init.js";
import { formatStyles } from "../lib/styles.js";

const router = Router();

/**
 * GET /api/styles — client va admin bir xil format
 */
router.get("/", (_req, res) => {
  res.set("Cache-Control", "no-store, no-cache, max-age=0");
  const rows = db.prepare("SELECT * FROM styles ORDER BY id").all();
  res.json(formatStyles(rows));
});

export default router;
