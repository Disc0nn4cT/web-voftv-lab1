import { sendError } from "./errors.js";

export function rateLimit({ windowMs, max, retryAfterSeconds }) {
  const hits = new Map(); // key -> { count, windowStart }

  return (req, res, next) => {
    // простий ключ: IP + шлях (щоб ліміт був на endpoint)
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();

    const item = hits.get(key);
    if (!item || now - item.windowStart >= windowMs) {
      hits.set(key, { count: 1, windowStart: now });
      return next();
    }

    item.count += 1;
    if (item.count <= max) return next();

    res.setHeader("Retry-After", String(retryAfterSeconds));
    return sendError(
      res,
      req,
      429,
      "too_many_requests",
      "Rate limit exceeded. Please retry later.",
      { retryAfterSeconds }
    );
  };
}
