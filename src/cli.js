#!/usr/bin/env node
const { recordAndTranscribe } = require("./record");

recordAndTranscribe().then(() => process.exit());
