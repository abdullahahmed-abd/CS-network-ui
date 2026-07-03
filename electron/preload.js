// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // ── App Info ──────────────────────────────────
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // ── Window Controls ───────────────────────────
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // ── Maximize State Listener ───────────────────
  onMaximizeChange: (callback) => {
    ipcRenderer.on('window-maximized', (_, isMaximized) => callback(isMaximized))
  },

  // ── Platform Info ─────────────────────────────
  platform: process.platform,
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux',
})