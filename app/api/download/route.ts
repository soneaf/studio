import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const customFilename = searchParams.get('filename');
        const relativePath = searchParams.get('path');

        let filePath: string;

        if (relativePath) {
            // Security check: Normalize and ensure it doesn't traverse up
            const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');

            // 1. Check User Data (Writable persistence for Electron)
            if (process.env.APP_USER_DATA_PATH) {
                const userPath = path.join(process.env.APP_USER_DATA_PATH, 'public', safePath);
                if (fs.existsSync(userPath)) {
                    filePath = userPath;
                } else {
                    // Fallback to built-in resources
                    filePath = path.join(process.cwd(), 'public', safePath);
                }
            } else {
                // Standard Next.js (Dev/Prod)
                filePath = path.join(process.cwd(), 'public', safePath);
            }
        } else {
            filePath = path.join(process.cwd(), 'public', 'generated-result.png');
        }

        if (!fs.existsSync(filePath)) {
            return new NextResponse('Image not found', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        // Use custom filename if provided, otherwise derive from file or default
        const filename = customFilename || (relativePath ? path.basename(relativePath) : `yave-cocktail-${Date.now()}.png`);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
