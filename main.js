const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  // Create the browser window.
  const preloadPath = path.resolve(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', require('fs').existsSync(preloadPath));
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadPath,
    },
    show: false,
  });

  // Load the app
  console.log('isDev:', isDev, 'NODE_ENV:', process.env.NODE_ENV, 'isPackaged:', app.isPackaged);
  
  if (isDev) {
    console.log('Loading development URL: http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    // Open the DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading production file:', path.join(__dirname, 'out/index.html'));
    mainWindow.loadFile(path.join(__dirname, 'out/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Get books directory path
function getBooksDirectory() {
  return path.join(app.getPath('userData'), 'Books');
}

// Ensure books directory exists
async function ensureBooksDirectory() {
  const booksDir = getBooksDirectory();
  try {
    await fs.access(booksDir);
  } catch {
    await fs.mkdir(booksDir, { recursive: true });
  }
  return booksDir;
}

// IPC Handlers for file operations
ipcMain.handle('save-book-file', async (event, { hash, buffer, fileName }) => {
  try {
    const booksDir = await ensureBooksDirectory();
    const filePath = path.join(booksDir, `${hash}.book`);
    
    // Save file metadata alongside the file
    const metadata = {
      fileName,
      originalHash: hash,
      savedAt: Date.now()
    };
    
    const metadataPath = path.join(booksDir, `${hash}.meta`);
    
    // Save both the file and its metadata
    await fs.writeFile(filePath, Buffer.from(buffer));
    await fs.writeFile(metadataPath, JSON.stringify(metadata));
    
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Failed to save book file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-book-file', async (event, hash) => {
  try {
    const booksDir = getBooksDirectory();
    const filePath = path.join(booksDir, `${hash}.book`);
    const metadataPath = path.join(booksDir, `${hash}.meta`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
      await fs.access(metadataPath);
    } catch {
      return { success: false, error: 'File not found' };
    }
    
    // Read file and metadata
    const buffer = await fs.readFile(filePath);
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);
    
    return {
      success: true,
      buffer: Array.from(new Uint8Array(buffer)),
      fileName: metadata.fileName
    };
  } catch (error) {
    console.error('Failed to get book file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-book-file', async (event, hash) => {
  try {
    const booksDir = getBooksDirectory();
    const filePath = path.join(booksDir, `${hash}.book`);
    const metadataPath = path.join(booksDir, `${hash}.meta`);
    
    // Delete both file and metadata if they exist
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, that's ok
    }
    
    try {
      await fs.unlink(metadataPath);
    } catch (error) {
      // Metadata might not exist, that's ok
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete book file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-books-directory', async () => {
  return getBooksDirectory();
}); 