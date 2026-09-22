const { execFileSync } = require("child_process");
const fs = require("fs");

class DockerHelp {
  static runCommand(cmd) {
    try {
      const [command, ...args] = cmd;
      const stdout = execFileSync(command, args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });

      return {
        stdout: stdout || "",
        stderr: "",
        returncode: 0,
      };
    } catch (error) {
      return {
        stdout: error.stdout?.toString() || "",
        stderr: error.stderr?.toString() || error.message || "",
        returncode: error.status ?? 1,
        error,
      };
    }
  }
}

class Loader {
  static defaultBadRequest(res, error) {
    return res.status(400).json({ error });
  }

  static jsonResponse(res, obj, resCode) {
    return res.status(resCode).json(obj);
  }
}

class Service {
  static command = require('../command.config.json')

  static loadContainers() {
    const result = DockerHelp.runCommand(Service.command.get_containers);

    if (!result.stdout) {
      return [];
    }

    return result.stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .map((c) => ({
        container_id: c.ID,
        image: c.Image,
        status: c.Status,
        ports: c.Ports,
        name: c.Names,
      }));
  }

  static loadImages() {
    const result = DockerHelp.runCommand(Service.command.get_images);

    if (!result.stdout) {
      return [];
    }

    return result.stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .map((img) => ({
        Containers: img.Containers,
        Created_At: img.CreatedAt,
        Created_Since: img.CreatedSince,
        Digest: img.Digest,
        ID: img.ID,
        Shared_Size: img.SharedSize,
        Size: img.Size,
        Tag: img.Tag,
        UniqueSize: img.UniqueSize,
      }));
  }

  static containerLogs(res, containerId, timestamps, tail) {
    const cmd = ["docker", "logs"];

    if (timestamps) {
      cmd.push("--timestamps");
    }

    cmd.push("--tail", String(tail), containerId);

    const result = DockerHelp.runCommand(cmd);

    if (result.returncode !== 0) {
      return Loader.jsonResponse(
        res,
        {
          error: "Failed to fetch container logs",
          details: result.stderr.trim(),
        },
        500
      );
    }

    return Loader.jsonResponse(
      res,
      {
        containerId,
        logs: result.stdout,
      },
      200
    );
  }

  static stopContainer(res, containerId) {
    return Service.runContainerAction(
      res,
      ["docker", "stop", containerId],
      "Container stopped successfully",
      { containerId }
    );
  }

  static restartContainer(res, containerId) {
    return Service.runContainerAction(
      res,
      ["docker", "restart", containerId],
      "Container restarted successfully",
      { containerId }
    );
  }

  static startContainer(res, containerId) {
    return Service.runContainerAction(
      res,
      ["docker", "start", containerId],
      "Container started successfully",
      { containerId }
    );
  }

  static removeContainer(res, containerId) {
    return Service.runContainerAction(
      res,
      ["docker", "rm", containerId],
      "Container stopped successfully",
      { containerId }
    );
  }

  static removeImage(res, imageId) {
    return Service.runContainerAction(
      res,
      ["docker", "rmi", imageId],
      "Container stopped successfully",
      { imageId }
    );
  }

  static removeImages(res, imageIds) {
    if (!imageIds || imageIds.length === 0) {
      return Loader.defaultBadRequest(res, "No image IDs provided");
    }

    const result = DockerHelp.runCommand(["docker", "rmi", ...imageIds]);
    const status = result.returncode === 0 ? 200 : 400;

    return Loader.jsonResponse(
      res,
      {
        message:
          status === 200
            ? "Images removed successfully"
            : "Failed to remove images",
        imageIds,
        output: result.stdout.trim() || result.stderr.trim(),
      },
      status
    );
  }

  static runContainerAction(res, command, message, identifiers) {
    const result = DockerHelp.runCommand(command);

    if (result.returncode !== 0) {
      return Loader.jsonResponse(
        res,
        {
          error: "Docker command failed",
          details: result.stderr.trim(),
          ...identifiers,
        },
        500
      );
    }

    return Loader.jsonResponse(
      res,
      {
        message,
        ...identifiers,
        output: result.stdout.trim(),
      },
      200
    );
  }
}

module.exports = {
  DockerHelp,
  Loader,
  Service,
};
