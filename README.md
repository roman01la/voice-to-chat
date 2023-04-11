# voice-to-chat

A small CLI and menubar app that transcribes voice recording and rewrites it in a style of a written text. Using it for lengthy responses, because I'm lazy to type in a lot of text.

## Installation

```bash
brew install sox # installs `rec` (audio recording) and `lame` (wav to mp3 conversion) CLIs
```

## Usage

Create `.env` file at the root of the project and add your OpenAI key in there

```
OPENAI_API_KEY="${OpenAI key}"
```

When done, it will print the output and put it onto your clipboard.

### CLI

```bash
./src/cli.js # actual command
recording...
Transcribed:
Hey, how's it going? I wanna get a lunch and then after that we can jump on a call and discuss whatever you're working on.
Adapted for written style:
Hey! How are you? Let's grab lunch and discuss your current project later on a call.
```

```bash
# or create a symlink
ln -s /absolute/path/to/src/cli.js /usr/local/bin/transcribe

transcribe
```

### Menubar app

```bash
yarn start # this will run Electron app
```

#### TODO:

- Package the Electron app into an executable
