import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../db.sqlite');

export function openDb() {
  const db = new sqlite3.Database(DB_PATH);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      az INTEGER, el INTEGER,
      strength INTEGER, hit_percent INTEGER,
      payload TEXT,
      created_at TEXT
    )`);
  });
  return db;
}
