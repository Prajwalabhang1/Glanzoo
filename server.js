const fs = require('fs');
const path = require('path');

// TRAP ALL FATAL ERRORS
function logCrash(err) {
    try {
        const publicDir = path.join(__dirname, 'public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        const crashLog = `CRASH TIME: ${new Date().toISOString()}\nERROR: ${err.message}\nSTACK: ${err.stack}\n`;
        fs.writeFileSync(path.join(publicDir, 'crash.txt'), crashLog);
        console.error('SERVER CRASH LOGGER CAUGHT AN ERROR:', err);
    } catch (e) {
        console.error('Failed to write crash log:', e);
    }
}

process.on('uncaughtException', (err) => {
    logCrash(err);
    // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
    logCrash(reason instanceof Error ? reason : new Error(String(reason)));
    // process.exit(1); 
});

console.log('> Starting Crash Logging Server Module');

try {
    const { createServer } = require('http');
    const { parse } = require('url');
    const next = require('next');

    const dev = process.env.NODE_ENV !== 'production';
    const hostname = '0.0.0.0';
    const port = parseInt(process.env.PORT || '3000', 10);

    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
        createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('Error occurred handling', req.url, err);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
        }).listen(port, hostname, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://${hostname}:${port}`);
        });
    }).catch((err) => {
        logCrash(err);
        process.exit(1);
    });

} catch (err) {
    logCrash(err);
    process.exit(1);
}

