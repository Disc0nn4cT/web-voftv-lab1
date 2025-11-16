import { ISignalRepo } from '../../domain/signals/ISignalRepo.js';

export class SignalRepoSqlite extends ISignalRepo {
  constructor(db) {
    super(); this.db = db;
  }

  create(signal) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO signals(az,el,strength,hit_percent,payload,created_at)
                   VALUES (?,?,?,?,?,?)`;
      this.db.run(sql,
        [signal.az, signal.el, signal.strength, signal.hit_percent, signal.payload, signal.created_at],
        function (err) {
          if (err) return reject(err);
          resolve({ ...signal, id: this.lastID });
        });
    });
  }

  findRecent(limit = 50) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT id, az, el, strength, hit_percent, payload, created_at
         FROM signals ORDER BY id DESC LIMIT ?`,
        [limit],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });
  }
}
