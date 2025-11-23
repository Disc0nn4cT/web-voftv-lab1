// було оновлено на 4 лабі
import { ISignalRepo } from '../../domain/signals/ISignalRepo.js';

export class SignalRepoSqlite extends ISignalRepo {
  constructor(db) {
    super();
    this.db = db;
  }

  create(signal) {
    const db = this.db;
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO signals(az,el,strength,hit_percent,payload,created_at)
                   VALUES (?,?,?,?,?,?)`;
      db.run(
        sql,
        [signal.az, signal.el, signal.strength, signal.hit_percent, signal.payload, signal.created_at],
        function (err) {
          if (err) return reject(err);
          resolve({ ...signal, id: this.lastID });
        }
      );
    });
  }

  findRecent(limit = 50) {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, az, el, strength, hit_percent, payload, created_at
         FROM signals ORDER BY id DESC LIMIT ?`,
        [limit],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });
  }

  findById(id) {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id, az, el, strength, hit_percent, payload, created_at
         FROM signals WHERE id = ?`,
        [id],
        (err, row) => (err ? reject(err) : resolve(row || null))
      );
    });
  }

  update(id, patch) {
    const db = this.db;
    const allowed = ['strength', 'hit_percent', 'payload'];
    const sets = [];
    const values = [];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(patch, key) && patch[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(patch[key]);
      }
    }

    if (sets.length === 0) {
      // немає полів для оновлення
      return Promise.resolve(null);
    }

    const sql = `UPDATE signals SET ${sets.join(', ')} WHERE id = ?`;
    values.push(id);

    return new Promise((resolve, reject) => {
      db.run(sql, values, function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return resolve(null);

        db.get(
          `SELECT id, az, el, strength, hit_percent, payload, created_at
           FROM signals WHERE id = ?`,
          [id],
          (err2, row) => (err2 ? reject(err2) : resolve(row || null))
        );
      });
    });
  }

  delete(id) {
    const db = this.db;
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM signals WHERE id = ?`,
        [id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }
}
