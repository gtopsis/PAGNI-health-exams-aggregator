"use strict";
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
const fs = require("fs");
const pdfParser = require("pdf-parse");
const dayjs = require("dayjs");
const path = require("path");
const healthTerms = [
  "WBC  Λευκά αιμοσφ.",
  "Ne Ουδετερόφιλα",
  "Ly Λεμφοκύτταρα",
  "Mo Μονοκύτταρα",
  "Eos Ηωσινόφιλα",
  "Bas Βασεόφιλα",
  "RBC Ερυθρά αιμοσφαίρια",
  "HGB Αιμοσφαιρίνη",
  "HCT Αιματοκρίτης",
  "MCV Μέσος όγκος",
  "MCH Μέση περ.Hb",
  "MCHC Μέση πυκνότητα",
  "RDW Εύρος καταν.ερυθρ.",
  "PLT Αιμοπετάλια",
  "MPV Μέσος όγκος αιμοπεταλίων",
  "PCT Αιμοπεταλιοκρίτης",
  "PDW Εύρος κατανομής"
];
function getHealthExamDateFromText(text) {
  const dateRegex = /Ημ\/νία παραλαβής:[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/;
  const regex = new RegExp(dateRegex, "g");
  const match = text.match(regex);
  const date = match == null ? void 0 : match[0].replace("Ημ/νία παραλαβής:", "");
  return dayjs(date).isValid() ? date : void 0;
}
const searchText = (text) => {
  const result = /* @__PURE__ */ new Map();
  const date = getHealthExamDateFromText(text);
  const unionOfMetrics = healthTerms.join("|");
  const regex = new RegExp(`[0-9].*(${unionOfMetrics})`, "g");
  const matches = text.match(regex);
  matches == null ? void 0 : matches.forEach((match) => {
    const indexWhenHealthTermStarts = match.search(/[^(\d|,)]/);
    const healthTerm = match.substring(indexWhenHealthTermStarts).trim();
    const value = Number(
      match.substring(0, indexWhenHealthTermStarts).replace(",", ".")
    );
    result.set(healthTerm, value);
  });
  return { date: date || "", result };
};
async function extractHealthDataFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const { text } = await pdfParser(dataBuffer);
    return searchText(text);
  } catch (error) {
    console.error("Error: ", error);
    return { date: "", result: /* @__PURE__ */ new Map() };
  }
}
async function extractHealthDataFromPDFs() {
  const pdfsDir = path.resolve(__dirname, "../../pdfs");
  const filesData = [];
  const healthDataOfAllFiles = new Map(
    healthTerms.map((term) => [term, []])
  );
  const filenames = fs.readdirSync(pdfsDir);
  for (const filename of filenames) {
    const filePath = `${pdfsDir}/${filename}`;
    const { date, result: healthTermsFromFile } = await extractHealthDataFromPDF(filePath);
    const fileId = filesData.length;
    filesData.push({ fileId, filename, date });
    healthTermsFromFile.forEach((healthTermValue, healthTerm) => {
      const existingValuesOfHealthTerm = healthDataOfAllFiles.get(healthTerm) || [];
      existingValuesOfHealthTerm.push({ fileId, healthTermValue });
      healthDataOfAllFiles.set(healthTerm, existingValuesOfHealthTerm);
    });
  }
  return { filesData, healthDataOfAllFiles };
}
process.env.DIST_ELECTRON = node_path.join(__dirname, "..");
process.env.DIST = node_path.join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? node_path.join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
if (node_os.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
const preload = node_path.join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = node_path.join(process.env.DIST, "index.html");
async function createWindow() {
  win = new electron.BrowserWindow({
    title: "Main window",
    icon: node_path.join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:"))
      electron.shell.openExternal(url2);
    return { action: "deny" };
  });
}
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin")
    electron.app.quit();
});
electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized())
      win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
electron.ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new electron.BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
const parseHealthExams = async () => {
  const healthData = await extractHealthDataFromPDFs();
  console.info("Results:", JSON.stringify(objectPrintFormatter(healthData)));
};
electron.ipcMain.on(
  "parseHealthExams",
  async (e, content) => {
    console.debug(e, content);
    await parseHealthExams();
  }
);
const objectPrintFormatter = (toPrint) => {
  if (toPrint instanceof Set || toPrint instanceof Map) {
    return JSON.stringify(Array.from(toPrint));
  } else if (toPrint instanceof Object) {
    return JSON.stringify(toPrint);
  }
  return toPrint;
};
//# sourceMappingURL=index.js.map
