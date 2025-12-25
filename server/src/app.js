import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";

import { buildSignalsRouter } from "./infrastructure/http/signals.routes.js";
import { SignalRepoSqlite } from "./infrastructure/db/SignalRepoSqlite.js";

// lab5 middleware
import { requestId } from "./infrastructure/http/middleware/requestId.js";
import { notFound, errorHandler, sendError } from "./infrastructure/http/middleware/errors.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- DB (SQLite) ----
sqlite3.verbose();

const dataDir = path.join(__dirname, "../data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "app.db");
const db = new sqlite3.Database(dbPath);

// маленькі promisify-хелпери
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function initDb() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      az INTEGER NOT NULL,
      el INTEGER NOT NULL,
      strength INTEGER DEFAULT 0,
      hit_percent INTEGER DEFAULT 0,
      payload TEXT DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);
}

// ініціалізація БД (без async/await на верхньому рівні)
initDb().catch((e) => {
  console.error("DB init failed:", e);
});

// ---- Middleware order (Lab5 важливий порядок) ----
// 1) X-Request-Id — ДО роутерів
app.use(requestId);
// 2) JSON body parser — ДО роутерів
app.use(express.json());


// ---- API ----
const repo = new SignalRepoSqlite(db);
app.use(buildSignalsRouter(repo));

// Бонус: reset для UI (якщо ти ним користуєшся)
app.post("/admin/reset", async (req, res, next) => {
  
  try {
    await dbRun("DELETE FROM signals");
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ---- Static client ----
const clientDir = path.join(__dirname, "../../client");
app.use(express.static(clientDir));

// ---- 404 + error handler (Lab5: тільки в кінці) ----
app.use(notFound);
app.use(errorHandler);

// ---- start server if run directly ----
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
  });
}

export default app;
