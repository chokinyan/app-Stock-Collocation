import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    resizable: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../public/asset/image/icon/favico.ico'),
    title: 'Projet Stock Collocation',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'), // Chemin vers le preload
      contextIsolation: true, // Sécurité : isolement du contexte
      nodeIntegration: false, // Sécurité : désactive l'intégration de Node.js dans le renderer
      devTools: true, // Ouvre les outils de développement
    },
  });

  // Charge le fichier HTML
  //mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));
}

app.on('ready', () => {
  createWindow();

  ipcMain.handle('connect', async () => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/index.html'));
  });

  ipcMain.handle('disconnect', async () => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));
  });

  ipcMain.handle('alerteGo', async () => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/alerte/index.html'));
  });

  ipcMain.handle('editContainerGo', async () => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/compartiment/index.html'));
  });

  ipcMain.handle('back', async () => {
    const dir : String[] = mainWindow.webContents.getURL().replace('file:///', '').split('/');
    dir.pop();
    dir.pop();
    const newPath = dir.join('/');
    mainWindow.loadFile(newPath + '/index.html');
  });


  ipcMain.handle('test', async (_event,test) => {
    console.log(test);
  });

  ipcMain.handle('addItem', async (_event) => {
    mainWindow.loadFile(path.join(__dirname, '../../public/colloc/compartiment/edit/addItem.html'));
  });

  ipcMain.handle('editItem', async (_event, item) => {
    mainWindow.loadFile(path.join(__dirname, '../../public/colloc/compartiment/edit/editItem.html'));
  });

  ipcMain.handle('deleteItem', async (_event, item) => {
    console.log(item);
  });

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});