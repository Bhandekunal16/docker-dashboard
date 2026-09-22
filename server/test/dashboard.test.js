const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DashboardService,
  validateId,
  validateLogsOptions,
} = require("../services/dashboard");
const { DockerAdapter } = require("../docker/adapter");

test("validates Docker identifiers without allowing option-like values", () => {
  assert.equal(validateId("nginx:latest", "imageId"), "nginx:latest");
  assert.throws(() => validateId("--privileged", "containerId"), {
    code: "VALIDATION_ERROR",
  });
  assert.throws(() => validateId("bad value", "containerId"), {
    code: "VALIDATION_ERROR",
  });
});

test("validates bounded log options", () => {
  assert.deepEqual(validateLogsOptions({ timestamps: true, tail: 50 }), {
    timestamps: true,
    tail: 50,
  });
  assert.throws(() => validateLogsOptions({ tail: 10001 }), {
    code: "VALIDATION_ERROR",
  });
});

test("adapter always executes docker with argument arrays", async () => {
  let received;
  const adapter = new DockerAdapter({
    runner: async (command, args) => {
      received = { command, args };
      return { stdout: "ok", stderr: "" };
    },
  });

  await adapter.startContainer("abc123");

  assert.deepEqual(received, {
    command: "docker",
    args: ["start", "abc123"],
  });
});

test("service maps Docker output to the public container shape", async () => {
  const adapter = {
    listContainers: async () => ({
      stdout: `${JSON.stringify({
        ID: "abc123",
        Image: "nginx:latest",
        Status: "Up 1 minute",
        Ports: "",
        Names: "nginx",
      })}\n`,
    }),
  };
  const service = new DashboardService(adapter, {
    get_containers: ["docker", "ps"],
  });

  assert.deepEqual(await service.listContainers(), [
    {
      container_id: "abc123",
      image: "nginx:latest",
      status: "Up 1 minute",
      ports: "",
      name: "nginx",
    },
  ]);
});
