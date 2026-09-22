const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const { waitForBackend } = require("../server-lifecycle");

test("waitForBackend waits for health and Docker readiness", async () => {
  const server = http.createServer((request, response) => {
    response.setHeader("content-type", "application/json");
    if (request.url === "/health") {
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (request.url === "/ready") {
      response.end(JSON.stringify({ status: "ready", docker: "available" }));
      return;
    }
    response.statusCode = 404;
    response.end("{}");
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const readiness = await waitForBackend({
    baseUrl: `http://127.0.0.1:${port}`,
    timeoutMs: 1000,
    intervalMs: 10,
  });
  server.close();

  assert.deepEqual(readiness, { status: "ready", docker: "available" });
});

test("waitForBackend reports unavailable dependencies", async () => {
  const server = http.createServer((_request, response) => {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({
      status: "not_ready",
      docker: { available: false },
    }));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await assert.rejects(
    waitForBackend({
      baseUrl: `http://127.0.0.1:${port}`,
      timeoutMs: 50,
      intervalMs: 10,
    }),
    /Docker is not ready/,
  );
  server.close();
});
