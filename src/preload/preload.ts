import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    connect : ()=> ipcRenderer.invoke('connect'),
    disconnect : ()=> ipcRenderer.invoke('disconnect'),
    alerteGo : ()=> ipcRenderer.invoke('alerteGo'),
    back : ()=> ipcRenderer.invoke('back'),
    editContainerGo : ()=> ipcRenderer.invoke('editContainerGo'),
    addItem : ()=> ipcRenderer.invoke('addItem'),
    editItem : (Item : any)=> ipcRenderer.invoke('editItem'),
    deleteItem : (Item : any)=> ipcRenderer.invoke('deleteItem'),
    test: (test? : any)=> ipcRenderer.invoke('test', test),
});