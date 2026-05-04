const track = document.getElementById("ticker-track");

window.electronAPI = window.electronAPI || {};

const wrapper = document.querySelector('.ticker-wrapper');

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

    return `
        <div class="ticker-item ${colorClass}">
            <span class="symbol ${isIndex ? 'index' : ''}">
                ${SYMBOL_LABELS[stock.symbol] || stock.symbol}
            </span>
            <span class="price">$${stock.price.toFixed(2)}</span>
            <span class="change">${arrow} ${Math.abs(stock.change).toFixed(2)}</span>
            <span class="percent">(${stock.percent.toFixed(2)}%)</span>
        </div>
    `;
}

async function fetchStocks() {
    let data;
    try {
        const res = await fetch("http://127.0.0.1:8001/stocks");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
    } catch (e) {
        console.error("fetchStocks:", e);
        track.innerHTML =
            '<div class="ticker-item"><span class="symbol">Offline</span><span>Start backend (port 8001) — ' +
            (e && e.message ? e.message : "fetch failed") +
            "</span></div>";
        return;
    }

    if (!data.data || !data.data.length) {
        track.innerHTML =
            '<div class="ticker-item"><span class="symbol">No data</span><span>API returned no symbols</span></div>';
        return;
    }

    const newData = {};

    const content = data.data.map(stock => {
        const symbol = stock.symbol;

        const prev = previousData[symbol];

        const hasChanged =
            prev &&
            (prev.price !== stock.price);

        newData[symbol] = stock;

        const html = formatStock(stock);

        //inject flash only if changed
        if (hasChanged) {
            return html.replace(
                'class="ticker-item',
                'class="ticker-item flash'
            );
        }

        return html;
    }).join("");

    //update DOM
    track.innerHTML = content + content;

    const anyChanged = Object.keys(newData).some(symbol => {
        return previousData[symbol] && previousData[symbol].price !== newData[symbol].price;
    });

    if (anyChanged && wrapper) {
        wrapper.classList.remove('flash');
        void wrapper.offsetWidth; //force reflow
        wrapper.classList.add('flash');
    }

    //save for next cycle
    previousData = newData;
}


setInterval(fetchStocks, 3000);
fetchStocks();