// server/scripts/reset-db.js
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

// Імпортуємо утиліту відкриття БД з проєкту
import { openDb } from '../src/infrastructure/db/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function main() {
  const db = openDb();

  // трішки терпіння для busy-lock
  db.serialize(() => {
    db.run('PRAGMA busy_timeout = 1000');

    // якщо таблиця існує – чистимо
    db.run('DELETE FROM signals', (err) => {
      if (err && !/no such table/i.test(String(err))) {
        console.error('❌ Failed to DELETE FROM signals:', err.message);
        process.exit(1);
      }
    });

    // скинути автоінкремент, якщо існує системна таблиця
    db.run('DELETE FROM sqlite_sequence WHERE name="signals"', (err) => {
      if (err && !/no such table/i.test(String(err))) {
        console.warn('ℹ️  sequence reset skipped:', err.message);
      }
    });
  });

  // Закривати конекшн не обовʼязково, але корисно
  await new Promise((res) => db.close(res));
  console.log('✅ Table cleaned.');

  // Пере-сіємо демодані тим самим seed.js
  const seedPath = path.join(__dirname, '..', 'seed.js');
  const result = spawnSync(process.execPath, [seedPath], { stdio: 'inherit' });

  if (result.status !== 0) {
    console.error('❌ Seeding failed.');
    process.exit(result.status ?? 1);
  }

  console.log('🎉 Reset complete: DB cleaned and seeded.');
}

main().catch((e) => {
  console.error('❌ Reset script crashed:', e);
  process.exit(1);
});
