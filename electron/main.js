const { app, BrowserWindow, screen, dialog } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');

let mainWindow;
let serverProcess;

const isDev = !app.isPackaged;
const PORT = 3456; // Standalone server usually defaults to 3000, or we passing PORT env

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: Math.floor(width * 0.9),
        height: Math.floor(height * 0.9),
        title: "Content Creation Studio",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // Optional if needed later
        }
    });

    const startUrl = isDev
        ? 'http://localhost:3005'
        : `http://localhost:${PORT}`;

    console.log(`Loading URL: ${startUrl}`);

    // In production, we might need to wait for the server to boot
    const loadPage = () => {
        mainWindow.loadURL(startUrl).then(() => {
            console.log('Page loaded successfully!');
            // Open DevTools aggressively for debugging
            mainWindow.webContents.openDevTools();
        }).catch((err) => {
            console.log('Server not ready, retrying...', err);
            setTimeout(loadPage, 1000);
        });
    };

    loadPage();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startServer() {
    if (isDev) return; // In dev, we run next separately

    // Path to the standalone server.js
    // When packaged with electron-builder, resources are in process.resourcesPath
    // We will configure builder to copy .next/standalone to resources/server
    const fs = require('fs');
    const serverPath = path.join(process.resourcesPath, 'server', 'server.js');

    // Database Setup
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'yave.db');
    const bundledDbPath = path.join(process.resourcesPath, 'prisma', 'dev.db');

    console.log(`DB Path: ${dbPath}`);

    if (!fs.existsSync(dbPath)) {
        if (fs.existsSync(bundledDbPath)) {
            console.log('Copying bundled DB to User Data...');
            fs.copyFileSync(bundledDbPath, dbPath);
        } else {
            console.error('Bundled DB not found at:', bundledDbPath);
        }
    }

    console.log(`Starting Next.js server from: ${serverPath}`);

    // Server Logging
    const logPath = path.join(app.getPath('userData'), 'server.log');
    // Using openSync to ensure we have a valid FD immediately
    const logFd = fs.openSync(logPath, 'a');
    console.log(`Server Log Path: ${logPath}`);

    serverProcess = fork(serverPath, [], {
        stdio: ['ignore', logFd, logFd, 'ipc'],
        env: {
            ...process.env,
            PORT: PORT,
            NODE_ENV: 'production',
            DATABASE_URL: `file:${dbPath}`,
            // NODE_PATH: path.join(process.resourcesPath, 'server', 'libs'), // Removed: using standard node_modules
            APP_USER_DATA_PATH: app.getPath('userData')
        }
    });

    serverProcess.on('error', (err) => {
        console.error('Server process error:', err);
        dialog.showErrorBox('Internal Server Error', `The internal server failed to start: ${err.message}`);
    });

    serverProcess.on('exit', (code, signal) => {
        console.log(`Server process exited with code ${code} and signal ${signal}`);
        if (code !== 0 && code !== null) {
            dialog.showErrorBox('Server Crashed', `The internal server crashed unexpectedly with code ${code}. Please check the logs in ${app.getPath('userData')}/server.log`);
        }
    });
}

app.whenReady().then(() => {
    startServer();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});
