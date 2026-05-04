const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onVisibilityChange: (callback) => {
        ipcRenderer.on('set-visible', (_, visible) => {
            callback(visible);
        });
    }
});