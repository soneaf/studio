'use server';

import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { exec } from 'child_process';
import { promisify } from 'util';
import { buildFileName } from '@/lib/filename-utils';
import { sanitizeFilename } from '@/lib/file-utils';

const execAsync = promisify(exec);

function getPublicDir(subpath: string) {
    const base = process.env.APP_USER_DATA_PATH
        ? path.join(process.env.APP_USER_DATA_PATH, 'public')
        : path.join(process.cwd(), 'public');
    const fullPath = path.join(base, subpath);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    return fullPath;
}

import { TequilaSku } from '@/lib/data';
import type { HumanElement } from '@/lib/builder-context';

// Utility: Delete a file from the public directory (handles Electron vs dev paths)
function deletePublicFile(relativePath: string) {
    let fullPath = path.join(process.cwd(), 'public', relativePath);
    if (process.env.APP_USER_DATA_PATH) {
        fullPath = path.join(process.env.APP_USER_DATA_PATH, 'public', relativePath);
    }
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

const SETTINGS_FILE = process.env.APP_USER_DATA_PATH
    ? path.join(process.env.APP_USER_DATA_PATH, 'yave-settings.json')
    : path.join(process.cwd(), 'yave-settings.json');

export type Client = {
    id: string;
    name: string;
};

export type GeneralProduct = {
    id: string;
    name: string;
    description: string;
    imagePath: string; // stored in public/products/
    category?: string; // e.g., 'Cosmetics', 'Tech'
    variants?: { id: string; name: string; imagePath: string }[]; // New: Additional views
    clientId?: string; // Multi-tenancy
};

export type PhotoShootAsset = {
    id: string;
    name: string;
    imagePath: string;
    clientId?: string; // Multi-tenancy
};

export type JsonTemplate = {
    id: string;
    name: string;
    json: string;
    createdAt: number;
};

export type AppSettings = {
    localSavePath?: string;
    outputFolder?: string; // Restored
    autoSave?: boolean;   // Restored
    // Legacy fields removed: filenamePrefix, filenameSuffix
    customBottles?: TequilaSku[];
    generalProducts?: GeneralProduct[]; // New: For Studio Mode
    photoShootAssets?: PhotoShootAsset[]; // New: For Photo Shoot Assets
    fileNameBuilder?: { type: string; value: string }[]; // New: Complex file naming
    brandPresets?: BrandPreset[]; // New: User saved presets
    hiddenPresetIds?: string[];   // New: Deleted default presets
    clients?: Client[]; // Multi-tenancy
    jsonTemplates?: JsonTemplate[]; // JSON prompt templates
};

export type FullTemplateConfig = {
    recipeName?: string;
    visualDescription?: string;
    glasswareId?: string;
    iceId?: string;
    iceQuantity?: string;
    garnishes?: Array<{ id: string; name: string; placement: string; quantity: number }>;
    props?: Array<{ id: string; name: string; value?: string; placement?: string; quantity?: number }>;
    aspectRatio?: string;
    customBackground?: string;
    customCountertop?: string;
    customLighting?: string;
    humanElement?: HumanElement;
};

export type BrandPreset = {
    id: string;
    title: string;
    subtitle: string;
    emoji: string;
    mode?: 'tequila' | 'studio'; // New: Save workflow mode
    clientId?: string; // Multi-tenancy
    isFullTemplate?: boolean; // Flag to distinguish full templates
    settings: {
        camera: string;        // ID
        lighting: string;      // ID
        background: string;    // ID
        countertop: string;    // ID
        angle: string;         // ID
    };
    fullConfig?: FullTemplateConfig; // Extended configuration for full templates
};

// ... existing getSettings ... (updated default return in next chunk if needed, but TS handles optional)

// ... existing functions ...

// 4. Bottle Asset Management
export async function uploadBottleAsset(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const skuId = formData.get('skuId') as string;

        if (!file || !skuId) {
            return { success: false, error: "Missing file or SKU ID." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Security check: ensure skuId is valid alphanumeric
        if (!/^[a-z0-9-]+$/.test(skuId)) {
            return { success: false, error: "Invalid SKU ID" };
        }

        const fileName = `${skuId}.png`;
        const publicDir = getPublicDir('bottles');
        const filePath = path.join(publicDir, fileName);

        // Directory creation handled by helper

        fs.writeFileSync(filePath, buffer);


        revalidatePath('/');
        return { success: true };
    } catch (e) {
        console.error("Upload failed:", e);
        return { success: false, error: String(e) };
    }
}

export async function uploadCustomBottle(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const clientId = formData.get('clientId') as string; // Multi-tenancy
        const heightCategory = (formData.get('heightCategory') || 'standard') as 'short' | 'standard' | 'tall';

        if (!file || !name) {
            return { success: false, error: "Missing file or Name." };
        }

        // Generate ID
        const id = `custom-${Date.now()}`;
        const fileName = `${id}.png`;
        const publicDir = getPublicDir('bottles');
        const filePath = path.join(publicDir, fileName);

        // Save Image
        // Directory created by helper

        const bytes = await file.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(bytes));

        // Update Settings
        const settings = await getSettings();
        const newBottle: TequilaSku = {
            id,
            name,
            sku: id,
            colorDescription: 'custom', // Placeholder
            bottlePath: `/bottles/${fileName}`,
            isCustom: true,
            customDescription: description,
            heightCategory,
            clientId: clientId || undefined
        };

        const updatedBottles = settings.customBottles ? [...settings.customBottles, newBottle] : [newBottle];
        await saveSettings({ ...settings, customBottles: updatedBottles });

        revalidatePath('/');
        return { success: true, bottle: newBottle };
    } catch (e) {
        console.error("Custom Upload failed:", e);
        return { success: false, error: String(e) };
    }
}

export async function updateCustomBottle(formData: FormData) {
    try {
        const id = formData.get('id') as string;
        const file = formData.get('file') as File | null; // Optional
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const heightCategory = (formData.get('heightCategory') || 'standard') as 'short' | 'standard' | 'tall';

        if (!id || !name) return { success: false, error: "Missing ID or Name." };

        const settings = await getSettings();
        if (!settings.customBottles) return { success: false, error: "No custom bottles found." };

        const index = settings.customBottles.findIndex(b => b.id === id);
        if (index === -1) return { success: false, error: "Bottle not found." };

        let bottlePath = settings.customBottles[index].bottlePath;

        // Handle Image Replacement
        if (file && file.size > 0) {
            // Re-use ID for filename to overwrite? Or new timestamp to bust cache?
            // Using new timestamp is safer for browser cache busting
            const fileSize = file.size; // Just accessing it to ensure it exists
            const newIdPart = Date.now();
            const fileName = `custom-${newIdPart}.png`;
            const publicDir = path.join(process.cwd(), 'public', 'bottles');
            const filePath = path.join(publicDir, fileName);

            // Ensure directory exists
            if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

            const bytes = await file.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(bytes));

            bottlePath = `/bottles/${fileName}`;
        }

        // Update Object
        const updatedBottle: TequilaSku = {
            ...settings.customBottles[index],
            name,
            customDescription: description,
            heightCategory,
            bottlePath
        };

        const updatedList = [...settings.customBottles];
        updatedList[index] = updatedBottle;

        await saveSettings({ ...settings, customBottles: updatedList });
        revalidatePath('/');

        return { success: true };
    } catch (e) {
        console.error("Update failed:", e);
        return { success: false, error: String(e) };
    }
}

export async function deleteCustomBottle(id: string) {
    try {
        const settings = await getSettings();
        if (!settings.customBottles) return { success: false };

        const bottle = settings.customBottles.find(b => b.id === id);
        if (bottle) {
            // Delete File
            const filePath = path.join(process.cwd(), 'public', bottle.bottlePath);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            // Update Settings
            const updated = settings.customBottles.filter(b => b.id !== id);
            await saveSettings({ ...settings, customBottles: updated });

            revalidatePath('/');
            return { success: true };
        }
        return { success: false, error: "Bottle not found" };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// 1. Settings Management
export async function getSettings(): Promise<AppSettings> {
    if (fs.existsSync(SETTINGS_FILE)) {
        try {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            const parsed = JSON.parse(data);
            // Merge with defaults to ensure all fields exist
            return {
                outputFolder: '',
                autoSave: false,
                fileNameBuilder: [],
                customBottles: [],
                generalProducts: [],
                photoShootAssets: [],
                brandPresets: [],
                hiddenPresetIds: [],
                clients: [],
                jsonTemplates: [],
                ...parsed,
            };
        } catch (e) {
            console.error("Failed to parse settings:", e);
        }
    }
    // Default settings — fully-formed to prevent optional-chain cascades
    return {
        outputFolder: '',
        autoSave: false,
        fileNameBuilder: [],
        customBottles: [],
        generalProducts: [],
        photoShootAssets: [],
        brandPresets: [],
        hiddenPresetIds: [],
        clients: [],
        jsonTemplates: [],
    };
}

export async function saveSettings(settings: AppSettings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// JSON Template Management
export async function saveJsonTemplate(name: string, json: string) {
    try {
        const settings = await getSettings();
        const templates = settings.jsonTemplates || [];
        const newTemplate: JsonTemplate = {
            id: `template-${Date.now()}`,
            name,
            json,
            createdAt: Date.now()
        };
        templates.push(newTemplate);
        await saveSettings({ ...settings, jsonTemplates: templates });
        return { success: true, template: newTemplate };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

export async function deleteJsonTemplate(id: string) {
    try {
        const settings = await getSettings();
        const templates = (settings.jsonTemplates || []).filter(t => t.id !== id);
        await saveSettings({ ...settings, jsonTemplates: templates });
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

// 2. Auto-Save Logic
export async function saveToCustomFolder(recipeName: string = 'Cocktail') {
    try {
        const settings = await getSettings();
        if (!settings.autoSave || !settings.outputFolder) {
            return { success: false, error: "Auto-save not configured." };
        }

        if (!fs.existsSync(settings.outputFolder)) {
            return { success: false, error: `Output folder does not exist: ${settings.outputFolder}` };
        }

        const sourcePath = path.join(process.cwd(), 'public', 'generated-result.png');
        if (!fs.existsSync(sourcePath)) {
            return { success: false, error: "No generated image to save." };
        }

        // Sanitize components (remove path separators) is handled by buildFileName partially but we pass recipeName raw as ProductName

        let baseName = buildFileName(settings, recipeName);
        let fileName = `${baseName}.png`;

        // Handle Increment if present in the constructed name
        if (baseName.includes('{INC}')) {
            let counter = 1;
            while (true) {
                const currentName = baseName.replace('{INC}', String(counter).padStart(3, '0'));
                if (!fs.existsSync(path.join(settings.outputFolder, `${currentName}.png`))) {
                    fileName = `${currentName}.png`;
                    break;
                }
                counter++;
                // Safety break
                if (counter > 9999) {
                    fileName = `${baseName.replace('{INC}', String(counter).padStart(3, '0'))}.png`;
                    break;
                }
            }
        } else {
            fileName = `${baseName}.png`;
        }

        const destPath = path.join(settings.outputFolder, fileName);

        // If no increment and file exists, we might overwrite. 
        // Or we could auto-append numeric suffix if collision?
        // User asked for specific naming. If they select specific name without increment, they likely want/expect overwrite or handle it.
        // But to be safe, if NO increment token but file exists, maybe we shouldn't overwrite blindly?
        // Current legacy behavior overwrites. I'll stick to overwrite if no increment token used, or maybe the user EXPECTS overwrite if they didn't ask for increment.

        fs.copyFileSync(sourcePath, destPath);
        return { success: true, path: destPath };
    } catch (e) {
        console.error("Auto-save failed:", e);
        return { success: false, error: String(e) };
    }
}

// 3. History Management
export async function getHistoryItems() {
    try {
        const items = await prisma.cocktail.findMany({
            orderBy: { timestamp: 'desc' }
        });
        return items;
    } catch (e) {
        console.error("Failed to fetch history:", e);
        return [];
    }
}

export async function bulkDeleteHistory(ids: string[]) {
    try {
        await prisma.cocktail.deleteMany({
            where: {
                id: { in: ids }
            }
        });
        revalidatePath('/history');
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

/* -------------------------------------------------------------------------
   GENERAL PRODUCT MANAGEMENT (Studio Mode)
   ------------------------------------------------------------------------- */

export async function uploadGeneralProduct(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const clientId = formData.get('clientId') as string; // Multi-tenancy
    const file = formData.get('file') as File;

    if (!name || !file) return { success: false, error: "Missing fields" };

    try {
        const settings = await getSettings();
        const products = settings.generalProducts || [];

        // 1. Save Image
        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename
        const safeName = sanitizeFilename(name);
        const fileName = `prod-${safeName}-${Date.now()}.png`;
        const publicDir = getPublicDir('products');

        // Directory created by helper

        const filePath = path.join(publicDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // 2. Add to Settings
        const newProduct: GeneralProduct = {
            id: `prod-${Date.now()}`,
            name,
            description,
            imagePath: `/products/${fileName}`,
            clientId: clientId || undefined
        };

        products.push(newProduct);
        await saveSettings({ ...settings, generalProducts: products });

        revalidatePath('/');
        return { success: true };

    } catch (e: unknown) {
        console.error("Upload Product Error:", e);
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function deleteGeneralProduct(id: string) {
    try {
        const settings = await getSettings();
        const products = settings.generalProducts || [];
        const toDelete = products.find(p => p.id === id);

        if (toDelete) {
            deletePublicFile(toDelete.imagePath);
        }

        const updated = products.filter(p => p.id !== id);
        await saveSettings({ ...settings, generalProducts: updated });

        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function updateGeneralProduct(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File | null;

    if (!id || !name) return { success: false, error: "Missing fields" };

    try {
        const settings = await getSettings();
        const products = settings.generalProducts || [];
        const index = products.findIndex(p => p.id === id);

        if (index === -1) return { success: false, error: "Product not found" };

        let imagePath = products[index].imagePath;

        // If new file provided, replace old one
        if (file) {
            // Delete old
            let oldPath = path.join(process.cwd(), 'public', imagePath);
            if (process.env.APP_USER_DATA_PATH) {
                oldPath = path.join(process.env.APP_USER_DATA_PATH, 'public', imagePath);
            }
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

            // Save new
            const buffer = Buffer.from(await file.arrayBuffer());
            const safeName = sanitizeFilename(name);
            const fileName = `prod-${safeName}-${Date.now()}.png`;
            const publicDir = getPublicDir('products');
            // Helper creates dir if missing

            const newFilePath = path.join(publicDir, fileName);
            fs.writeFileSync(newFilePath, buffer);
            imagePath = `/products/${fileName}`;
        }

        products[index] = {
            ...products[index],
            name,
            description,
            imagePath
        };

        await saveSettings({ ...settings, generalProducts: products });
        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        console.error("Update Product Error:", e);
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

/* -------------------------------------------------------------------------
   VARIANT MANAGEMENT
   ------------------------------------------------------------------------- */

export async function uploadProductVariant(formData: FormData) {
    const parentId = formData.get('parentId') as string;
    const name = formData.get('name') as string; // Variant Name (e.g. Back)
    const file = formData.get('file') as File;

    if (!parentId || !name || !file) return { success: false, error: "Missing fields" };

    try {
        const settings = await getSettings();
        const products = settings.generalProducts || [];
        const productIndex = products.findIndex(p => p.id === parentId);

        if (productIndex === -1) return { success: false, error: "Parent product not found" };

        // Save Image
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = sanitizeFilename(name);
        const fileName = `variant-${parentId}-${safeName}-${Date.now()}.png`;
        const publicDir = getPublicDir('products/variants');

        // Directory creation handled by helper

        const filePath = path.join(publicDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // Update Product
        const product = products[productIndex];
        const variants = product.variants || [];

        variants.push({
            id: `var-${Date.now()}`,
            name,
            imagePath: `/products/variants/${fileName}`
        });

        products[productIndex] = { ...product, variants };

        await saveSettings({ ...settings, generalProducts: products });
        revalidatePath('/');
        return { success: true };

    } catch (e: unknown) {
        console.error("Upload Variant Error:", e);
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function deleteProductVariant(parentId: string, variantId: string) {
    try {
        const settings = await getSettings();
        const products = settings.generalProducts || [];
        const productIndex = products.findIndex(p => p.id === parentId);

        if (productIndex === -1) return { success: false, error: "Parent product not found" };

        const product = products[productIndex];
        const variantToDelete = product.variants?.find(v => v.id === variantId);

        if (variantToDelete) {
            deletePublicFile(variantToDelete.imagePath);
        }

        const updatedVariants = product.variants?.filter(v => v.id !== variantId) || [];
        products[productIndex] = { ...product, variants: updatedVariants };

        await saveSettings({ ...settings, generalProducts: products });
        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function uploadBottleVariant(formData: FormData) {
    const parentId = formData.get('parentId') as string;
    const name = formData.get('name') as string;
    const file = formData.get('file') as File;

    if (!parentId || !name || !file) return { success: false, error: "Missing fields" };

    try {
        const settings = await getSettings();
        const bottles = settings.customBottles || [];
        const bottleIndex = bottles.findIndex(b => b.id === parentId);

        if (bottleIndex === -1) return { success: false, error: "Custom bottle not found" };

        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = sanitizeFilename(name);
        const fileName = `variant-bottle-${parentId}-${safeName}-${Date.now()}.png`;
        const publicDir = getPublicDir('bottles/variants');

        // Directory creation handled by helper

        const filePath = path.join(publicDir, fileName);
        fs.writeFileSync(filePath, buffer);

        const bottle = bottles[bottleIndex];
        const variants = bottle.variants || [];

        variants.push({
            id: `var-${Date.now()}`,
            name,
            imagePath: `/bottles/variants/${fileName}`
        });

        bottles[bottleIndex] = { ...bottle, variants };

        await saveSettings({ ...settings, customBottles: bottles });
        revalidatePath('/');
        return { success: true };

    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function deleteBottleVariant(parentId: string, variantId: string) {
    try {
        const settings = await getSettings();
        const bottles = settings.customBottles || [];
        const bottleIndex = bottles.findIndex(b => b.id === parentId);

        if (bottleIndex === -1) return { success: false, error: "Custom bottle not found" };

        const bottle = bottles[bottleIndex];
        const variantToDelete = bottle.variants?.find(v => v.id === variantId);

        if (variantToDelete) {
            deletePublicFile(variantToDelete.imagePath);
        }

        const updatedVariants = bottle.variants?.filter(v => v.id !== variantId) || [];
        bottles[bottleIndex] = { ...bottle, variants: updatedVariants };

        await saveSettings({ ...settings, customBottles: bottles });
        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

/* -------------------------------------------------------------------------
   PHOTO SHOOT ASSETS MANAGEMENT
   ------------------------------------------------------------------------- */



export async function uploadPhotoShootAsset(formData: FormData) {
    const name = formData.get('name') as string;
    const clientId = formData.get('clientId') as string; // Multi-tenancy
    const file = formData.get('file') as File;

    if (!name || !file) return { success: false, error: "Missing fields" };

    try {
        const settings = await getSettings();
        const assets = settings.photoShootAssets || [];

        // 1. Save Image
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = sanitizeFilename(name);
        const fileName = `asset-${safeName}-${Date.now()}.png`;
        const publicDir = getPublicDir('photoshoot-assets');
        const filePath = path.join(publicDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // 2. Add to Settings
        const newAsset: PhotoShootAsset = {
            id: `asset-${Date.now()}`,
            name,
            imagePath: `/photoshoot-assets/${fileName}`,
            clientId: clientId || undefined
        };

        assets.push(newAsset);
        await saveSettings({ ...settings, photoShootAssets: assets });

        revalidatePath('/');
        return { success: true };

    } catch (e: unknown) {
        console.error("Upload Asset Error:", e);
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function deletePhotoShootAsset(id: string) {
    try {
        const settings = await getSettings();
        const assets = settings.photoShootAssets || [];
        const toDelete = assets.find(a => a.id === id);

        if (toDelete) {
            deletePublicFile(toDelete.imagePath);
        }

        const updated = assets.filter(a => a.id !== id);
        await saveSettings({ ...settings, photoShootAssets: updated });

        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

/* -------------------------------------------------------------------------
   BRAND PRESETS MANAGEMENT
   ------------------------------------------------------------------------- */

export async function saveBrandPreset(preset: Omit<BrandPreset, 'id'>) {
    try {
        const settings = await getSettings();
        const presets = settings.brandPresets || [];

        const newPreset: BrandPreset = {
            ...preset,
            id: `preset-${Date.now()}`
        };

        presets.push(newPreset);
        await saveSettings({ ...settings, brandPresets: presets });
        revalidatePath('/');
        return { success: true, preset: newPreset };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function deleteBrandPreset(id: string) {
    try {
        const settings = await getSettings();
        const presets = settings.brandPresets || [];
        const isCustom = presets.some(p => p.id === id);

        if (isCustom) {
            // Permanently remove custom preset
            const updated = presets.filter(p => p.id !== id);
            await saveSettings({ ...settings, brandPresets: updated });
        } else {
            // Verify it's a default ID (optional, but safe)
            // Or just add to hidden list blindly
            const hidden = settings.hiddenPresetIds || [];
            if (!hidden.includes(id)) {
                hidden.push(id);
                await saveSettings({ ...settings, hiddenPresetIds: hidden });
            }
        }

        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function saveFullTemplate(template: Omit<BrandPreset, 'id'> & { isFullTemplate: true }) {
    try {
        const settings = await getSettings();
        const presets = settings.brandPresets || [];

        const newTemplate: BrandPreset = {
            ...template,
            id: `template-${Date.now()}`
        };

        presets.push(newTemplate);
        await saveSettings({ ...settings, brandPresets: presets });
        revalidatePath('/');
        return { success: true, template: newTemplate };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function getFullTemplates(): Promise<BrandPreset[]> {
    const settings = await getSettings();
    return (settings.brandPresets || []).filter(p => p.isFullTemplate === true);
}

/* -------------------------------------------------------------------------
   APP RESET & CLIENT MANAGEMENT
   ------------------------------------------------------------------------- */

export async function resetAppData() {
    try {
        const settings = await getSettings();

        const getFullPath = (relPath: string) => {
            const cleanRel = relPath.startsWith('/') ? relPath.slice(1) : relPath;
            if (process.env.APP_USER_DATA_PATH) {
                return path.join(process.env.APP_USER_DATA_PATH, 'public', cleanRel);
            }
            return path.join(process.cwd(), 'public', cleanRel);
        };

        // 1. Delete Files
        if (settings.customBottles) {
            settings.customBottles.forEach(b => {
                if (b.isCustom && b.bottlePath) {
                    const p = getFullPath(b.bottlePath);
                    if (fs.existsSync(p)) fs.unlinkSync(p);
                    if (b.variants) {
                        b.variants.forEach(v => {
                            const vp = getFullPath(v.imagePath);
                            if (fs.existsSync(vp)) fs.unlinkSync(vp);
                        });
                    }
                }
            });
        }
        if (settings.generalProducts) {
            settings.generalProducts.forEach(p => {
                const fp = getFullPath(p.imagePath);
                if (fs.existsSync(fp)) fs.unlinkSync(fp);
                if (p.variants) {
                    p.variants.forEach(v => {
                        const vp = getFullPath(v.imagePath);
                        if (fs.existsSync(vp)) fs.unlinkSync(vp);
                    });
                }
            });
        }
        if (settings.photoShootAssets) {
            settings.photoShootAssets.forEach(a => {
                const fp = getFullPath(a.imagePath);
                if (fs.existsSync(fp)) fs.unlinkSync(fp);
            });
        }

        // 2. Reset Settings JSON
        // We KEEP clients? User said "remove all...". Usually clean slate.
        // But let's assume if he sets up clients, he might want to keep the clients list but clear their assets?
        // "Remove all... (only custom brand collection... etc)".
        // I will clear items but Keep Clients for now unless explicitly asked to delete clients.
        // Wait, "Add an app reset... that would remove all...".
        // Usually full reset removes clients too.
        // I'll be safe and remove EVERYTHING.

        await saveSettings({
            ...settings,
            customBottles: [],
            generalProducts: [],
            photoShootAssets: [],
            brandPresets: [],
            hiddenPresetIds: [],
            clients: [] // Wipe clients too
        });

        // 3. Delete History DB
        await prisma.cocktail.deleteMany({});

        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function addClient(name: string) {
    if (!name.trim()) return { success: false, error: "Name required" };
    try {
        const settings = await getSettings();
        const clients = settings.clients || [];
        const newClient: Client = {
            id: `client-${Date.now()}`,
            name: name.trim()
        };
        await saveSettings({ ...settings, clients: [...clients, newClient] });
        revalidatePath('/');
        return { success: true, client: newClient };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

export async function deleteClient(id: string) {
    try {
        const settings = await getSettings();
        const updated = (settings.clients || []).filter(c => c.id !== id);
        await saveSettings({ ...settings, clients: updated });
        revalidatePath('/');
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
}

