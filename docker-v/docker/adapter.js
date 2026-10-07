const { execFile } = require("child_process");
const { promisify } = require("util");
const { normalizeDockerError } = require("../errors");

const execFileAsync = promisify(execFile);

class DockerAdapter {
  constructor({ timeoutMs = 30000, maxBuffer = 1024 * 1024, runner } = {}) {
    this.timeoutMs = timeoutMs;
    this.maxBuffer = maxBuffer;
    this.runner =
      runner ||
      ((command, args) =>
        execFileAsync(command, args, {
          encoding: "utf8",
          timeout: this.timeoutMs,
          maxBuffer: this.maxBuffer,
          windowsHide: true,
        }));
  }

  async run(args, operation) {
    try {
      const result = await this.runner("docker", args);
      return {
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        code: 0,
      };
    } catch (error) {
      throw normalizeDockerError(error, operation);
    }
  }

  async listContainers(command) {
    return this.run(command, "list_containers");
  }

  async listImages(command) {
    return this.run(command, "list_images");
  }

  async getLogs(containerId, { timestamps = false, tail = 200 } = {}) {
    const args = ["logs"];
    if (timestamps) args.push("--timestamps");
    args.push("--tail", String(tail), containerId);
    return this.run(args, "get_container_logs");
  }

  async startContainer(containerId) {
    return this.run(["start", containerId], "start_container");
  }

  async stopContainer(containerId) {
    return this.run(["stop", containerId], "stop_container");
  }

  async restartContainer(containerId) {
    return this.run(["restart", containerId], "restart_container");
  }

  async removeContainer(containerId) {
    return this.run(["rm", containerId], "remove_container");
  }

  async removeImage(imageId) {
    return this.run(["rmi", imageId], "remove_image");
  }

  async removeImages(imageIds) {
    return this.run(["rmi", ...imageIds], "remove_images");
  }

  async ping() {
    await this.run(["info", "--format", "{{json .ServerVersion}}"], "readiness");
    return true;
  }
}

module.exports = { DockerAdapter };
