const { ipcMain } = require("electron");
const { menubar } = require("menubar");
const path = require("path");
const { record, convertAndTranscribe, getFilename } = require("./record");

const mb = menubar({
  icon: path.join(__dirname, "../icon.png"),
  browserWindow: {
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  },
});

mb.on("ready", () => {
  // your app code here
});

let fname;

ipcMain.on("record", (event) => {
  console.log = (...args) => {
    event.reply("log", ...args);
  };

  fname = getFilename();
  record(fname);
});

ipcMain.on("transcribe", (event) => {
  convertAndTranscribe(fname)
    .then((text) => event.reply("done", text))
    .catch((error) => event.reply("error", error.message));
});
