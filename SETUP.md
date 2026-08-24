# Local setup and deployment

## Requirements

- Git
- Node.js 22.13 or newer
- npm (included with Node.js)

No API key, cloud account, database, or environment variable is required for the local application.

## Install

```powershell
git clone https://github.com/YeChen-coder/ResumeBuilder.git
cd ResumeBuilder
npm ci
```

## Run in development mode

```powershell
npm run dev
```

Open `http://localhost:3000/` in a browser.

On Windows, `launch-resume.cmd` can be double-clicked instead. It installs dependencies when necessary, starts the application, waits for it to become available, and opens the browser automatically.

## Run a production build locally

```powershell
npm run build
npm start
```

Then open `http://localhost:3000/`.

## Validate a checkout

```powershell
npm run lint
npm test
```

## Local data and privacy

Resume content is stored in the browser's `localStorage`. It is not uploaded by the application. Use the JSON backup button before clearing browser data or moving to another computer.

Personal JSON imports belong in `imports/` and are ignored by Git. The two tracked files in that directory are schema templates only. `demo/resume-canvas-demo.json` contains fictional data and can be imported for testing.

Do not commit `.env` files, exported resumes, private keys, local databases, or real resume backups. The repository `.gitignore` excludes these by default.
