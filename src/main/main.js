const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
let mainWindow;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadRenderer(window) {
  if (isDev) {
    const devUrl = 'http://localhost:5173';

    // Vite start hone ka thoda wait
    for (let i = 0; i < 40; i++) {
      try {
        await window.loadURL(devUrl);
        return;
      } catch (error) {
        await sleep(250);
      }
    }

    throw new Error('Vite dev server load nahi hua on http://localhost:5173');
  }

  await window.loadFile(path.join(__dirname, '../../dist/index.html'));
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await loadRenderer(mainWindow);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});