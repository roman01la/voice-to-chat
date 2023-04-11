const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function getFilename() {
  const d = new Date();
  const fileName = [
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  ].join("_");
  return fileName;
}

function convertToMP3(infile, outfile) {
  return new Promise((resolve, reject) => {
    const proc = spawn("lame", [infile, outfile]);
    proc.on("exit", () => {
      resolve();
    });
  });
}

function copyToClipboard(textToCopy) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn("pbcopy");
    childProcess.stdin.write(textToCopy);
    childProcess.stdin.end();
    childProcess.on("exit", () => {
      resolve();
    });
  });
}

const instructions = `
Below is a transcript of an audio recording. Rewrite it in such a way that it looks more like an actual
text a human had written in a chat, instead of being a transcribed audio. Shorten the text if possible.
Preserve the tone of the transcription.

Transcript:`;

async function transcribe(fileName) {
  const resp = await openai.createTranscription(
    fs.createReadStream(fileName),
    "whisper-1"
  );
  console.log("\nTranscribed:");
  console.log(resp.data.text);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `${instructions}\n${resp.data.text}` }],
  });
  console.log("\nAdapted for written style:");
  console.log(completion.data.choices[0].message.content);

  return completion.data.choices[0].message.content;
}

let recProc;

function record(fname) {
  const fileName = `out/${fname}.wav`;
  recProc = spawn("rec", ["-r", "44100", "-c", "1", fileName]);
  console.log("recording...");
}

function convertAndTranscribe(fname) {
  return new Promise((resolve, reject) => {
    const fileName = path.join(__dirname, `../out/${fname}.wav`);
    const fileNameMP3 = path.join(__dirname, `../out/${fname}.mp3`);

    let text;

    recProc.on("exit", async () => {
      await convertToMP3(fileName, fileNameMP3);
      text = await transcribe(fileNameMP3);
      await copyToClipboard(text);
      fs.unlinkSync(fileName);
      fs.unlinkSync(fileNameMP3);
      resolve(text);
    });
    recProc.kill();
    recProc = null;
  });
}

function recordAndTranscribe() {
  return new Promise((resolve, reject) => {
    const fname = getFilename();
    record(fname);
    process.stdin.on("data", (d) => {
      const str = d.toString();
      if (str === "\n") {
        console.log("transcribing...");
        convertAndTranscribe(fname).then(resolve).catch(reject);
      }
    });
  });
}

module.exports = {
  recordAndTranscribe,
  record,
  convertAndTranscribe,
  getFilename,
};
