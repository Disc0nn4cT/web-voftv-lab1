import crypto from "crypto";
import { sendError } from "./errors.js";

function hashBody(body) {
  const json = JSON.stringify(body ?? {});
  return crypto.createHash("sha256").update(json).digest("hex");
}

export function idempotencyStore() {
  const store = new Map(); // key -> { bodyHash, status, responseJson }

  return (req, res, next) => {
    const key = req.header("Idempotency-Key");
    if (!key) return next(); // ідемпотентність тільки коли ключ є

    const bodyHash = hashBody(req.body);

    const existing = store.get(key);
    if (existing) {
      if (existing.bodyHash !== bodyHash) {
        return sendError(
          res,
          req,
          400,
          "idempotency_conflict",
          "Same Idempotency-Key used with different request body",
          { expectedBodyHash: existing.bodyHash, gotBodyHash: bodyHash }
        );
      }
      // Повертаємо 1-в-1 той самий результат, не створюючи дубль
      return res.status(existing.status).json(existing.responseJson);
    }

    // Підміняємо res.json щоб “запам’ятати” відповідь після успішного POST
    const originalJson = res.json.bind(res);
    res.json = (payload) => {
      // Запам’ятовуємо тільки успішні відповіді (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(key, { bodyHash, status: res.statusCode, responseJson: payload });
      }
      return originalJson(payload);
    };

    next();
  };
}
