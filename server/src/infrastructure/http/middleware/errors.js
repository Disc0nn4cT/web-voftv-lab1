


export class HttpError extends Error {
  constructor(status, error, message, details = null) {
    super(message);
    this.status = status;
    this.error = error;     // short machine code, e.g. "invalid_input"
    this.details = details; // optional object/array
  }
}

export function sendError(res, req, status, error, message, details = null) {
  const requestId = req.requestId || null;
  res.status(status).json({
    error,
    message,
    status,
    details,
    requestId,
  });
}

export function notFound(req, res) {
  sendError(res, req, 404, "not_found", "Route not found");
}

export function errorHandler(err, req, res, next) { // eslint-disable-line
  // invalid JSON from express.json()
if (err?.type === "entity.parse.failed") {
  return sendError(res, req, 400, "invalid_json", "Invalid JSON body");
}
  // Якщо це наша контрольована помилка:
  if (err instanceof HttpError) {
    return sendError(res, req, err.status, err.error, err.message, err.details);
  }

  // Якщо щось інше:
  console.error("Unhandled error:", err);
  return sendError(res, req, 500, "internal_error", "Unexpected server error");
}
