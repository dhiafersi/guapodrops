import * as fs from 'fs';
import * as path from 'path';

// Clean up left over prisma file
const prismaTs = path.join(process.cwd(), 'src', 'lib', 'prisma.ts');
if (fs.existsSync(prismaTs)) {
    fs.unlinkSync(prismaTs);
    console.log("Removed old prisma.ts file");
}
