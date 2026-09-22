const { Menu, nativeImage, Tray } = require("electron");
const fs = require("fs");

function createTray({ iconPath, onOpen, onRestart, onSettings, onQuit }) {
  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();
  const tray = new Tray(icon);
  tray.setToolTip("Docker Dashboard");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Open Dashboard", click: onOpen },
      { label: "Restart Server", click: onRestart },
      { label: "Open Settings", click: onSettings },
      { type: "separator" },
      { label: "Quit", click: onQuit },
    ]),
  );
  tray.on("click", onOpen);
  return tray;
}

module.exports = { createTray };
