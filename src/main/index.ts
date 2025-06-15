import { app, BrowserWindow, ipcMain } from 'electron';
import KioskBoard from 'kioskboard';
import path from 'path';
import subProcess from 'child_process';
import axios, { AxiosResponse } from 'axios';
import fs from 'fs';

let token: string = "";

let pythonProcess: subProcess.ChildProcess;

let photoProcess: subProcess.ChildProcess;
let rfidProcess: subProcess.ChildProcess;

let testPhotoProcess: subProcess.ChildProcess;
let testRfidProcess: subProcess.ChildProcess;

let realoadFacesProcess: subProcess.ChildProcess;

//'./python-env/bin/python -u ./main_page_login_finish/app.py'
let userInfo: { id: number, nom: string, prenom: string } = {
  nom: '',
  prenom: '',
  id: 0
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

  if (app.isPackaged) {
    pythonProcess = subProcess.exec(`${path.join(process.resourcesPath, 'app.asar.unpacked', 'python-env', 'bin', 'python')} -u ${path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish', 'app.py')}`);
  }
  else {
    pythonProcess = subProcess.exec(`${path.join(__dirname, '..', '..', 'python-env', 'bin', 'python')} -u ${path.join(__dirname, '..', '..', 'main_page_login_finish', 'app.py')}`);
  }
  // Charge le fichier HTML
  //mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, '../../public/waiting/index.html'));
}


app.on('ready', () => {
  createWindow();

  pythonProcess.stdout?.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  ipcMain.handle('connect', async (_, type, data) => {

    let rep: AxiosResponse<any, any>;

    switch (type) {
      case 'rfid':
        /*await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/rfid/index.html'));*/
        rep = await axios.post("http://localhost:3000/Authentification", {
          "action": "rfid",
          "rfid": data,
        });
        break;
      case 'visage':
        //await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/visage/index.html'));
        rep = await axios.post("http://localhost:3000/Authentification", {
          "action": "visage",
          "visage": data
        });
        break;
      case 'pin':
        //await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/pin/index.html'));
        rep = await axios.post("http://localhost:3000/Authentification", {
          "action": "pin",
          "code": data
        });
        break;
      default:
        console.error('Type de connexion non supporté');
        return;
    }

    if (rep.data.token && rep.data.token !== "") {
      console.log(rep.data);
      token = rep.data.token;
      userInfo = {
        id: Number(rep.data.id),
        nom: rep.data.nom,
        prenom: rep.data.prenom
      }
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
      id: 0,
      nom: "",
      prenom: ""
    };

    await mainWindow.loadURL('http://localhost:5000');
  });

  ipcMain.handle('alerteGo', async () => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/alerte/index.html'));
  });

  ipcMain.handle('editContainerGo', async () => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/compartiment/index.html'));
  });

  ipcMain.handle('back', async () => {
    mainWindow.webContents.navigationHistory.goBack();
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
    await axios.delete(`http://localhost:3000/Item`, {
      data: {
        token: token,
        id: item,
      }
    }).then(response => {
      console.log('Item deleted successfully:', response.data);
    }
    ).catch(error => {
      console.error('Error deleting item:', error);
    });
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
    if (temp.data) {
      return temp.data;
    }
  });

  ipcMain.handle('userInfo', () => {
    return userInfo;
  });

  ipcMain.handle('getAlerteListe', async () => {
    const alerte = await axios.get(`http://localhost:3000/alerte`);
    if (alerte.data) {
      return alerte.data[userInfo.id - 1] || [[], []]; // Retourne les alertes pour l'utilisateur, ou un tableau vide si aucune alerte
    }
  });

  ipcMain.handle('getItemListe', async (_event, compartiment: "sec" | "frais") => {
    const items = await axios.get(`http://localhost:3000/Item?token=${token}&compartiement=${compartiment}`, {
    });
    if (items.data) {
      return items.data;
    }
  });

  ipcMain.handle('addItemToContainer', async (_event, item) => {
    const rep = await axios.post(`http://localhost:3000/Item`, {
      token: token,
      name: item.name,
      container: item.compartiment,
      expire: item.expirationDate,
      image: item.image
    });
    return rep.data;
  });

  ipcMain.handle('openDoor', async () => {
    const rep = await axios.post(`http://localhost:3000/EtatPorte`, {
      token: token,
      etat: 1
    });
    return rep.data;
  });

  ipcMain.handle('loadConnection', async () => {
    mainWindow.loadURL('http://localhost:5000');
  });

  ipcMain.handle('goSetting', () => {
    mainWindow.loadFile(path.join(__dirname, '../../public/admin/index.html'));
  });

  ipcMain.handle('adminConnect', async (_event, username: string, password: string) => {
    const rep = await axios.post(`http://localhost:3000/Authentification`, {
      action: "login",
      user: username,
      password: password
    });

    if (rep.data.token && rep.data.token !== "" && Number(rep.data.id) === 3) {
      console.log(rep.data);
      token = rep.data.token;
      userInfo = {
        id: Number(rep.data.id),
        nom: rep.data.nom,
        prenom: rep.data.prenom
      }
      mainWindow.loadFile(path.join(__dirname, '../../public/admin/dashboard/index.html'));
    } else {
      throw new Error("Invalid credentials or insufficient permissions.");
    }
  });

  ipcMain.handle('editItemInContainer', async (_event, item, container) => {
    const rep = await axios.put(`http://localhost:3000/Item`, {
      token: token,
      id: item.id,
      name: item.name,
      container: container,
      expire: item.expirationDate,
      image: item.image
    });
    return rep.data;
  });

  ipcMain.handle('collocInfo', async (_event, id) => {
    console.log("Fetching user info for ID:", id);
    const rep = await axios.get(`http://localhost:3000/User?token=${token}&id=${id}`);
    return rep.data;

  });

  ipcMain.handle('goEditUser', async (_event, user, id) => {
    await mainWindow.loadFile(path.join(__dirname, '../../public/admin/editUser/index.html'));
    mainWindow.webContents.executeJavaScript(`
        document.querySelector('.form-input[name="nom"]').value = "${user.nom ? user.nom : ''}";
        document.querySelector('.form-input[name="prenom"]').value = "${user.prenom ? user.prenom : ''}";
        document.getElementById('userId').textContent = "${id}";
      `);
  });

  ipcMain.handle('savePicture', async (_, pictures: Array<string>,name) => {
    let testImageDir: string;
    if (app.isPackaged) {
      testImageDir = path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish','dataset', name);
    }
    else {
      testImageDir = path.join(__dirname, '..', '..', 'main_page_login_finish', 'dataset', name);
    }

    // Create testImage directory if it doesn't exist
    if (!fs.existsSync(testImageDir)) {
      fs.mkdirSync(testImageDir, { recursive: true });
    }

    try {
      for (let i = 0; i < pictures.length; i++) {
        // Extract base64 data from data URL
        const base64Data = pictures[i].replace(/^data:image\/[a-z]+;base64,/, '');
        const fileName = `image_${Date.now()}_${i}.png`;
        const filePath = path.join(testImageDir, fileName);

        // Save the image
        fs.writeFileSync(filePath, base64Data, 'base64');
      }
      console.log(`${pictures.length} images saved to testImage directory`);
    } catch (error) {
      console.error('Error saving images:', error);
    }
  });

  ipcMain.handle('reloadFaces', async () => {
    if (app.isPackaged) {
      realoadFacesProcess = subProcess.exec(`${path.join(process.resourcesPath, 'app.asar.unpacked', 'python-env', 'bin', 'python')} -u ${path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish', 'model_training.py')}`);
    }
    else {
      realoadFacesProcess = subProcess.exec(`${path.join(__dirname, '..', '..', 'python-env', 'bin', 'python')} -u ${path.join(__dirname, '..', '..', 'main_page_login_finish', 'model_training.py')}`);
    }
  });

  ipcMain.handle('writeRfid', async (_event, name) => {
    if (app.isPackaged) {
      rfidProcess = subProcess.exec(`${path.join(process.resourcesPath, 'app.asar.unpacked', 'python-env', 'bin', 'python')} -u ${path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish', 'rfid_write.py')} ${name}`);
    }
    else {
      rfidProcess = subProcess.exec(`${path.join(__dirname, '..', '..', 'python-env', 'bin', 'python')} -u ${path.join(__dirname, '..', '..', 'main_page_login_finish', 'rfid_write.py')} ${name}`);
    }

    rfidProcess.stdout?.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    rfidProcess.stderr?.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    rfidProcess.on('close', (code) => {
      console.log(`rfidProcess exited with code ${code}`);
      if (code === 0) {
        console.log('RFID written successfully');
      } else {
        console.error('Error writing RFID');
      }
    });

    rfidProcess.on('error', (error) => {
      console.error('Error in rfidProcess:', error);
    });


  });

});


app.on('window-all-closed', () => {
  pythonProcess.kill(0);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on('exit', () => {
  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill(0);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  pythonProcess.kill(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  pythonProcess.kill(0);
});

process.on('exit', (code) => {
  console.log(`Process exited with code: ${code}`);
  pythonProcess.kill(0);
});

process.on('SIGINT', () => {
  console.log('Process interrupted (SIGINT)');
  pythonProcess.kill(0);
});

process.on('SIGTERM', () => {
  console.log('Process terminated (SIGTERM)');
  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill('SIGTERM');
  }
  process.exit(0);
});