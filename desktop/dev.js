const { spawn } = require("child_process");
const path = require("path");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const frontend = spawn(
  npmCommand,
  ["--prefix", path.join(__dirname, "..", "frontend", "docker-dashboard-react"), "run", "dev"],
  { stdio: "inherit" },
);

const electronCli = require.resolve("electron/cli.js");
const desktop = spawn(process.execPath, [electronCli, "."], {
  cwd: path.join(__dirname, ".."),
  env: {
    ...process.env,
    DESKTOP_DEV_URL: "http://127.0.0.1:3000",
  },
  stdio: "inherit",
});

function shutdown() {
  if (!frontend.killed) frontend.kill("SIGTERM");
  if (!desktop.killed) desktop.kill("SIGTERM");
}

desktop.on("exit", (code) => {
  shutdown();
  process.exit(code || 0);
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
