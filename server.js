// server.js — Hostinger Managed Node.js entry point
// This Bootloader intercepts the Hostinger startup script and safely runs the Next.js Standalone build.
// Hostinger strips node_modules after the build, so we MUST use the standalone server.

const path = require('path');
const fs = require('fs');

const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (!fs.existsSync(standalonePath)) {
    console.error('CRITICAL ERROR: Standalone server missing!');
    console.error('Please ensure exactly: output: "standalone" is in next.config.ts and npm run build was executed successfully.');
    process.exit(1);
}

const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

console.log(`> Booting Hostinger Standalone Mode on http://${hostname}:${port}`);

// Set the environment variables correctly for the standalone server before requiring it
process.env.PORT = port.toString();
process.env.HOSTNAME = hostname;

// Require and run the bundled Next.js server directly
require(standalonePath);
