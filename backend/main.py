import sys
import asyncio
import json
from fastapi.responses import StreamingResponse

if sys.version_info < (3, 7):
    raise ImportError(
        "This backend needs Python 3.7 or newer (asyncio.run). You have %s. "
        "Create a newer conda env, e.g.: conda create -n stockticker python=3.11 -y && "
        "conda activate stockticker && pip install -r requirements.txt"
        % sys.version.split()[0]
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from symbols import SYMBOLS

STREAM_INTERVAL_SEC = 2.0  # tune: lower = snappier UI, higher Yahoo block risk

def build_stocks_data() -> list[dict]:
    data: list[dict] = []
    for symbol in SYMBOLS:
        ticker = yf.Ticker(symbol)
        info = ticker.history(period="1d")

        if info.empty:
            continue

        try:
            closes = info["Close"]
            current_price = round(float(closes.iloc[-1]), 2)
            if len(info) >= 2:
                prev = round(float(closes.iloc[-2]), 2)
            else:
                prev = round(float(info["Open"].iloc[-1]), 2)
            if prev == 0:
                continue
            change = round(current_price - prev, 2)
            percent = round((change / prev) * 100, 2)

            data.append({
                "symbol": symbol,
                "price": current_price,
                "change": change,
                "percent": percent
            })
        except (IndexError, ValueError, TypeError):
            continue

    return data

@app.get("/stocks")
def get_stocks():
    return {"data": build_stocks_data()}

@app.get("/stocks/stream")
async def stream_stocks():
    async def events():
        while True:
            loop = asyncio.get_running_loop()
            rows = await loop.run_in_executor(None, build_stocks_data)
            payload = json.dumps({"data": rows})
            yield f"data: {payload}\n\n"
            await asyncio.sleep(STREAM_INTERVAL_SEC)

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )