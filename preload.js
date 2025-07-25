console.log('Preload script started...');

try {
  const { contextBridge, ipcRenderer } = require('electron');
  console.log('Electron modules loaded successfully');
  console.log('contextBridge available:', !!contextBridge);
  console.log('ipcRenderer available:', !!ipcRenderer);

// Expose electron APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  saveBookFile: (hash, buffer, fileName) => 
    ipcRenderer.invoke('save-book-file', { hash, buffer, fileName }),
  
  getBookFile: (hash) => 
    ipcRenderer.invoke('get-book-file', hash),
  
  deleteBookFile: (hash) => 
    ipcRenderer.invoke('delete-book-file', hash),
  
  getBooksDirectory: () => 
    ipcRenderer.invoke('get-books-directory'),
});

// Also expose a flag to detect if we're running in Electron
contextBridge.exposeInMainWorld('isElectron', true);

console.log('Electron APIs exposed to renderer process');
console.log('- electronAPI methods:', Object.keys({
  saveBookFile: true,
  getBookFile: true, 
  deleteBookFile: true,
  getBooksDirectory: true
}));
console.log('- isElectron flag set to true');

} catch (error) {
  console.error('Error in preload script:', error);
} 