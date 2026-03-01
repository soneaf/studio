'use server';

import { prisma } from '@/lib/prisma';

export type CocktailRecord = {
    id: string; // Added ID from DB
    timestamp: string; // Dates will be serialized to strings when sent to client
    recipeName: string;
    sku: string;
    glassware: string;
    ice: string;
    garnishes: string;
    background: string;
    countertop: string;
    showBottle: string;
    finalPrompt: string;
    imagePath?: string | null;
    mode?: string | null;
    productName?: string | null;
    lighting?: string | null;
    camera?: string | null;
    angle?: string | null;
    aspectRatio?: string | null;
};

// Map a Prisma Cocktail record to our serialized CocktailRecord type
function mapCocktailRecord(record: { timestamp: Date; showBottle: boolean; [key: string]: unknown }): CocktailRecord {
    return {
        ...record,
        timestamp: record.timestamp.toISOString(),
        showBottle: record.showBottle ? 'Yes' : 'No',
    } as CocktailRecord;
}

export async function getCocktailHistory(mode?: 'tequila' | 'studio'): Promise<CocktailRecord[]> {
    try {
        const whereClause = mode ? { mode } : {};
        const history = await prisma.cocktail.findMany({
            where: whereClause,
            orderBy: { timestamp: 'desc' }
        });

        return history.map(mapCocktailRecord);
    } catch (error) {
        console.error('Failed to read history from DB:', error);
        return [];
    }
}

export async function getCocktailById(id: string): Promise<CocktailRecord | null> {
    try {
        const record = await prisma.cocktail.findUnique({
            where: { id }
        });

        if (!record) return null;
        return mapCocktailRecord(record);
    } catch (error) {
        console.error('Failed to fetch cocktail by ID:', error);
        return null;
    }
}
