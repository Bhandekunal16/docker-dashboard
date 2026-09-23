const path = require("path");
const express = require("express");
const { getConfig } = require("./config");
const { DockerAdapter } = require("./docker/adapter");
const { DashboardService } = require("./services/dashboard");
const {
  getCpuUsage,
  getMemoryUsage,
  getDiskUsage,
} = require("./services/host-resources");
const { validationError } = require("./errors");
const {
  corsPolicy,
  errorHandler,
  rateLimit,
  requestContext,
} = require("./middleware");

function createApp({ config = getConfig(), adapter, logger = console } = {}) {
  const app = express();
  const dockerAdapter =
    adapter ||
    new DockerAdapter({
      timeoutMs: config.docker.timeoutMs,
      maxBuffer: config.docker.maxBuffer,
    });
  const service = new DashboardService(dockerAdapter, config.docker.commands);

  app.disable("x-powered-by");
  app.use(requestContext(logger));
  app.use(corsPolicy(config.security.corsOrigins));
  app.use(express.json({ limit: config.server.jsonLimit }));
  app.use(rateLimit(config.security));

  const getBody = (req) => req.body || {};
  const requireId = (value, field) => {
    if (!value) throw validationError(`${field} is required`, { field });
    return value;
  };

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.get("/api/host/cpu", async (req, res, next) => {
    try {
      return res.json(await getCpuUsage());
    } catch (error) {
      return next(error);
    }
  });
  app.get("/api/host/memory", (req, res) => res.json(getMemoryUsage()));
  app.get("/api/host/disk", async (req, res, next) => {
    try {
      return res.json(await getDiskUsage());
    } catch (error) {
      return next(error);
    }
  });
  app.get("/ready", async (req, res, next) => {
    try {
      await dockerAdapter.ping();
      return res.json({ status: "ready", docker: "available" });
    } catch (error) {
      return next(error);
    }
  });

  app.use("/assets", express.static(path.join(config.frontend.directory, "assets")));
  app.get("/favicon.svg", (req, res) =>
    res.sendFile(path.join(config.frontend.directory, "favicon.svg")),
  );
  app.get("/", (req, res) =>
    res.sendFile(path.join(config.frontend.directory, config.frontend.file)),
  );

  app.get("/get/all/containers", async (req, res, next) => {
    try {
      return res.json(await service.listContainers());
    } catch (error) {
      return next(error);
    }
  });
  app.get("/get/all/images", async (req, res, next) => {
    try {
      return res.json(await service.listImages());
    } catch (error) {
      return next(error);
    }
  });

  app.post("/logs/container", async (req, res, next) => {
    try {
      const body = getBody(req);
      return res.json(
        await service.getContainerLogs(
          requireId(body.containerId, "containerId"),
          { timestamps: body.timestamps, tail: body.tail },
        ),
      );
    } catch (error) {
      return next(error);
    }
  });

  for (const [route, method] of [
    ["/start/container", "startContainer"],
    ["/stop/container", "stopContainer"],
    ["/restart/container", "restartContainer"],
    ["/remove/container", "removeContainer"],
  ]) {
    app.post(route, async (req, res, next) => {
      try {
        const containerId = requireId(getBody(req).containerId, "containerId");
        return res.json(await service[method](containerId));
      } catch (error) {
        return next(error);
      }
    });
  }

  app.post("/remove/image", async (req, res, next) => {
    try {
      return res.json(await service.removeImage(requireId(getBody(req).imageId, "imageId")));
    } catch (error) {
      return next(error);
    }
  });
  app.post("/remove/images", async (req, res, next) => {
    try {
      return res.json(await service.removeImages(getBody(req).imageIds));
    } catch (error) {
      return next(error);
    }
  });

  app.get("/api/containers", async (req, res, next) => {
    try {
      return res.json(await service.listContainers());
    } catch (error) {
      return next(error);
    }
  });
  app.get("/api/images", async (req, res, next) => {
    try {
      return res.json(await service.listImages());
    } catch (error) {
      return next(error);
    }
  });
  app.get("/api/containers/:id/logs", async (req, res, next) => {
    try {
      return res.json(await service.getContainerLogs(req.params.id, {
        timestamps: req.query.timestamps === "true",
        tail: req.query.tail === undefined ? 200 : Number(req.query.tail),
      }));
    } catch (error) {
      return next(error);
    }
  });

  for (const [route, method] of [
    ["/api/containers/:id/start", "startContainer"],
    ["/api/containers/:id/stop", "stopContainer"],
    ["/api/containers/:id/restart", "restartContainer"],
  ]) {
    app.post(route, async (req, res, next) => {
      try {
        return res.json(await service[method](req.params.id));
      } catch (error) {
        return next(error);
      }
    });
  }

  app.delete("/api/containers/:id", async (req, res, next) => {
    try {
      return res.json(await service.removeContainer(req.params.id));
    } catch (error) {
      return next(error);
    }
  });
  app.delete("/api/images/:id", async (req, res, next) => {
    try {
      return res.json(await service.removeImage(req.params.id));
    } catch (error) {
      return next(error);
    }
  });

  app.use((req, res) => {
    if (req.path === "/favicon.ico") {
      return res.sendFile(path.join(config.frontend.directory, "favicon.ico"));
    }
    return res.sendFile(path.join(config.frontend.directory, config.frontend.file));
  });
  app.use(errorHandler(config, logger));
  return { app, service, dockerAdapter };
}

module.exports = { createApp };
