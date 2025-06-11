import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    test: (test?: any) => ipcRenderer.invoke('test', test),
})

contextBridge.exposeInMainWorld('api', {
    deleteItem: (Item: any) => ipcRenderer.invoke('deleteItem', Item), // Fixed: added Item parameter
    onItemFound: (callback: (event: any, item: any) => void) => ipcRenderer.on('itemFound', callback),
    searchItem: (search: string) => ipcRenderer.invoke('searchItem', search),
    temperature: () => ipcRenderer.invoke('temperature')
})

contextBridge.exposeInMainWorld('nav', {
    alerteGo: () => ipcRenderer.invoke('alerteGo'),
    back: () => ipcRenderer.invoke('back'),
    editContainerGo: () => ipcRenderer.invoke('editContainerGo'),
    addItem: () => ipcRenderer.invoke('addItem'),
    editItem: (Item: any) => ipcRenderer.invoke('editItem', Item),
})

contextBridge.exposeInMainWorld('user', {
    connect: () => ipcRenderer.invoke('connect'),
    disconnect: () => ipcRenderer.invoke('disconnect'),
    info: () => ipcRenderer.invoke('userInfo'),
})