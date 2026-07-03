// electron/main.js
// CommonJS format - extraMetadata me "type": "commonjs" set hai

const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

function createWindow() {
  const isMac = process.platform === 'darwin'

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#000000',

    titleBarStyle: isMac ? 'hidden' : 'default',
    frame: true,
    show: false,
    center: true,

    ...(isMac && {
      trafficLightPosition: { x: 16, y: 16 },
    }),

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  // ── Debug Helpers ──────────────────────────────
  mainWindow.webContents.on('did-fail-load', (e, code, desc, url) => {
    console.log('did-fail-load:', code, desc, url)
  })

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.log('render-process-gone:', details)
  })

  mainWindow.webContents.on('unresponsive', () => {
    console.log('Renderer became unresponsive')
  })

  // ── Load App ───────────────────────────────────
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html')
    console.log('Loading:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  // ── Show Window ────────────────────────────────
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // ── External Links ─────────────────────────────
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // ── Window Controls IPC ────────────────────────
  ipcMain.on('minimize-window', () => mainWindow.minimize())

  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  })

  ipcMain.on('close-window', () => mainWindow.close())

  ipcMain.handle('get-version', () => app.getVersion())
  ipcMain.handle('get-platform', () => process.platform)

  // ── Maximize State ─────────────────────────────
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximized', false)
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})