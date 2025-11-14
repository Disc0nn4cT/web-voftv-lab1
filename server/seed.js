const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS signals`);
  db.run(`
    CREATE TABLE signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      az INTEGER NOT NULL,
      el INTEGER NOT NULL,
      strength INTEGER NOT NULL,
      hit_percent INTEGER NOT NULL,
      name TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  console.log('DB ready with new schema at', DB_PATH);
});

db.close();