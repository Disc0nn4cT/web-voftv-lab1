// оновлено на 4 лабі
import express from 'express';
import { CreateSignal } from '../../application/signals/CreateSignal.js';
import { GetSignals } from '../../application/signals/GetSignals.js';
import { GetSignalById } from '../../application/signals/GetSignalById.js';
import { UpdateSignal } from '../../application/signals/UpdateSignal.js';
import { DeleteSignal } from '../../application/signals/DeleteSignal.js';

export function buildSignalsRouter(repo) {
  const r = express.Router();

  // Ігровий ендпоінт для Coordinates panel (GET /signal?az=&el=)
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

  // GET /signals?limit=50 — список останніх сигналів
  r.get('/signals', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
      const items = await GetSignals(repo, { limit });
      res.json(items);
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  // POST /signals — створення сигналу (через CreateSignal)
  r.post('/signals', async (req, res) => {
    try {
      const { az, el } = req.body || {};
      const azInt = parseInt(az, 10);
      const elInt = parseInt(el, 10);
      const result = await CreateSignal(repo, { az: azInt, el: elInt });
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  });

  // GET /signals/:id — отримати сигнал за id
  r.get('/signals/:id', async (req, res) => {
    try {
      const signal = await GetSignalById(repo, { id: req.params.id });
      if (!signal) {
        return res.status(404).json({ error: 'Signal not found' });
      }
      res.json(signal);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  });

  // PATCH /signals/:id — часткове оновлення сигналу
  r.patch('/signals/:id', async (req, res) => {
    try {
      const body = req.body || {};
      const result = await UpdateSignal(repo, {
        id: req.params.id,
        strength: body.strength,
        // приймаємо і hitPercent, і hit_percent
        hitPercent: body.hitPercent ?? body.hit_percent,
        payload: body.payload,
      });

      if (!result) {
        return res.status(404).json({ error: 'Signal not found' });
      }

      res.json(result);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  });

  // DELETE /signals/:id — видалити сигнал
  r.delete('/signals/:id', async (req, res) => {
    try {
      const ok = await DeleteSignal(repo, { id: req.params.id });
      if (!ok) {
        return res.status(404).json({ error: 'Signal not found' });
      }
      res.status(204).send();
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  });

  // Health check
  r.get('/health', (_req, res) => res.json({ ok: true }));

  return r;
}
