import express from 'express';
import { CreateSignal } from '../../application/signals/CreateSignal.js';
import { GetSignals } from '../../application/signals/GetSignals.js';

export function buildSignalsRouter(repo) {
  const r = express.Router();

  r.get('/signal', async (req, res) => {
    try {
      const az = parseInt(req.query.az, 10);
      const el = parseInt(req.query.el, 10);
      const result = await CreateSignal(repo, { az, el });
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  });

  r.get('/signals', async (_req, res) => {
    try {
      const items = await GetSignals(repo, {});
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  r.get('/health', (_req, res) => res.json({ ok: true }));

  return r;
}
