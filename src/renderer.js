const { ipcRenderer } = require("electron");

let state = 0;

const recBtn = document.getElementById("record-btn");
const output = document.getElementById("output");
const log = document.getElementById("log");

ipcRenderer.on("done", (event, text) => {
  recBtn.disabled = false;
  recBtn.textContent = "Record";
  output.textContent = text;
  state = 0;
});

ipcRenderer.on("log", (event, ...args) => {
  log.innerHTML += args.map((s) => `<div>${s}</div>`);
});

recBtn.addEventListener("click", () => {
  if (state === 0) {
    log.innerHTML = "";
    output.textContent = "";
    ipcRenderer.send("record");
    recBtn.textContent = "Stop";
    state = 1;
  } else if (state === 1) {
    recBtn.textContent = "...";
    recBtn.disabled = true;
    ipcRenderer.send("transcribe");
  }
});
