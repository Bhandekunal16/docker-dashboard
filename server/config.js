const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

function loadJson(fileName, fallback) {
  const filePath = path.join(ROOT_DIR, fileName);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Unable to load configuration: ${fileName}`);
  }
}

function csv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getConfig(env = process.env) {
  const application = loadJson("application.config.json", {});
  const frontend = loadJson("file.config.json", {});
  const commands = loadJson("command.config.json", {});
  const environment = env.NODE_ENV || "development";
  const corsOrigins = csv(env.CORS_ORIGINS);

  return {
    environment,
    isProduction: environment === "production",
    server: {
      host: env.HOST || application.host || "0.0.0.0",
      port: Number(env.PORT || application.port || 5000),
      jsonLimit: env.JSON_LIMIT || "100kb",
    },
    docker: {
      timeoutMs: Number(env.DOCKER_TIMEOUT_MS || 30000),
      maxBuffer: Number(env.DOCKER_MAX_BUFFER || 1024 * 1024),
      commands,
    },
    security: {
      corsOrigins,
      rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 60000),
      rateLimitMax: Number(env.RATE_LIMIT_MAX || 120),
    },
    frontend: {
      directory: path.resolve(ROOT_DIR, frontend.directory || "frontend"),
      file: frontend.file || "index.html",
    },
  };
}

module.exports = {
  ROOT_DIR,
  getConfig,
};
