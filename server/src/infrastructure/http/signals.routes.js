import express from "express";

import { CreateSignal } from "../../application/signals/CreateSignal.js";
import { GetSignals } from "../../application/signals/GetSignals.js";
import { GetSignalById } from "../../application/signals/GetSignalById.js";
import { UpdateSignal } from "../../application/signals/UpdateSignal.js";
import { DeleteSignal } from "../../application/signals/DeleteSignal.js";

// lab5
import { rateLimit } from "./middleware/rateLimit.js";
import { idempotencyStore } from "./middleware/idempotency.js";
import { HttpError } from "./middleware/errors.js";

export function buildSignalsRouter(repo) {
  const r = express.Router();

  // lab5: rate-limit only for POST /signals
  const postSignalsRateLimit = rateLimit({
    windowMs: 15_000,
    max: 3,
    retryAfterSeconds: 10,
  });

  // lab5: idempotency store (works only if Idempotency-Key header exists)
  const idem = idempotencyStore();

  // === GAME endpoint ===
  r.get("/signal", async (req, res, next) => {
    try {
      const az = Number.parseInt(req.query.az, 10);
      const el = Number.parseInt(req.query.el, 10);

      if (!Number.isFinite(az) || !Number.isFinite(el)) {
        throw new HttpError(400, "invalid_input", "az and el must be numbers");
      }

      const result = await CreateSignal(repo, { az, el });
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  // === CRUD ===
  r.get("/signals", async (req, res, next) => {
    try {
      const limit = req.query.limit ? Number.parseInt(req.query.limit, 10) : undefined;
      const items = await GetSignals(repo, { limit });
      res.json(items);
    } catch (e) {
      next(e);
    }
  });

  r.post("/signals", postSignalsRateLimit, idem, async (req, res, next) => {
   console.log("POST /signals content-type:", req.headers["content-type"]);
  console.log("POST /signals body:", req.body);
    try {
      const { az, el } = req.body || {};
      const azInt = Number.parseInt(az, 10);
      const elInt = Number.parseInt(el, 10);

      if (!Number.isFinite(azInt) || !Number.isFinite(elInt)) {
        throw new HttpError(400, "invalid_input", "az and el must be numbers");
      }

      const result = await CreateSignal(repo, { az: azInt, el: elInt });
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  });

  r.get("/signals/:id", async (req, res, next) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) {
        throw new HttpError(400, "invalid_id", "id must be an integer");
      }

      const signal = await GetSignalById(repo, { id });
      if (!signal) throw new HttpError(404, "not_found", "Signal not found");

      res.json(signal);
    } catch (e) {
      next(e);
    }
  });

  r.patch("/signals/:id", async (req, res, next) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) {
        throw new HttpError(400, "invalid_id", "id must be an integer");
      }

      const body = req.body || {};
      const result = await UpdateSignal(repo, {
        id,
        strength: body.strength,
        hitPercent: body.hitPercent ?? body.hit_percent,
        payload: body.payload,
      });

      if (!result) throw new HttpError(404, "not_found", "Signal not found");

      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  r.delete("/signals/:id", async (req, res, next) => {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) {
        throw new HttpError(400, "invalid_id", "id must be an integer");
      }

      const ok = await DeleteSignal(repo, { id });
      if (!ok) throw new HttpError(404, "not_found", "Signal not found");

      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });

  // Health check
  r.get("/health", (_req, res) => res.json({ ok: true }));

  return r;
}
