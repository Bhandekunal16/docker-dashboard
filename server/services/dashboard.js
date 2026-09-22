const { validationError } = require("../errors");

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,127}$/;

function validateId(value, field) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    throw validationError(`${field} is invalid`, { field });
  }
  return value;
}

function validateLogsOptions(options = {}) {
  const timestamps = options.timestamps ?? false;
  const tail = options.tail ?? 200;
  if (typeof timestamps !== "boolean") {
    throw validationError("timestamps must be a boolean", { field: "timestamps" });
  }
  if (!Number.isInteger(tail) || tail < 1 || tail > 10000) {
    throw validationError("tail must be an integer between 1 and 10000", {
      field: "tail",
    });
  }
  return { timestamps, tail };
}

function parseJsonLines(stdout, mapper) {
  if (!stdout.trim()) return [];
  return stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => mapper(JSON.parse(line)));
}

class DashboardService {
  constructor(adapter, commands) {
    this.adapter = adapter;
    this.commands = commands;
  }

  async listContainers() {
    const result = await this.adapter.listContainers(this.commands.get_containers.slice(1));
    return parseJsonLines(result.stdout, (container) => ({
      container_id: container.ID,
      image: container.Image,
      status: container.Status,
      ports: container.Ports,
      name: container.Names,
    }));
  }

  async listImages() {
    const result = await this.adapter.listImages(this.commands.get_images.slice(1));
    return parseJsonLines(result.stdout, (image) => ({
      Containers: image.Containers,
      Created_At: image.CreatedAt,
      Created_Since: image.CreatedSince,
      Digest: image.Digest,
      ID: image.ID,
      Shared_Size: image.SharedSize,
      Size: image.Size,
      Tag: image.Tag,
      UniqueSize: image.UniqueSize,
    }));
  }

  async getContainerLogs(containerId, options) {
    const id = validateId(containerId, "containerId");
    return {
      containerId: id,
      logs: (await this.adapter.getLogs(id, validateLogsOptions(options))).stdout,
    };
  }

  async startContainer(containerId) {
    return this.action("startContainer", containerId, "Container started successfully");
  }

  async stopContainer(containerId) {
    return this.action("stopContainer", containerId, "Container stopped successfully");
  }

  async restartContainer(containerId) {
    return this.action("restartContainer", containerId, "Container restarted successfully");
  }

  async removeContainer(containerId) {
    return this.action("removeContainer", containerId, "Container removed successfully");
  }

  async removeImage(imageId) {
    const id = validateId(imageId, "imageId");
    const result = await this.adapter.removeImage(id);
    return { message: "Image removed successfully", imageId: id, output: result.stdout.trim() };
  }

  async removeImages(imageIds) {
    if (!Array.isArray(imageIds) || imageIds.length === 0 || imageIds.length > 100) {
      throw validationError("imageIds must contain between 1 and 100 items", {
        field: "imageIds",
      });
    }
    const ids = imageIds.map((id) => validateId(id, "imageIds"));
    const result = await this.adapter.removeImages(ids);
    return { message: "Images removed successfully", imageIds: ids, output: result.stdout.trim() };
  }

  async action(method, containerId, message) {
    const id = validateId(containerId, "containerId");
    const result = await this.adapter[method](id);
    return { message, containerId: id, output: result.stdout.trim() };
  }
}

module.exports = { DashboardService, ID_PATTERN, validateId, validateLogsOptions };
