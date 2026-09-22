const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dockerDashboardDesktop", {
  apiBaseUrl: process.env.DOCKER_DASHBOARD_API_URL || "",
  onOpenSettings: (callback) => {
    ipcRenderer.on("desktop:open-settings", callback);
  },
});
