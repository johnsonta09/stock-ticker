# Stock Ticker

A desktop, always-on-top stock ticker built with Electron + FastAPI.
The app renders a scrolling quote bar and supports click-through behavior when your cursor is in the top band of the screen.

> Data source: free Yahoo Finance via `yfinance` (can be delayed/incomplete).

---

## Quick Start

From the project root:

```bash
npm start
```

---

## Requirements

- [Node.js LTS](https://nodejs.org/) (includes `npm`)
- Python 3.9+ (3.7+ minimum)

Verify installs:

```bash
node --version
npm --version
python --version
```

---

## Install

From the project root (folder containing `package.json`, `main.js`, `frontend/`, `backend/`):

```bash
cd path/to/stock-ticker
npm install
npm --prefix frontend install
python -m pip install -r backend/requirements.txt
```

---

## Run (One Command)

From project root:

```bash
npm start
```

This starts all required services:

- Backend API: `http://127.0.0.1:8001`
- Frontend server: `http://localhost:3000`
- Electron app window

---

## Project Scripts (Root `package.json`)

- `npm run backend` -> starts FastAPI/Uvicorn on port `8001`
- `npm run frontend` -> starts frontend static server on port `3000`
- `npm run electron` -> waits for both ports, then starts Electron
- `npm start` -> runs backend + frontend + electron together

---

## Configuration

- Symbols list: `backend/symbols.py`
- Backend base URL in UI: `frontend/script.js` (`API_BASE`)
- Scroll speed: `frontend/style.css` in `.ticker-track` animation duration

---

## Troubleshooting

- `node` or `npm` not recognized
  - Reinstall Node.js LTS and restart terminal.
- `python` issues / `asyncio.run` errors
  - Use Python 3.9+ and reinstall backend packages:
    ```bash
    python -m pip install -r backend/requirements.txt
    ```
- Ticker says Offline / no quotes
  - Ensure backend is reachable on `127.0.0.1:8001`.
- Port conflict (`3000` or `8001`)
  - Stop the conflicting process or update ports consistently in:
    - root `package.json` scripts
    - `main.js` (`loadURL`)
    - `frontend/script.js` (`API_BASE`)

---

## Disclaimer

This project is for personal/educational use. It is not financial advice.