import { app, BrowserWindow, shell, ipcMain } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import {
  parseStringifiedDataWithComplexStructure,
  stringifyDataWithComplexStructure,
} from "./util";
import Store from "electron-store";
import { HealthTermValueInFile, Results } from "../../common/interfaces";
import {
  parseNewHealthExam,
  handleRemoveAllAgreegatedResultsRequest,
  handleRemoveHealthExamRequest,
  removeHealthExam,
} from "./ipcEventsHandlers";

const initTotalHealthData = () => ({
  filesData: [],
  healthDataOfAllFiles: new Map<string, HealthTermValueInFile[]>(),
});
const store = new Store();
let totalHealthData: Results = initTotalHealthData();

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
    },
    width: 1000,
    height: 1000,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    const storedData = store.get("stored_health_data") as string;
    if (storedData) {
      totalHealthData = parseStringifiedDataWithComplexStructure(
        storedData
      ) as Results;
    }

    win?.webContents.send(
      "load-stored-aggregated-health-data",
      totalHealthData
    );
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

// ============================================
//      CUSTOM IPC EVENTS
// ============================================

const handleRemoveAllAgreegatedResultsRequest = () => {
  store.clear();
  totalHealthData = initTotalHealthData();

  // Send result back to renderer process
  win?.webContents.send("receive-agreegated-health-data", totalHealthData);
};

const storeHealthDataToFile = (totalHealthData: Results) => {
  store.set(
    "stored_health_data",
    stringifyDataWithComplexStructure(totalHealthData)
  );
};

const handleRemoveHealthExamRequest = (
  e: Electron.IpcMainEvent,
  filePath: string
) => {
  removeHealthExam(totalHealthData, filePath);

  // store data to disk
  storeHealthDataToFile(totalHealthData);

  // Send result back to renderer process
  win?.webContents.send("receive-agreegated-health-data", totalHealthData);
};

const handleParseNewHealthExamRequest = async (
  e: Electron.IpcMainEvent,
  filesPaths: string[]
) => {
  totalHealthData = await parseNewHealthExam(totalHealthData, filesPaths);

  // store data to disk
  storeHealthDataToFile(totalHealthData);

  // Send result back to renderer process
  win?.webContents.send("receive-agreegated-health-data", totalHealthData);
};

ipcMain.on("parse-new-health-exams", handleParseNewHealthExamRequest);
ipcMain.on(
  "remove-all-agreegated-health-results",
  handleRemoveAllAgreegatedResultsRequest
);
ipcMain.on("remove-health-exam", handleRemoveHealthExamRequest);
