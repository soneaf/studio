'use server';

import fs from 'fs';
import path from 'path';
import { generateImage, ProductImage, GenerationRequest } from '@/lib/image-generator';

// Helper: Find where a file exists (User Data > Bundled)
function resolvePublicPath(inputPath: string): string | null {
    const rel = inputPath.startsWith('/') ? inputPath.slice(1) : inputPath;

    // 1. Try User Data (Persistent)
    if (process.env.APP_USER_DATA_PATH) {
        const userPath = path.join(process.env.APP_USER_DATA_PATH, 'public', rel);
        if (fs.existsSync(userPath)) return userPath;
    }

    // 2. Try App Public (Bundled/Dev)
    const localPath = path.join(process.cwd(), 'public', rel);
    if (fs.existsSync(localPath)) return localPath;

    return null;
}

// Helper: Get path for writing new files
function getWritablePath(filename: string): string {
    const rel = filename.startsWith('/') ? filename.slice(1) : filename;

    if (process.env.APP_USER_DATA_PATH) {
        const publicDir = path.join(process.env.APP_USER_DATA_PATH, 'public');
        if (!fs.existsSync(publicDir)) {
            try {
                fs.mkdirSync(publicDir, { recursive: true });
            } catch (e) {
                console.error("Failed to create writable public dir:", e);
            }
        }
        return path.join(publicDir, rel);
    }

    return path.join(process.cwd(), 'public', rel);
}

// Helper: Read bottle/product image paths into ProductImage objects for the SDK
function readProductImages(bottlePaths: string[]): ProductImage[] {
    const images: ProductImage[] = [];

    for (let i = 0; i < bottlePaths.length; i++) {
        const bPath = bottlePaths[i];
        try {
            const fullPath = resolvePublicPath(bPath);
            if (fullPath) {
                const imageBuffer = fs.readFileSync(fullPath);
                const base64Data = imageBuffer.toString('base64');

                const fileName = bPath.split('/').pop()?.replace(/\.\w+$/, '') || `Product ${i + 1}`;
                const readableName = fileName.charAt(0).toUpperCase() + fileName.slice(1);

                images.push({
                    base64Data,
                    mimeType: 'image/png',
                    name: readableName,
                    description: `Product reference image: ${readableName}`,
                });

                console.log(`✅ Product image ${i + 1}: ${fullPath} (${Math.round(imageBuffer.length / 1024)}KB)`);
            } else {
                console.warn(`❌ Product image not found: ${bPath}`);
            }
        } catch (e) {
            console.error("Failed to read product image:", e);
        }
    }

    return images;
}

// Helper: Resolve scene/background reference to clean base64
function resolveSceneReference(referenceImageBase64: string): string | undefined {
    let cleanBase64 = "";

    if (referenceImageBase64.startsWith("data:")) {
        cleanBase64 = referenceImageBase64.replace(/^data:image\/\w+;base64,/, "");
    } else if (referenceImageBase64.startsWith("/")) {
        try {
            const imagePath = resolvePublicPath(referenceImageBase64);
            if (imagePath) {
                const buffer = fs.readFileSync(imagePath);
                cleanBase64 = buffer.toString('base64');
                console.log(`📸 Scene reference image: ${imagePath}`);
            } else {
                console.warn("Scene reference image not found:", referenceImageBase64);
            }
        } catch (err) {
            console.error("Error reading scene reference image:", err);
        }
    }

    return cleanBase64 || undefined;
}

export async function generateCocktailImage(prompt: string, bottlePaths?: string[], referenceImageBase64?: string, outputFilename: string = 'generated-result.png') {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return { success: false, error: "Please create a .env.local file with GOOGLE_API_KEY=..." };
    }

    // Ensure output filename has an extension
    if (!outputFilename.endsWith('.png')) {
        outputFilename += '.png';
    }

    try {
        console.log('🎨 Prompt being sent to AI:', prompt);

        // Build product images from bottle paths
        const productImages = (bottlePaths && bottlePaths.length > 0)
            ? readProductImages(bottlePaths)
            : [];

        if (productImages.length === 0 && bottlePaths && bottlePaths.length > 0) {
            console.warn('⚠️ Bottle paths provided but no images could be read');
        } else if (productImages.length === 0) {
            console.log('ℹ️ No product images — generating scene only');
        }

        // Resolve scene reference
        const sceneReferenceBase64 = referenceImageBase64
            ? resolveSceneReference(referenceImageBase64)
            : undefined;

        // Build generation request
        const request: GenerationRequest = {
            prompt,
            productImages,
            sceneReferenceBase64,
        };

        console.log(`📊 Request: ${productImages.length} product image(s), scene ref: ${sceneReferenceBase64 ? 'yes' : 'no'}`);

        // Generate via SDK (editImage with SubjectReference if available, else generateContent)
        const result = await generateImage(request);

        if (!result.success || !result.imageBase64) {
            return { success: false, error: result.error || "No image data in response." };
        }

        console.log(`✅ Image generated via ${result.method}`);

        // Save to writable public folder
        const buffer = Buffer.from(result.imageBase64, 'base64');
        const filePath = getWritablePath(outputFilename);

        console.log(`💾 Saving generated image to: ${filePath}`);
        fs.writeFileSync(filePath, buffer);

        // Return path relative to public
        const returnPath = outputFilename.startsWith('/') ? outputFilename : '/' + outputFilename;
        return { success: true, path: returnPath };

    } catch (error) {
        console.error("Generation failed:", error);
        const msg = (error as any).message || String(error);
        return { success: false, error: `Failed to connect to Image API: ${msg}` };
    }
}

export async function generateCocktailVariations(prompt: string, bottlePaths?: string[], referenceImageBase64?: string, count: number = 4) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return { success: false, error: "Please create a .env.local file with GOOGLE_API_KEY=..." };
    }

    try {
        // Build product images (shared across all variations)
        const productImages = (bottlePaths && bottlePaths.length > 0)
            ? readProductImages(bottlePaths)
            : [];

        // Resolve scene reference
        const sceneReferenceBase64 = referenceImageBase64
            ? resolveSceneReference(referenceImageBase64)
            : undefined;

        const request: GenerationRequest = {
            prompt,
            productImages,
            sceneReferenceBase64,
        };

        console.log(`🎨 Generating ${count} variations (${productImages.length} product images, scene ref: ${sceneReferenceBase64 ? 'yes' : 'no'})`);

        // Parallel generation requests
        const promises = Array.from({ length: count }).map(async (_, index) => {
            const result = await generateImage(request);

            if (!result.success || !result.imageBase64) {
                throw new Error(result.error || "No image data in response");
            }

            const buffer = Buffer.from(result.imageBase64, 'base64');
            const filename = `generated-result-${index + 1}.png`;
            const filePath = getWritablePath(filename);

            fs.writeFileSync(filePath, buffer);
            console.log(`✅ Variation ${index + 1} saved via ${result.method}`);
            return `/${filename}`;
        });

        const results = await Promise.all(promises);
        return { success: true, paths: results };

    } catch (error) {
        console.error("Variation Generation failed:", error);
        const msg = (error as any).message || String(error);
        return { success: false, error: `Failed to generate variations: ${msg}` };
    }
}

export async function promoteVariationToMain(variationPath: string) {
    try {
        // variationPath comes as "/generated-result-X.png"
        const sourcePath = resolvePublicPath(variationPath);
        const targetPath = getWritablePath('generated-result.png');

        if (sourcePath && fs.existsSync(sourcePath)) {
            // Copy contents
            fs.copyFileSync(sourcePath, targetPath);
            return { success: true };
        } else {
            return { success: false, error: "Source variation file not found." };
        }
    } catch (e) {
        console.error("Failed to promote variation:", e);
        return { success: false, error: "System error promoting file." };
    }
}
