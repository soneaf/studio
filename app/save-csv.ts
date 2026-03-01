'use server';

import { prisma } from '@/lib/prisma';

import fs from 'fs';
import path from 'path';

export async function saveCocktailToCsv(data: {
    timestamp: string;
    recipeName: string;
    sku: string;
    glassware: string;
    ice: string;
    garnishes: string;
    background: string;
    countertop: string;
    showBottle: string;
    finalPrompt: string;
    // New fields
    mode?: string;
    productName?: string;
    lighting?: string;
    camera?: string;
    angle?: string;
    aspectRatio?: string;
    sourceFilename?: string; // Optional source filename override
}) {
    try {
        let imagePath = null;

        // Handle Image Saving
        const publicDir = path.join(process.cwd(), 'public');
        // Use provided filename or default
        const sourceFilename = data.sourceFilename || 'generated-result.png';

        // Remove leading slash if present
        const cleanSource = sourceFilename.startsWith('/') ? sourceFilename.slice(1) : sourceFilename;

        const sourcePath = path.join(publicDir, cleanSource);
        const historyDir = path.join(publicDir, 'history');

        if (fs.existsSync(sourcePath)) {
            if (!fs.existsSync(historyDir)) {
                fs.mkdirSync(historyDir, { recursive: true });
            }

            const fileName = `cocktail-${Date.now()}-${cleanSource}`;
            const destPath = path.join(historyDir, fileName);

            fs.copyFileSync(sourcePath, destPath);
            imagePath = `/history/${fileName}`;
        }

        const record = await prisma.cocktail.create({
            data: {
                recipeName: data.recipeName,
                sku: data.sku,
                glassware: data.glassware,
                ice: data.ice,
                garnishes: data.garnishes,
                background: data.background,
                countertop: data.countertop,
                // Convert string "Yes"/"No" back to boolean or handle logic here
                showBottle: data.showBottle.toLowerCase() === 'yes',
                finalPrompt: data.finalPrompt,
                imagePath: imagePath,
                mode: data.mode || 'tequila',
                productName: data.productName,
                lighting: data.lighting,
                camera: data.camera,
                angle: data.angle,
                aspectRatio: data.aspectRatio
            }
        });

        const shortId = `YAVE-${record.id.slice(0, 4).toUpperCase()}`;
        return { success: true, id: record.id, shortId };
    } catch (error) {
        console.error('Failed to save to DB:', error);
        return { success: false, error: String(error) };
    }
}
