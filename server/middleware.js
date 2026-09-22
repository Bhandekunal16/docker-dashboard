const crypto = require("crypto");
const { errorResponse } = require("./errors");

function requestContext(logger = console) {
  return (req, res, next) => {
    const requestId = req.get("x-request-id") || crypto.randomUUID();
    const started = process.hrtime.bigint();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
      logger.info(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          method: req.method,
          endpoint: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Math.round(durationMs * 100) / 100,
        }),
      );
    });
    next();
  };
}

function corsPolicy(origins) {
  return (req, res, next) => {
    const origin = req.get("origin");
    if (!origin || origins.length === 0 || origins.includes(origin)) {
      if (origin) res.setHeader("access-control-allow-origin", origin);
      res.setHeader("access-control-allow-headers", "Content-Type, X-Request-ID");
      res.setHeader("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
      if (req.method === "OPTIONS") return res.sendStatus(204);
      return next();
    }
    return res.status(403).json({
      error: { code: "FORBIDDEN", message: "Origin is not allowed", details: {} },
    });
  };
}

function rateLimit({ windowMs, max }) {
  const clients = new Map();
  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const current = clients.get(key);
    if (!current || now - current.startedAt >= windowMs) {
      clients.set(key, { startedAt: now, count: 1 });
      return next();
    }
    current.count += 1;
    if (current.count > max) {
      return res.status(429).json({
        error: { code: "RATE_LIMITED", message: "Too many requests", details: {} },
      });
    }
    return next();
  };
}

function errorHandler(config, logger = console) {
  return (error, req, res, next) => {
    if (res.headersSent) return next(error);
    logger.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        endpoint: req.originalUrl,
        errorCode: error.code || "INTERNAL_ERROR",
        message: error.message,
      }),
    );
    return res
      .status(error.statusCode || 500)
      .json(errorResponse(error, req.requestId, config.isProduction));
  };
}

module.exports = { corsPolicy, errorHandler, rateLimit, requestContext };
