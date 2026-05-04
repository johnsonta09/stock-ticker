const { app, BrowserWindow, screen } = require('electron');

function createWindow() {
    const display = screen.getDisplayNearestPoint(
        screen.getCursorScreenPoint()
    );

    //use FULL bounds
    const { x, y, width } = display.bounds;

    const win = new BrowserWindow({
        x: x,
        y: y,
        width: width,
        height: 70,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        movable: false,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            preload: __dirname + '/preload.js',
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    let ignoring = false;

    setInterval(() => {
        const cursor = screen.getCursorScreenPoint();

        const cursorDisplay = screen.getDisplayNearestPoint(cursor);
        const windowDisplay = screen.getDisplayMatching(win.getBounds());

        const isSameDisplay = cursorDisplay.id === windowDisplay.id;

        // Only enable click-through when entering the top band (not every frame).
        if (isSameDisplay && cursor.y <= windowDisplay.bounds.y + 70 && !ignoring) {
            win.setIgnoreMouseEvents(true, { forward: true });
            ignoring = true;

            win.webContents.send('set-visible', false);
        }

        if ((!isSameDisplay || cursor.y > windowDisplay.bounds.y + 70) && ignoring) {
            win.setIgnoreMouseEvents(false);
            ignoring = false;

            win.webContents.send('set-visible', true);
        }

    }, 16);

    win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);