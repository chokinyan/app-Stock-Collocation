import { app, BrowserWindow, ipcMain } from 'electron';
import KioskBoard from 'kioskboard';
import path from 'path';
import subProcess from 'child_process';
import axios, { AxiosResponse } from 'axios';
import fs from 'fs';

let token: string = "";

let pythonProcess: subProcess.ChildProcess;

subProcess.exec('sudo fuser -k 5000/tcp');

if (app.isPackaged) {
  pythonProcess = subProcess.spawn(
    path.join(process.resourcesPath, 'app.asar.unpacked', 'python-env', 'bin', 'python'),
    ['-u', path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish', 'app.py')],
    {
      stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
      detached: false // Important pour pouvoir tuer le processus
    }
  );
} else {
  pythonProcess = subProcess.spawn(
    path.join(__dirname, '..', '..', 'python-env', 'bin', 'python'),
    ['-u', path.join(__dirname, '..', '..', 'main_page_login_finish', 'app.py')],
    {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    }
  );
}

let rfidProcess: subProcess.ChildProcess;

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

    console.log("Type de connexion:", type);
    console.log("Data de connexion:", data);

    switch (type) {
      case 'rfid':
        /*await mainWindow.loadFile(path.join(__dirname, '../../public/colloc/rfid/index.html'));*/
        rep = await axios.post("http://localhost:3000/Authentification", {
          "action": "rfid",
          "rfid": data.name,
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

  ipcMain.handle('back', () => {
    mainWindow.webContents.navigationHistory.goBack();
  });

  ipcMain.handle('test', (_event, test) => {
    console.log(test);
  });

  ipcMain.handle('addItem', (_event) => {
    mainWindow.loadFile(path.join(__dirname, '../../public/colloc/compartiment/edit/addItem.html'));
  });

  ipcMain.handle('editItem', (_event, item) => {
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

  ipcMain.handle('loadConnection', () => {
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

  ipcMain.handle('savePicture', (_, pictures: Array<string>, name) => {
    let testImageDir: string;
    if (app.isPackaged) {
      testImageDir = path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish', 'dataset', name);
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

  ipcMain.handle('writeRfid', (_event, name) => {
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

  ipcMain.handle('dlUser', async (_event, id, name) => {
    console.log(`Removing user with ID: ${id} and name: ${name}`);
    if (name.trim() === "") {
      console.error('User name is empty, cannot proceed with removal.');
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3000/User`, {
        data: {
          token: token,
          id: id
        }
      });
      console.log('User removed successfully:', response.data);
    } catch (error) {
      console.error('Error removing user:', error);
    }

    // Delete the user's dataset folder
    let datasetPath: string;
    if (app.isPackaged) {
      datasetPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish', 'dataset', name);
    } else {
      datasetPath = path.join(__dirname, '..', '..', 'main_page_login_finish', 'dataset', name);
    }

    if (fs.existsSync(datasetPath)) {
      fs.rmSync(datasetPath, { recursive: true, force: true });
      console.log(`Dataset folder deleted for user: ${name}`);
    } else {
      console.log(`Dataset folder not found for user: ${name}`);
    }

    mainWindow.loadFile(path.join(__dirname, '../../public/admin/dashboard/index.html'));

  });

  ipcMain.handle('addUser', async (_event, info) => {
    try {
      const response = await axios.post(`http://localhost:3000/User`, {
        token: token,
        nom: info.nom,
        prenom: info.prenom,
        rfid: info.rfid,
        pin: info.pin,
        mdp: info.mdp,
        id: info.id
      });
      console.log('User added successfully:', response.data);
      reloadFaces();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  });

});

const reloadFaces = () => {

  if (realoadFacesProcess) {
    realoadFacesProcess.kill();
  }

  if (app.isPackaged) {
    realoadFacesProcess = subProcess.exec(`${path.join(process.resourcesPath, 'app.asar.unpacked', 'python-env', 'bin', 'python')} -u ${path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish', 'model_training.py')}`);
  }
  else {
    realoadFacesProcess = subProcess.exec(`${path.join(__dirname, '..', '..', 'python-env', 'bin', 'python')} -u ${path.join(__dirname, '..', '..', 'main_page_login_finish', 'model_training.py')}`);
  }

  mainWindow.loadFile(path.join(__dirname, '../../public/admin/waitingFacesLoad/index.html'));

  realoadFacesProcess.once('close', (_code) => {
    mainWindow.loadFile(path.join(__dirname, '../../public/admin/dashboard/index.html'));
    reloadPythonProcess();
  });

};


const reloadPythonProcess = () => {
  if (pythonProcess) {
    pythonProcess.kill(0);
  }
  if (app.isPackaged) {
    pythonProcess = subProcess.spawn(
      path.join(process.resourcesPath, 'app.asar.unpacked', 'python-env', 'bin', 'python'),
      ['-u', path.join(process.resourcesPath, 'app.asar.unpacked', 'main_page_login_finish', 'app.py')],
      {
        stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
        detached: false // Important pour pouvoir tuer le processus
      }
    );
  } else {
    pythonProcess = subProcess.spawn(
      path.join(__dirname, '..', '..', 'python-env', 'bin', 'python'),
      ['-u', path.join(__dirname, '..', '..', 'main_page_login_finish', 'app.py')],
      {
        stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
        detached: false // Important pour pouvoir tuer le processus
      }
    );
  }
};

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

process.on('beforeExit', (code) => {
  console.log(`Process is about to exit with code: ${code}`);
  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill(0);
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