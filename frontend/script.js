const track = document.getElementById("ticker-track");

window.electronAPI = window.electronAPI || {};

const wrapper = document.querySelector('.ticker-wrapper');

/** Same origin as your FastAPI server */
const API_BASE = "http://127.0.0.1:8001";

function setTickerVisible(visible) {
    if (!wrapper) return;
    wrapper.style.opacity = visible ? '1' : '0';
}

window.addEventListener('message', (event) => {
    if (event.data === 'visible') {
        setTickerVisible(true);
    } else if (event.data === 'hidden') {
        setTickerVisible(false);
    }
});

if (window.electronAPI && typeof window.electronAPI.onVisibilityChange === 'function') {
    window.electronAPI.onVisibilityChange((visible) => {
        setTickerVisible(visible);
    });
}

setTickerVisible(true);

let previousData = {};

const SYMBOL_LABELS = {
    "^GSPC": "S&P 500",
    "^IXIC": "NASDAQ",
    "^DJI": "DOWJ"
};

function formatStock(stock) {
    const isUp = stock.change >= 0;
    const arrow = isUp ? '▲' : '▼';
    const colorClass = isUp ? "positive" : "negative";
    const isIndex = stock.symbol.startsWith("^");
    const showFire = stock.change > 0 && stock.percent > 10;

    return `
        <div class="ticker-item ${colorClass}">
            <span class="symbol ${isIndex ? 'index' : ''}">
                ${SYMBOL_LABELS[stock.symbol] || stock.symbol}
            </span>
            <span class="price">$${stock.price.toFixed(2)}</span>
            <span class="change">${arrow} ${Math.abs(stock.change).toFixed(2)}</span>
            <span class="percent">(${stock.percent.toFixed(2)}%)${showFire ? ' 🔥' : ''}</span>
        </div>
    `;
}

function showOfflineReason(message) {
    track.innerHTML =
        '<div class="ticker-item"><span class="symbol">Offline</span><span>' +
        message +
        "</span></div>";
}

/**
 * Same shape as GET /stocks: { data: [ { symbol, price, change, percent }, ... ] }
 */
function applyStockPayload(data) {
    if (!data || !data.data || !data.data.length) {
        track.innerHTML =
            '<div class="ticker-item"><span class="symbol">No data</span><span>API returned no symbols</span></div>';
        return;
    }
    const newData = {};
    const content = data.data
        .map((stock) => {
            const symbol = stock.symbol;
            const prev = previousData[symbol];
            const hasChanged = prev && prev.price !== stock.price;
            newData[symbol] = stock;
            const html = formatStock(stock);
            if (hasChanged) {
                return html.replace('class="ticker-item', 'class="ticker-item flash');
            }
            return html;
        })
        .join("");
    track.innerHTML = content + content;
    const anyChanged = Object.keys(newData).some((symbol) => {
        return previousData[symbol] && previousData[symbol].price !== newData[symbol].price;
    });
    if (anyChanged && wrapper) {
        wrapper.classList.remove("flash");
        void wrapper.offsetWidth;
        wrapper.classList.add("flash");
    }
    previousData = newData;
}

/** first paint via REST while SSE connects */
async function fetchStocksOnce() {
    try {
        const res = await fetch(`${API_BASE}/stocks`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        applyStockPayload(data);
    } catch (e) {
        console.error("fetchStocksOnce:", e);
        showOfflineReason(
            "Start backend (port 8001) — " + (e && e.message ? e.message : "fetch failed")
        );
    }
}

let stockEventSource = null;

function connectStockStream() {
    if (stockEventSource) {
        stockEventSource.close();
        stockEventSource = null;
    }
    stockEventSource = new EventSource(`${API_BASE}/stocks/stream`);
    stockEventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            applyStockPayload(data);
        } catch (e) {
            console.error("SSE parse error:", e);
        }
    };
    stockEventSource.onerror = () => {
        stockEventSource.close();
        stockEventSource = null;
        showOfflineReason("Stream lost — reconnecting…");
        setTimeout(connectStockStream, 3000);
    };
}

fetchStocksOnce();
connectStockStream();