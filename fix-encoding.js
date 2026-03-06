const fs = require('fs');
const files = [
    '.env',
    'prisma/schema.prisma',
    'src/app/globals.css',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/lib/prisma.ts',
    'src/lib/auth.ts',
    'src/app/api/auth/[...nextauth]/route.ts'
];

for (const file of files) {
    try {
        const b = fs.readFileSync(file);
        // check if it has null bytes (indicator of UTF-16LE or wide chars)
        if (b.length >= 2 && (b[0] === 0xff && b[1] === 0xfe)) {
            let text = b.toString('utf16le');
            // Remove BOM character if present
            if (text.charCodeAt(0) === 0xFEFF) {
                text = text.slice(1);
            }
            fs.writeFileSync(file, text, 'utf8');
            console.log(`Fixed encoding for ${file} (was UTF-16LE with BOM)`);
        } else if (b.includes(0)) {
            let text = b.toString('utf16le');
            fs.writeFileSync(file, text, 'utf8');
            console.log(`Fixed encoding for ${file} (was UTF-16LE)`);
        } else {
            // Let's strip UTF-8 BOM if present
            let text = b.toString('utf8');
            if (text.charCodeAt(0) === 0xFEFF) {
                text = text.slice(1);
                fs.writeFileSync(file, text, 'utf8');
                console.log(`Removed UTF-8 BOM from ${file}`);
            } else {
                console.log(`${file} is already ok.`);
            }
        }
    } catch (e) {
        console.error(`Failed on ${file}:`, e.message);
    }
}
