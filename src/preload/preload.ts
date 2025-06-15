import { verify } from 'crypto';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    test: (test?: any) => ipcRenderer.invoke('test', test),
})

contextBridge.exposeInMainWorld('api', {
    deleteItem: (Item: any) => ipcRenderer.invoke('deleteItem', Item), // Fixed: added Item parameter
    onItemFound: (callback: (event: any, item: any) => void) => ipcRenderer.on('itemFound', callback),
    searchItem: (search: string) => ipcRenderer.invoke('searchItem', search),
    temperature: () => ipcRenderer.invoke('temperature'),
    openDoor: () => ipcRenderer.invoke('openDoor'),
    loadConnection: () => ipcRenderer.invoke('loadConnection'),
})

contextBridge.exposeInMainWorld('nav', {
    back: () => ipcRenderer.invoke('back'),

    alerteGo: () => ipcRenderer.invoke('alerteGo'),
    editContainerGo: () => ipcRenderer.invoke('editContainerGo'),
    addItem: () => ipcRenderer.invoke('addItem'),
    editItem: (Item: any) => ipcRenderer.invoke('editItem', Item),

    goSetting: () => ipcRenderer.invoke('goSetting'),
    goEditUser: (user: any, id: string) => ipcRenderer.invoke('goEditUser', user, id),
})

contextBridge.exposeInMainWorld('user', {
    connect: (type: "rfid" | "visage" | "pin", data: any) => ipcRenderer.invoke('connect', type, data),
    adminConnect: (username: string, password: string) => ipcRenderer.invoke('adminConnect', username, password),
    disconnect: () => ipcRenderer.invoke('disconnect'),

    info: () => ipcRenderer.invoke('userInfo'),

    getAlerteListe: () => ipcRenderer.invoke('getAlerteListe'),
    getItemListe: (compartiment: "frais" | "sec") => ipcRenderer.invoke('getItemListe', compartiment),
    addItemToContainer: (item: any) => ipcRenderer.invoke('addItemToContainer', item),
    editItemInContainer: (item: any, container: string) => ipcRenderer.invoke('editItemInContainer', item, container),
})

contextBridge.exposeInMainWorld('admin', {
    collocInfo: (id: string | number) => ipcRenderer.invoke('collocInfo', id),

    savePicture: (pictures: Array<string>, name: string) => ipcRenderer.invoke('savePicture', pictures, name),
    reloadFaces: () => ipcRenderer.invoke('reloadFaces'),

    writeRfid: (name: any) => ipcRenderer.invoke('writeRfid', name),
});