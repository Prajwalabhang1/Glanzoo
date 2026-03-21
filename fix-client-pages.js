// fix-client-pages.js
// Removes "export const dynamic = 'force-dynamic';" from files that contain "use client"
// because "use client" must be the FIRST line in client components

const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
            walkDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            fixFile(fullPath);
        }
    }
}

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // If file has force-dynamic BEFORE "use client", remove the force-dynamic line
    // Pattern: force-dynamic export, then newlines, then "use client"
    const hasForce = content.includes("export const dynamic = 'force-dynamic';");
    const hasUseClient = content.includes('"use client"') || content.includes("'use client'");

    if (hasForce && hasUseClient) {
        // Remove the force-dynamic declaration and trailing newlines before "use client"
        const fixed = content
            .replace(/^export const dynamic = 'force-dynamic';\r?\n\r?\n/m, '')
            .replace(/^export const dynamic = 'force-dynamic';\r?\n/m, '');

        if (fixed !== content) {
            fs.writeFileSync(filePath, fixed);
            console.log('Fixed:', filePath);
        }
    }
}

walkDir('./app');
console.log('Done fixing client component files.');
