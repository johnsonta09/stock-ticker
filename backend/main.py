import sys

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

SYMBOLS = ["AAPL", "META", "TSLA", "NVDA", "AMZN", "NBIS", "PLTR", "VELO", "OPEN", "ABNB", "NFLX",
    "HIMS", "^GSPC", "^IXIC", "^DJI"]

@app.get("/stocks")
def get_stocks():
    
    data = []
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

    return {"data": data}