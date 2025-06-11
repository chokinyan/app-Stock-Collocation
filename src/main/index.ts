import { app, BrowserWindow, contextBridge, ipcMain, ipcRenderer } from 'electron';
import KioskBoard from 'kioskboard';
import path from 'path';
import os from 'os';
import axios from 'axios';

let token: string = "";
let userInfo: { nom: string, prenom: string, alerte: [] } = {
  nom: '',
  prenom: '',
  alerte: []
};
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
      spellcheck: false, // Désactive la vérification orthographique
    },
  });

  // Charge le fichier HTML
  //mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));
}


app.on('ready', () => {
  createWindow();

  ipcMain.handle('connect', async () => {
    const rep = await axios.post("http://localhost:3000/Authentification", {
      "action": "login",
      "user": "test",
      "password": "admin"
    });
    if (rep.data.token && rep.data.token !== "") {
      console.log(rep.data);
      token = rep.data.token;
      userInfo.nom = rep.data.nom;
      userInfo.prenom = rep.data.prenom;
      await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/index.html'));
    }

  });

  ipcMain.handle('disconnect', async () => {
    axios.delete("http://localhost:3000/Authentification", {
      data: {
        token: token
      }
    });

    token = "";

    userInfo = {
      nom: "",
      prenom: "",
      alerte: []
    };

    await mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));
  });

  ipcMain.handle('alerteGo', async () => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/alerte/index.html'));
  });

  ipcMain.handle('editContainerGo', async () => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/compartiment/index.html'));
  });

  ipcMain.handle('back', async () => {
    const dir: string[] = mainWindow.webContents.getURL().replace('file:///', '').split('/');
    dir.pop();
    dir.pop();
    let newPath: string = "";
    for (const name of dir) {
      if (name === os.userInfo().username || name === 'home' || name === 'Users' || name === 'Documents' || name === 'Desktop' || name === 'Downloads' || name === 'Pictures' || name === 'Videos' || name === 'Music' || name === 'app-Stock-Collocation') {
        continue;
      }
      newPath += name + '/';
    }

    mainWindow.loadFile(newPath + 'index.html');
  });


  ipcMain.handle('test', async (_event, test) => {
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

  ipcMain.handle('searchItem', async (_event, search) => {
    const url = new URL(`https://world.openfoodfacts.net/api/v3/product/${search}?fields=image_url,product_name`);
    const rep = await axios.get(url.toString())
      .then(response => {
        const data = response.data;
        if (!data.product) {
          console.error('Aucun produit trouvé pour le code-barres :', search);
          return;
        }

        return response.data; // Retourne les données à l'appelant
      })
      .catch(error => {
        console.error('Erreur lors de la récupération du produit :', error);
        return;
      });
    return rep;
  });

  ipcMain.handle('temperature', async () => {
    const temp = await axios.get(`http://localhost:3000/Temperature?token=${token}`);
    if(temp.data){
      return temp.data;
    }
  });

  ipcMain.handle('userInfo',()=>{
    return userInfo;
  })

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
