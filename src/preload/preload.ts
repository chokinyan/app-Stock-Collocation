import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    connect : ()=> ipcRenderer.invoke('connect'),
    disconnect : ()=> ipcRenderer.invoke('disconnect'),
    alerteGo : ()=> ipcRenderer.invoke('alerteGo'),
    back : ()=> ipcRenderer.invoke('back'),
    editContainerGo : ()=> ipcRenderer.invoke('editContainerGo'),
    test: (test? : any)=> ipcRenderer.invoke('test', test),
});