const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const DB_PATH = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_PATH);

app.use((req, _res, next) => { console.log(req.method, req.url); next(); });

function seededPick(arr, seed){ return arr[seed % arr.length]; }
const ADJ  = ['Distant','Binary','Solar','Ghost','Prime','Silent','Crimson','Azure','Echo','Nova','Deep'];
const NOUN = ['Whisper','Beacon','Drift','Node','Vector','Pulse','Quasar','Relay','Archive','Signal','Dust'];

app.get('/signal', (req, res) => {
  const az = Number(req.query.az ?? 0);
  const el = Number(req.query.el ?? 0);

  const normAz = ((az % 360) + 360) % 360;
  const normEl = Math.max(0, Math.min(90, el));
  const seed = (normAz * 73856093 + normEl * 19349663) % 9973;
  const strength = Math.round((Math.sin(seed) * 0.5 + 0.5) * 100);
  const hitPercent = strength;                       // MVP: влучання = сила
  const name = `${seededPick(ADJ, seed)} ${seededPick(NOUN, seed+7)}`; // детерміновано
  const payload = `SIG-${normAz}-${normEl}-${strength}`;

  db.run(
    `INSERT INTO signals(az, el, strength, hit_percent, name, payload, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime("now"))`,
    [normAz, normEl, strength, hitPercent, name, payload],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB_INSERT_ERROR' });
      res.json({ id: this.lastID, az: normAz, el: normEl, strength, hit_percent: hitPercent, name, payload });
    }
  );
});

app.get('/signals', (_req, res) => {
  db.all(
    `SELECT id, az, el, strength, hit_percent, name, payload, created_at
     FROM signals ORDER BY id DESC LIMIT 50`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB_READ_ERROR' });
      res.json(rows);
    }
  );
});

app.use('/', express.static(path.join(__dirname, '..', 'client')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
