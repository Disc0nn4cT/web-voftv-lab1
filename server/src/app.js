import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDb } from './infrastructure/db/sqlite.js';
import { SignalRepoSqlite } from './infrastructure/db/SignalRepoSqlite.js';
import { buildSignalsRouter } from './infrastructure/http/signals.routes.js';
import { buildAdminRouter } from './infrastructure/http/admin.routes.js'; // 

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const db = openDb();
const repo = new SignalRepoSqlite(db);

// статичний клієнт
app.use(express.static(path.join(__dirname, '../../client')));

// API
app.use('/', buildSignalsRouter(repo));
app.use('/', buildAdminRouter(db)); //

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
