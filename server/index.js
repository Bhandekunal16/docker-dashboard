const path = require("path");
const express = require("express");
const cors = require("cors");

const { Loader, Service } = require("./docker_help");

const BASE_DIR = __dirname;
const app = express();

const frontend = require("../file.config.json");
const config = require("../application.config.json");

const frontendDir = path.join(BASE_DIR.replace('/server', '/'), frontend.directory);

app.use(cors());
app.use(express.json());
app.use("/assets", express.static(path.join(frontendDir, "assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, frontend.file));
});

app.post("/logs/container", (req, res) => {
  const data = req.body || {};
  const containerId = data.containerId;

  if (!containerId) {
    return Loader.defaultBadRequest(res, "containerId is required");
  }

  return Service.containerLogs(
    res,
    containerId,
    data.timestamps ?? false,
    data.tail ?? 200,
  );
});

app.get("/get/all/containers", (req, res) => {
  try {
    return res.json(Service.loadContainers());
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load containers",
      details: error.message,
    });
  }
});

app.get("/get/all/images", (req, res) => {
  try {
    return res.json(Service.loadImages());
  } catch (error) {
    return res.status(500).json({
      error: "Failed to load images",
      details: error.message,
    });
  }
});

app.post("/stop/container", (req, res) => {
  const { containerId } = req.body || {};

  if (!containerId) {
    return Loader.defaultBadRequest(res, "containerId is required");
  }

  return Service.stopContainer(res, containerId);
});

app.post("/remove/container", (req, res) => {
  const { containerId } = req.body || {};

  if (!containerId) {
    return Loader.defaultBadRequest(res, "containerId is required");
  }

  return Service.removeContainer(res, containerId);
});

app.post("/restart/container", (req, res) => {
  const { containerId } = req.body || {};

  if (!containerId) {
    return Loader.defaultBadRequest(res, "containerId is required");
  }

  return Service.restartContainer(res, containerId);
});

app.post("/start/container", (req, res) => {
  const { containerId } = req.body || {};

  if (!containerId) {
    return Loader.defaultBadRequest(res, "containerId is required");
  }

  return Service.startContainer(res, containerId);
});

app.post("/remove/image", (req, res) => {
  const { imageId } = req.body || {};

  if (!imageId || typeof imageId !== "string") {
    return Loader.defaultBadRequest(
      res,
      "imageId is required and must be a string",
    );
  }

  return Service.removeImage(res, imageId);
});

app.post("/remove/images", (req, res) => {
  const { imageIds } = req.body || {};

  if (!imageIds || !Array.isArray(imageIds)) {
    return Loader.defaultBadRequest(
      res,
      "imageIds is required and must be a list",
    );
  }

  return Service.removeImages(res, imageIds);
});

app.use((req, res) => {
  if (req.path === "/favicon.ico") {
    return res.sendFile(path.join(frontendDir, "favicon.ico"));
  }

  return res.sendFile(path.join(frontendDir, frontend.file));
});

const host = config.host || "0.0.0.0";
const port = config.port || 3000;

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
