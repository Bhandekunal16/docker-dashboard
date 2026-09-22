const path = require("path");
const { app, BrowserWindow, dialog, ipcMain, Menu, Notification, shell } = require("electron");
const { spawn } = require("child_process");
const { createTray } = require("./tray");
const { stopProcess, waitForBackend } = require("./server-lifecycle");

const DEFAULT_PORT = 5000;
const isDevelopment = !app.isPackaged;
const apiHost = "127.0.0.1";
const apiPort = Number(process.env.DESKTOP_PORT || DEFAULT_PORT);
const apiBaseUrl = `http://${apiHost}:${apiPort}`;
const rendererUrl = process.env.DESKTOP_DEV_URL || apiBaseUrl;
process.env.DOCKER_DASHBOARD_API_URL = apiBaseUrl;
const statePath = path.join(app.getPath("userData"), "window-state.json");
let mainWindow;
let tray;
let backend;
let quitting = false;

function log(event, details = {}) {
  console.info(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...details,
  }));
}

function readWindowState() {
  try {
    const state = require(statePath);
    if (
      Number.isFinite(state.width) &&
      Number.isFinite(state.height) &&
      state.width >= 800 &&
      state.height >= 600
    ) {
      return {
        width: state.width,
        height: state.height,
        x: Number.isFinite(state.x) ? state.x : undefined,
        y: Number.isFinite(state.y) ? state.y : undefined,
      };
    }
  } catch {
    // Use defaults when no prior state exists.
  }
  return { width: 1200, height: 800 };
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  require("fs").writeFileSync(
    statePath,
    JSON.stringify({
      ...mainWindow.getBounds(),
      isMaximized: mainWindow.isMaximized(),
    }),
    "utf8",
  );
}

function showStartupFailure(title, message, eventName) {
  log(eventName, { message });
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(`
        <html><body style="font-family:sans-serif;padding:3rem">
          <h1>Docker Dashboard</h1>
          <p>${title}</p>
          <p>${message}</p>
          <p>Choose <b>Restart Server</b> from the tray menu to try again.</p>
        </body></html>
      `)}`,
    );
  }
  if (Notification.isSupported()) {
    new Notification({
      title: "Docker Dashboard",
      body: message,
    }).show();
  }
}

function showDockerUnavailable(error) {
  showStartupFailure(
    "Docker is not available.",
    "Please start Docker Desktop and restart the server.",
    "docker_unavailable",
  );
}

function showBackendUnavailable(error) {
  showStartupFailure(
    "The local API server is not available.",
    `The server could not start on ${apiBaseUrl}. Check whether the port is already in use.`,
    "backend_unavailable",
  );
}

function createWindow() {
  const state = readWindowState();
  mainWindow = new BrowserWindow({
    ...state,
    title: "Docker Dashboard",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.on("close", (event) => {
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
      return;
    }
    saveWindowState();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

function startBackend() {
  const serverEntry = path.join(__dirname, "..", "server", "index.js");
  const serverEnv = {
    ...process.env,
    HOST: apiHost,
    PORT: String(apiPort),
    DOCKER_DASHBOARD_API_URL: apiBaseUrl,
    NODE_ENV: "production",
  };
  backend = spawn(process.execPath, [serverEntry], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...serverEnv,
      ELECTRON_RUN_AS_NODE: "1",
    },
    stdio: isDevelopment ? "pipe" : "ignore",
  });

  if (backend.stdout) backend.stdout.on("data", (data) => log("backend_log", { message: data.toString().trim() }));
  if (backend.stderr) backend.stderr.on("data", (data) => log("backend_error", { message: data.toString().trim() }));
  backend.on("error", (error) => {
    log("backend_start_failure", { message: error.message });
    if (!quitting) showDockerUnavailable(error);
  });
  backend.on("exit", (code, signal) => {
    log("backend_exit", { code, signal });
    if (!quitting && mainWindow && !mainWindow.isDestroyed()) {
      showBackendUnavailable(new Error("The local API server stopped unexpectedly."));
    }
  });
}

async function openDashboard() {
  if (!mainWindow) createWindow();
  try {
    await waitForBackend({ baseUrl: apiBaseUrl });
    if (!mainWindow.isDestroyed()) {
      await mainWindow.loadURL(rendererUrl);
      log("backend_ready", { apiBaseUrl, rendererUrl });
    }
  } catch (error) {
    if (backend?.exitCode !== null) {
      showBackendUnavailable(error);
    } else {
      showDockerUnavailable(error);
    }
  }
}

async function restartBackend() {
  await stopProcess(backend);
  startBackend();
  await openDashboard();
}

async function quitApplication() {
  if (quitting) return;
  quitting = true;
  log("application_shutdown");
  saveWindowState();
  await stopProcess(backend);
  app.quit();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    log("application_startup", { apiBaseUrl });
    Menu.setApplicationMenu(null);
    createWindow();
    tray = createTray({
      iconPath: path.join(__dirname, "icon.png"),
      onOpen: () => mainWindow?.show(),
      onRestart: () => restartBackend(),
      onSettings: () => {
        mainWindow?.show();
        mainWindow?.webContents.send("desktop:open-settings");
      },
      onQuit: () => quitApplication(),
    });
    ipcMain.handle("desktop:open-external", (_event, url) => {
      if (typeof url === "string" && /^https?:\/\//.test(url)) {
        return shell.openExternal(url);
      }
      return false;
    });
    startBackend();
    await openDashboard();
  });

  app.on("before-quit", (event) => {
    if (!quitting) {
      event.preventDefault();
      quitApplication();
    }
  });
}
