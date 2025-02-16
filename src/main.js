const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  nativeImage,
  Menu,
  session,
} = require('electron');

const path = require('path');
const fs = require('fs');
const ini = require('ini');
const remoteMain = require('@electron/remote/main');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, './rc_data.db');

let LoginWindow, LobbyWindow, PopWindow, tray = null, forceQuit = false;
const hide = process.argv.includes('--start');
const configDir = path.join(app.getPath('userData'), 'config.ini');
const PopWindows = new Map();
remoteMain.initialize();

// 更新開機啟動設定
function updateAutoLaunchSetting(value) {
  app.setLoginItemSettings({
    openAtLogin: value,
    name: 'Raidcall',
    args: ['--start'],
  });
}

// 建立登入視窗
function createLoginWindow() {
  LoginWindow = new BrowserWindow({
    title: `Raidcall v${app.getVersion()}`,
    minWidth: 612,
    minHeight: 452,
    width: 612,
    height: 452,
    maximizable: true,
    transparent: true,
    resizable: false,
    icon: 'raidcall.ico',
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
      contextIsolation: false,
    },
  });
  remoteMain.enable(LoginWindow.webContents);
  updateAutoLaunchSetting(true);
  LoginWindow.setMenu(null);
  LoginWindow.loadFile('./src/view/login.html');
  LoginWindow.webContents.on('did-finish-load', () => !hide && LoginWindow?.show());
  LoginWindow.on('close', (event) => {
    if (!forceQuit) {
      event.preventDefault();
      LoginWindow.hide();
    }
    else {
      LoginWindow = null;
    }
  });
  LoginWindow.on('focus', () => {
    if (LoginWindow) {
      LoginWindow.webContents.send('focus');
    }
  });
  LoginWindow.on('blur', () => {
    if (LoginWindow) {
      LoginWindow.webContents.send('blur');
    }
  });
  LoginWindow.on('resize', () => {
    const [width, height] = LoginWindow.getSize();
    LoginWindow.webContents.send('window-resized', { width, height });
  });
}

// 建立大廳視窗
function createLobbyWindow() {
  if (LobbyWindow instanceof BrowserWindow) {
    return LobbyWindow.focus();
  }
  LobbyWindow = new BrowserWindow({
    title: 'Raidcall Lobby',
    width: 1370,
    height: 800,
    minWidth: 1030,
    minHeight: 500,
    show: false,
    frame: false,
    transparent: true,
    resizable: true,
    icon: 'raidcall.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false,
      nativeWindowOpen: true,
      webviewTag: true,
    },
  });
  require('@electron/remote/main').enable(LobbyWindow.webContents);
  LobbyWindow.loadFile('./src/view/lobby.html');
  LobbyWindow.setMenu(null);
  LobbyWindow.webContents.on('did-finish-load', () => LobbyWindow.show());
  LobbyWindow.on('close', () => (LobbyWindow = null));
}

// 建立對話框
function createPopWindow(data, height, width, type, resize) {
  if (PopWindows.has(type)) {
    let existingPop = PopWindows.get(type);
    if (existingPop.isMinimized()) {
      existingPop.restore();
    }
    existingPop.show();
    existingPop.focus();
    return;
  }
  let newPop = new BrowserWindow({
    title: 'Raidcall Pop',
    width: width,
    height: height,
    parent: LoginWindow,
    modal: true,
    show: false,
    frame: false,
    transparent: true,
    resizable: resize || false,
    icon: path.join(__dirname, 'raidcall.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      backgroundThrottling: false,
      nativeWindowOpen: true,
    },
  });
  require('@electron/remote/main').enable(newPop.webContents);
  newPop.loadFile(`./src/view/${type}.html`);
  newPop.setMenu(null);
  newPop.webContents.on('did-finish-load', () => {
    newPop.show();
    newPop.focus();
    if (data) {
      newPop.webContents.send('set-code', data.code, data.textCode, data.icon);
      LoginWindow.webContents.send('stop-loading');
    }
  });
  newPop.on('close', () => {
    PopWindows.delete(type);
  });
  PopWindows.set(type, newPop);
}

// 托盤圖標設定
function trayIcon(isGray = true) {
  if (tray) {
    tray.destroy();
  }
  const iconPath = isGray ? 'raidcall_gray.ico' : 'raidcall.ico';
  tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.on('click', () => {
    if (!PopWindow && LoginWindow && LoginWindow.isVisible()) {
      LoginWindow.hide();
    }
    else if (!PopWindow && LobbyWindow && LobbyWindow.isVisible()) {
      LobbyWindow.hide();
    }
    else { (LoginWindow || LobbyWindow)?.show(); }
  });
  const contextMenu = Menu.buildFromTemplate([
    { label: `Raidcall v${app.getVersion()}`, type: 'normal' },
    { type: 'separator' },
    { label: '重新啟動', type: 'normal', click: () => restart() },
    { label: '結束程式', type: 'normal', click: () => app.quit() },
  ]);
  tray.setToolTip(`Raidcall v${app.getVersion()}`);
  tray.setContextMenu(contextMenu);
}

// 重啟程式
function restart() {
  app.relaunch();
  app.quit();
}

// 取得使用者資訊
function getUserDatabase(username) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Unable to open database:', err.message);
        return reject(err);
      }
    });

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
      if (err) {
        console.error('Failed to search:', err.message);
        reject(err);
      }
      else {
        resolve(row);
      }
      db.close();
    });
  });
}

// 更新使用者資訊
function setUserDatabase(username, updateFields) {
  return new Promise((resolve, reject) => {
    if (!username || typeof updateFields !== 'object' || Object.keys(updateFields).length === 0) {
      return reject(new Error('Invalid parameters: username or updateFields is missing.'));
    }
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error('Unable to open database:', err.message);
        return reject(err);
      }
    });
    const fields = Object.keys(updateFields).map((field) => `${field} = ?`).join(', ');
    const values = Object.values(updateFields);
    values.push(username);
    const sql = `UPDATE users SET ${fields} WHERE username = ?`;
    db.run(sql, values, function (err) {
      if (err) {
        console.error('Failed to update user data:', err.message);
        reject(err);
      }
      else {
        console.log(`User ${username} updated:`, updateFields);
        resolve(true);
      }
      db.close();
    });
  });
}

// 驗證登入
async function verifyLogin(username, inputPassword) {
  try {
    const user = await getUserDatabase(username);
    if (!user) {
      console.warn('Accounts do not exist');
      return { success: false, code: null, textCode: 20114, icon: 'warning' };
    }
    if (user.block_status === '1') {
      console.warn(`Account has been blocked`);
      return { success: false, code: 26, textCode: 20119, icon: 'warning' };
    }
    const isMatch = await bcrypt.compare(inputPassword, user.password);
    if (isMatch) {
      console.info(`Login Successful`);
      await setUserDatabase(username, { online_status: 'online' });
      const cookie = {
        url: 'http://localhost',
        name: 'user_session',
        value: JSON.stringify({ username, loginTime: Date.now() }),
        expirationDate: Math.floor(Date.now() / 1000) + 86400,
        httpOnly: true,
        secure: false,
      };
      session.defaultSession.cookies.set(cookie)
        .then(() => console.log(`✅ Cookie set for user: ${username}`))
        .catch((error) => console.error('❌ Failed to set cookie:', error));
      return { success: true };
    }
    else {
      console.warn(`Wrong password`);
      return { success: false, code: null, textCode: 20115, icon: 'warning' };
    }
  }
  catch (error) {
    console.error('Error in validation:', error);
    return { success: false, code: 20119, textCode: 20117, icon: 'error' };
  }
}

// IPC 處理
ipcMain.on('get-language', (event, lang) => {
  try {
    const langData = ini.parse(fs.readFileSync(path.join(__dirname, 'language', `${lang || 'tw'}.ini`), 'utf-8'));
    event.reply('language-response', langData);
  }
  catch (error) {
    console.error('Failed to load language file:', error);
    event.reply('language-response', { error: 'Failed to load language file' });
  }
});
ipcMain.on('open-pop-window', (event, data, height, width, type, resize) => createPopWindow(data, height, width, type, resize));
ipcMain.on('logout', () => restart());
ipcMain.on('login', async (event, { username, password }) => {
  console.log('Receive login request:', username);
  const result = await verifyLogin(username, password);
  event.reply('login-reply', result);
});
ipcMain.on('open-lobby-window', () => {
  if (LoginWindow) {
    LoginWindow.close();
    LoginWindow = null;
  }
  createLobbyWindow();
  trayIcon(false);
});
ipcMain.on('open-dev-tool', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    currentWindow.webContents.openDevTools({ mode: 'detach' });
  }
});
ipcMain.on('reload', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    currentWindow.webContents.reload();
  }
});
ipcMain.on('minimize', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    currentWindow.minimize();
  }
});
ipcMain.on('close', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    currentWindow.close();
  }
});
ipcMain.on('hide', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    currentWindow.hide();
  }
});
ipcMain.on('maximize', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    if (!currentWindow.isMaximized()) {
      currentWindow.maximize();
    }
    currentWindow.setResizable(false);
    currentWindow.webContents.send('toggle-drag', false);
  }
});
ipcMain.on('restore', () => {
  const currentWindow = BrowserWindow.getFocusedWindow();
  if (currentWindow) {
    if (currentWindow.isMaximized()) {
      currentWindow.unmaximize();
    }
    currentWindow.setResizable(true);
    currentWindow.webContents.send('toggle-drag', true);
  }
});
const loadConfig = () => {
  if (!fs.existsSync(configDir)) {
    const defaultConfig = ini.stringify({
      INFO: {
        lang: 'zh-tw',
        version: app.getVersion(),
      },
    });
    fs.writeFileSync(configDir, defaultConfig, 'utf-8');
  }
  return ini.parse(fs.readFileSync(configDir, 'utf-8'));
};
const saveConfig = (data) => {
  const existingConfig = loadConfig();
  const mergeDeep = (target, source) =>
    Object.entries(source).reduce((acc, [key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        acc[key] = mergeDeep(acc[key] || {}, value);
      }
      else if (value === null) {
        acc = Object.fromEntries(Object.entries(acc).filter(([k]) => k !== key));
      }
      else {
        acc[key] = value;
      }
      return acc;
    }, { ...target });
  const updatedConfig = mergeDeep(existingConfig, data);
  fs.writeFileSync(configDir, ini.stringify(updatedConfig), 'utf-8');
  return { status: true };
};
ipcMain.on('get-config', (event) => {
  event.reply('get-config-res', loadConfig());
});
ipcMain.on('write-config', (event, data) => {
  event.reply('write-config-res', saveConfig(data));
});
const shouldQuit = app.requestSingleInstanceLock();
if (!shouldQuit) {
  app.quit();
}
else {
  app.on('second-instance', () => LoginWindow?.show());
  app.whenReady().then(() => {
    trayIcon(true);
    createLoginWindow();
  });
}
app.on('window-all-closed', (event) => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  else { event.preventDefault(); }
});
app.on('activate', () => LoginWindow?.show() || createLoginWindow());
app.on('before-quit', () => (forceQuit = true));
