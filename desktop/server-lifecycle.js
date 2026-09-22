const http = require("http");

function requestJson(url, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        let payload;
        try {
          payload = body ? JSON.parse(body) : {};
        } catch {
          reject(new Error("Backend returned invalid JSON"));
          return;
        }
        resolve({ statusCode: response.statusCode, payload });
      });
    });

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error("Backend request timed out"));
    });
    request.on("error", reject);
  });
}

async function waitForBackend({ baseUrl, timeoutMs = 15000, intervalMs = 250 }) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const health = await requestJson(`${baseUrl}/health`);
      if (health.statusCode !== 200) {
        throw new Error(`Backend health check returned ${health.statusCode}`);
      }

      const readiness = await requestJson(`${baseUrl}/ready`);
      if (readiness.statusCode === 200 && readiness.payload?.status === "ready") {
        return readiness.payload;
      }
      throw new Error("Docker is not ready");
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error(
    `Backend did not become ready: ${lastError?.message || "timeout"}`,
  );
}

function stopProcess(child, signal = "SIGTERM", timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (!child || child.exitCode !== null || child.killed) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      if (!child.killed) child.kill("SIGKILL");
      finish();
    }, timeoutMs);

    child.once("exit", finish);
    child.kill(signal);
  });
}

module.exports = {
  requestJson,
  stopProcess,
  waitForBackend,
};
