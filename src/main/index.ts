import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    resizable: false,
    autoHideMenuBar: true,
    /*icon: path.join(__dirname, '../../public/asset/image/icon/favico.ico'),*/
    title: 'Projet Stock Collocation',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'), // Chemin vers le preload
      contextIsolation: true, // Sécurité : isolement du contexte
      nodeIntegration: false, // Sécurité : désactive l'intégration de Node.js dans le renderer
      devTools: false, // Ouvre les outils de développement
    },
  });

  // Charge le fichier HTML
  mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));
}

app.on('ready', () => {
  createWindow();

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