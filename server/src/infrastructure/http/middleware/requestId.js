import crypto from "crypto";

export function requestId(req, res, next) {
  const incoming = req.header("X-Request-Id");
  const rid = incoming && String(incoming).trim() ? String(incoming).trim() : crypto.randomUUID();

  req.requestId = rid;
  res.setHeader("X-Request-Id", rid);

  next();
}
