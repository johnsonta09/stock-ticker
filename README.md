# Stock Ticker

A desktop **always-on-top** ticker bar built with **Electron**. It shows a scrolling strip of stock quotes powered by a small **FastAPI** backend (Yahoo Finance data via **yfinance**) and a static **HTML/CSS/JS** frontend served locally.

> **Disclaimer:** Market data comes from free Yahoo Finance sources and may be delayed or incomplete. This is a personal project, not financial advice.

---

## What you need

| Requirement | Notes |
|-------------|--------|
| **Node.js** | Includes **npm**. Use a current **LTS** version from [https://nodejs.org/](https://nodejs.org/) (recommended). |
| **Python** | **3.9+** (3.7+ minimum for the tooling used). [https://www.python.org/downloads/](https://www.python.org/downloads/) or your preferred install. |

After installing Node.js, open a **new** terminal and confirm:

```bash
node --version
npm --version
```

After installing Python:

```bash
python --version
```

---

## Install Node.js (first-time setup)

1. Go to [https://nodejs.org/](https://nodejs.org/).
2. Download the **LTS** installer for your OS (Windows `.msi`, macOS `.pkg`, etc.).
3. Run the installer and accept the defaults (this adds Node and npm to your PATH).
4. **Close and reopen** any open terminals so `node` and `npm` are recognized.

---

## Get the project

Clone the repository or download and unzip it, then open a terminal in the project root (the folder that contains `main.js`, `package.json`, `frontend/`, and `backend/`).

---

## Install dependencies

Run these from the **project root** (adjust `cd` path to match where you put the project).

### 1. Electron (project root)

```bash
cd path/to/stock-ticker
npm install
```

### 2. Frontend static server

```bash
cd frontend
npm install
cd ..
```

### 3. Python backend

```bash
cd backend
python -m pip install -r requirements.txt
cd ..
```

Using a **virtual environment** is recommended (e.g. `python -m venv .venv` then activate it before `pip install`).

---

## Run the app (recommended: one command)

After dependencies are installed, start everything from the project root:

```bash
cd path/to/stock-ticker
npm start
```

This starts:

- FastAPI backend on `http://127.0.0.1:8001`
- Frontend server on `http://localhost:3000`
- Electron app window

### Root scripts used

The one-command flow expects these root scripts in `package.json`:

- `backend` -> runs Uvicorn in `backend/`
- `frontend` -> runs frontend server in `frontend/`
- `electron` -> waits for ports `3000` and `8001`, then starts Electron
- `start` -> runs all three with `concurrently`

Install root helper dev dependencies if you added this setup:

```bash
npm install
```

---

## Run the app (manual: three processes)

The ticker expects:

- **Port 8001** — API (FastAPI / Uvicorn)
- **Port 3000** — static frontend (`serve`)

Use **three terminals** (or tabs) if you prefer manual startup.

### Terminal 1 — Backend

```bash
cd path/to/stock-ticker/backend
python -m uvicorn main:app --reload --port 8001
```

Leave this running. You should see Uvicorn listening on `http://127.0.0.1:8001`.

### Terminal 2 — Frontend

```bash
cd path/to/stock-ticker/frontend
npm start
```

Leave this running. It serves the UI at `http://localhost:3000`.

### Terminal 3 — Electron shell

```bash
cd path/to/stock-ticker
npx electron main.js
```

The transparent bar loads the UI from `http://localhost:3000` and reads quotes from the API.

> **Note:** Root `package.json` should use `"main": "main.js"` for consistency. If set correctly, you can also run `npx electron .`.

---

## Configuration

- **Symbols:** Edit `backend/symbols.py` (or your symbols module) to change tickers.
- **API / UI URLs:** The frontend defaults to `http://127.0.0.1:8001` in `frontend/script.js`. Change `API_BASE` if your backend runs elsewhere.

---

## Behavior (short)

- The window is a **frameless, topmost** strip at the top of the primary display area used at launch.
- Moving the pointer into the **top band** of the screen toggles **click-through** and hides the ticker visuals so you can see and interact with windows underneath (e.g. a browser).
- Quote updates are pushed from the backend (REST + optional SSE stream, depending on your `script.js` / `main.py` setup).

---

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| `npm` / `node` not found | Install Node.js from nodejs.org and **restart the terminal**. |
| Blank ticker / “Offline” | Ensure the backend is running on **8001** and frontend on **3000** before starting Electron. |
| `asyncio.run` / old Python errors | Use Python **3.9+** and a fresh venv. |
| Port already in use | Stop the other process using **3000** or **8001**, or change ports in `frontend/package.json` (`serve` flag), Uvicorn `--port`, `main.js` `loadURL`, and `frontend/script.js` `API_BASE` together. |

---

## License

See repository license (if any). Third-party data is subject to Yahoo / provider terms.
