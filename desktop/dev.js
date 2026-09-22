const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const electronCli = require.resolve("electron/cli.js");
const frontendUrl = "http://127.0.0.1:3000";
const projectRoot = path.join(__dirname, "..");
const frontendPath = path.join(projectRoot, "frontend", "docker-dashboard-react");
const sandboxPath = path.join(path.dirname(require.resolve("electron")), "dist", "chrome-sandbox");
let frontend;
let desktop;

function sandboxIsConfigured() {
  try {
    const { gid, mode, uid } = fs.statSync(sandboxPath);
    return uid === 0 && gid === 0 && (mode & 0o7777) === 0o4755;
  } catch {
    return false;
  }
}

function configureSandbox() {
  if (process.platform !== "linux" || sandboxIsConfigured()) {
    return Promise.resolve();
  }

  if (!fs.existsSync("/usr/bin/pkexec")) {
    return Promise.reject(new Error(
      `Electron sandbox is not configured and pkexec is unavailable: ${sandboxPath}`,
    ));
  }

  console.log("Electron needs one-time administrator permission to configure its Linux sandbox.");
  return new Promise((resolve, reject) => {
    const authorization = spawn(
      "/usr/bin/pkexec",
      [
        "/bin/sh",
        "-c",
        "/usr/bin/chown root:root -- \"$1\" && /usr/bin/chmod 4755 -- \"$1\"",
        "--",
        sandboxPath,
      ],
      { stdio: "inherit" },
    );
    authorization.on("error", reject);
    authorization.on("exit", (code, signal) => {
      if (code !== 0) {
        reject(new Error(
          `Electron sandbox configuration was not authorized (code=${code}, signal=${signal || "none"}).`,
        ));
        return;
      }
      if (!sandboxIsConfigured()) {
        reject(new Error(`Electron sandbox configuration did not complete: ${sandboxPath}`));
        return;
      }
      resolve();
    });
  });
}

function waitForFrontend({ timeoutMs = 15000, intervalMs = 250 } = {}) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    function check() {
      const request = http.get(frontendUrl, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry(new Error(`Frontend returned HTTP ${response.statusCode}`));
      });

      request.on("error", retry);

      function retry(error) {
        request.destroy();
        if (Date.now() >= deadline) {
          reject(new Error(`Frontend did not become ready: ${error.message}`));
          return;
        }
        setTimeout(check, intervalMs);
      }
    }

    check();
  });
}

async function startDesktop() {
  await waitForFrontend();
  desktop = spawn(process.execPath, [electronCli, "."], {
    cwd: projectRoot,
    env: {
      ...process.env,
      DESKTOP_DEV_URL: frontendUrl,
    },
    stdio: "inherit",
  });

  desktop.on("exit", (code) => {
    shutdown();
    process.exit(code || 0);
  });
}

function shutdown() {
  if (frontend && !frontend.killed) frontend.kill("SIGTERM");
  if (desktop && !desktop.killed) desktop.kill("SIGTERM");
}

async function start() {
  await configureSandbox();
  frontend = spawn(
    npmCommand,
    ["--prefix", frontendPath, "run", "dev"],
    { stdio: "inherit" },
  );
  await startDesktop();
}

start().catch((error) => {
  console.error(error.message);
  shutdown();
  process.exit(1);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
