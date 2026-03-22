// Post-build script to copy static assets into the standalone directory.
// The standalone server does not serve static files natively without copying them into its own tree.
const fs = require('fs');
const path = require('path');

const copyRecursiveSync = function (src, dest) {
    if (!fs.existsSync(src)) return;
    
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName),
                              path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

const nextDir = path.join(__dirname, '.next');
const standaloneDir = path.join(nextDir, 'standalone');

if (!fs.existsSync(standaloneDir)) {
    console.log('No standalone directory found, skipping asset copy.');
    process.exit(0);
}

console.log('Copying static assets to standalone directory for Hostinger...');

// Copy 'public' folder
const publicSrc = path.join(__dirname, 'public');
const publicDest = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc)) {
    console.log(`Copying 'public' folder...`);
    copyRecursiveSync(publicSrc, publicDest);
}

// Copy '.next/static' folder
const staticSrc = path.join(nextDir, 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
    console.log(`Copying '.next/static' folder...`);
    copyRecursiveSync(staticSrc, staticDest);
}

console.log('Standalone build preparation complete.');
