// Strand for macOS: a thin native shell around the web build.
// The game's files ship inside the app (Resources/game) and are served over a private
// strand:// protocol, so ES modules, fetch and WebGL behave exactly as on the web. The window
// opens full screen; Cmd+Ctrl+F toggles it, Cmd+Q quits. Nothing runs when the app is closed.
const { app, BrowserWindow, Menu, net, protocol, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

// Where the built game lives: inside the packaged app, or the repo's build output when run from source.
const GAME_DIR = [path.join(process.resourcesPath || '', 'game'), path.join(__dirname, '..', '..', 'swing')]
  .find((d) => fs.existsSync(path.join(d, 'index.html')));

protocol.registerSchemesAsPrivileged([
  { scheme: 'strand', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

// Real GPU, no background throttling (the game paces itself with requestAnimationFrame).
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function createWindow() {
  const win = new BrowserWindow({
    title: 'Strand',
    width: 1440,
    height: 900,
    fullscreen: true,
    backgroundColor: '#07090d',
    show: false,
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  win.once('ready-to-show', () => win.show());
  // links out of the game (none today) open in the default browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('strand://')) e.preventDefault(); });
  win.loadURL('strand://game/index.html');
  return win;
}

function buildMenu() {
  const template = [
    {
      label: 'Strand',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { label: 'Restart Game', accelerator: 'CmdOrCtrl+R', click: (_i, w) => w && w.webContents.reload() },
        { type: 'separator' },
        { role: 'resetZoom' },
      ],
    },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.setAboutPanelOptions({
  applicationName: 'Strand',
  applicationVersion: app.getVersion(),
  credits: 'An original physics-driven web-swinging game.',
});

app.whenReady().then(() => {
  if (!GAME_DIR) {
    console.error('[strand] game files not found; run `npm run build` in swing-src first');
    app.quit();
    return;
  }
  protocol.handle('strand', (req) => {
    const u = new URL(req.url);
    let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.normalize(path.join(GAME_DIR, rel));
    // never serve anything outside the game folder
    if (!file.startsWith(GAME_DIR + path.sep) && file !== GAME_DIR) return new Response('forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  buildMenu();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

// one game, one process: closing the window quits the app (no lingering background process)
app.on('window-all-closed', () => app.quit());
