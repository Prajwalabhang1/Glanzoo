const path = require('path');
const fs = require('fs');
const http = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';

// Initialize the standard Next.js Core
const app = next({ dev });
const handle = app.getRequestHandler();

// Hostinger Phusion Passenger Dynamic Port Handling
// Passenger might inject a Unix Socket / Named Pipe OR a standard TCP port String
let port = process.env.PORT || 3000;
if (typeof port === 'string' && /^\d+$/.test(port)) {
    port = parseInt(port, 10);
}

app.prepare().then(() => {
    http.createServer(async (req, res) => {
        try {
            await handle(req, res);
        } catch (err) {
            console.error('Native Request Handling Error:', err);
            // We just send a 500 for the user, but we absolutely DO NOT kill the Node process.
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Hostinger Next.js Server gracefully listening natively on injected Port/Pipe: ${port}`);
    });
}).catch(err => {
    console.error('CRITICAL: Failed to prepare Next.js architecture on boot:', err);
    process.exit(1); 
});

