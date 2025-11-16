
import express from 'express';

export function buildAdminRouter(db) {
  const r = express.Router();

  // POST /admin/reset — чистимо таблицю на тому самому з’єднанні
  r.post('/admin/reset', (_req, res) => {
    // трошки терпіння для busy-lock
    db.run('PRAGMA busy_timeout = 1000');

    // 1) видаляємо всі записи
    db.run('DELETE FROM signals', (err1) => {
      if (err1 && !/no such table/i.test(String(err1))) {
        console.error('[RESET] DELETE failed:', err1);
        return res.status(500).json({ ok: false, where: 'DELETE', error: String(err1.message || err1) });
      }

      // 2) скидаємо автоінкремент (якщо є системна таблиця)
      db.run('DELETE FROM sqlite_sequence WHERE name="signals"', (err2) => {
        if (err2 && !/no such table/i.test(String(err2))) {
          console.warn('[RESET] sequence reset skipped:', err2.message);
        }

        console.log('[RESET] signals table cleaned');
        return res.json({ ok: true });
      });
    });
  });

  return r;
}
