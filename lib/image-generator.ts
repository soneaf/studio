import {
    SubjectReferenceImage,
    SubjectReferenceType,
    RawReferenceImage,
    type Part,
} from '@google/genai';
import {
    getGeminiClient,
    getVertexClient,
    isSubjectReferenceAvailable,
    GEMINI_IMAGE_MODEL,
    IMAGEN_EDIT_MODEL,
} from './genai-client';

// Types
export type ProductImage = {
    base64Data: string;
    mimeType: string;
    name: string;
    description: string;
};

export type GenerationRequest = {
    prompt: string;
    productImages: ProductImage[];
    sceneReferenceBase64?: string;
    aspectRatio?: string;
};

export type GenerationResult = {
    success: boolean;
    imageBase64?: string;
    error?: string;
    method?: 'editImage' | 'generateContent';
};

// Max reference images for editImage API
const MAX_SUBJECT_REFERENCES = 4;

/**
 * Strategy A: editImage with SubjectReferenceImage (Vertex AI)
 * Uses SUBJECT_TYPE_PRODUCT for maximum product fidelity.
 */
async function generateWithEditImage(req: GenerationRequest): Promise<GenerationResult> {
    const client = getVertexClient();
    if (!client) throw new Error('Vertex AI not configured');

    // Build reference images (max 4 total)
    const referenceImages: (SubjectReferenceImage | RawReferenceImage)[] = [];

    // Product images as SubjectReferenceImage
    const productLimit = Math.min(req.productImages.length, MAX_SUBJECT_REFERENCES);
    for (let i = 0; i < productLimit; i++) {
        const img = req.productImages[i];
        const ref = new SubjectReferenceImage();
        ref.referenceId = i + 1;
        ref.referenceImage = {
            imageBytes: img.base64Data,
            mimeType: img.mimeType,
        };
        ref.config = {
            subjectType: SubjectReferenceType.SUBJECT_TYPE_PRODUCT,
            subjectDescription: img.description,
        };
        referenceImages.push(ref);
        console.log(`📌 SubjectReference [${i + 1}]: "${img.name}" (${img.description})`);
    }

    // Scene reference as RawReferenceImage (if room)
    if (req.sceneReferenceBase64 && referenceImages.length < MAX_SUBJECT_REFERENCES) {
        const sceneRefId = referenceImages.length + 1;
        const sceneRef = new RawReferenceImage();
        sceneRef.referenceId = sceneRefId;
        sceneRef.referenceImage = {
            imageBytes: req.sceneReferenceBase64,
            mimeType: 'image/png',
        };
        referenceImages.push(sceneRef);
        console.log(`📌 RawReference [${sceneRefId}]: Scene/background reference`);
    }

    console.log(`🎯 editImage: ${referenceImages.length} references, model: ${IMAGEN_EDIT_MODEL}`);

    // Build editImage prompt with bracket notation referencing each product
    // e.g. "Product [1] is 'Blanco', Product [2] is 'Reposado'. <scene prompt>"
    let editPrompt = req.prompt;
    if (req.productImages.length > 0) {
        const refLines = req.productImages
            .slice(0, productLimit)
            .map((img, i) => `Product [${i + 1}] is "${img.name}"`)
            .join('. ');
        editPrompt = `${refLines}. Place these EXACT products into the scene: ${req.prompt}`;
    }

    const response = await client.models.editImage({
        model: IMAGEN_EDIT_MODEL,
        prompt: editPrompt,
        referenceImages,
        config: {
            numberOfImages: 1,
        },
    });

    // Extract image data from response
    const generated = response.generatedImages?.[0];
    const imageBytes = generated?.image?.imageBytes;
    if (!imageBytes) {
        throw new Error('No image data in editImage response');
    }

    return {
        success: true,
        imageBase64: imageBytes,
        method: 'editImage',
    };
}

/**
 * Strategy B: generateContent with inline images (Gemini API)
 * Fallback when Vertex AI is not available or editImage fails.
 */
async function generateWithGeminiContent(req: GenerationRequest): Promise<GenerationResult> {
    const client = getGeminiClient();
    if (!client) throw new Error('Gemini API key not configured');

    const parts: Part[] = [];

    // Product images first with fidelity instructions
    for (const img of req.productImages) {
        parts.push({
            inlineData: { mimeType: img.mimeType, data: img.base64Data }
        });
        parts.push({
            text: `The image above is "${img.name}" — an ACTUAL PHOTOGRAPH of the real product. This EXACT product must appear with IDENTICAL shape, proportions, label layout, colors, and every visual detail. Do NOT redesign or stylize this product. The bottle has a distinctive RECTANGULAR/FLAT-FRONT glass shape (NOT cylindrical). Copy it PIXEL-FOR-PIXEL.`
        });
    }

    // Scene reference
    if (req.sceneReferenceBase64) {
        parts.push({
            text: '[SCENE/BACKGROUND REFERENCE] — This shows the environment/mood. This is NOT a product.'
        });
        parts.push({
            inlineData: { mimeType: 'image/png', data: req.sceneReferenceBase64 }
        });
    }

    // Text prompt last
    const hasProducts = req.productImages.length > 0;
    const bridge = hasProducts
        ? `Now generate the following scene. The bottle(s) MUST look IDENTICAL to the product photo(s) above — same rectangular/flat-front shape, same label layout, same key position, same proportions. Place the EXACT bottle from the reference into this scene:\n\n`
        : `Generate a photorealistic image:\n\n`;
    parts.push({ text: bridge + req.prompt });

    console.log(`🎯 generateContent: ${parts.length} parts, model: ${GEMINI_IMAGE_MODEL}`);

    const response = await client.models.generateContent({
        model: GEMINI_IMAGE_MODEL,
        contents: [{ role: 'user', parts }],
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    // Extract image from response
    const candidate = response.candidates?.[0];
    const responseParts = candidate?.content?.parts || [];
    const imagePart = responseParts.find(
        (p) => p.inlineData?.mimeType?.startsWith('image')
    );

    if (!imagePart?.inlineData?.data) {
        // Check if there's text explaining why no image was generated
        const textPart = responseParts.find((p) => p.text);
        const msg = textPart?.text || 'No image data in generateContent response';
        throw new Error(msg);
    }

    return {
        success: true,
        imageBase64: imagePart.inlineData.data,
        method: 'generateContent',
    };
}

/**
 * Main entry point: generates an image using the best available strategy.
 * Prefers editImage with SubjectReferenceImage when products are present and Vertex AI is configured.
 * Falls back to generateContent with inline images otherwise.
 */
export async function generateImage(req: GenerationRequest): Promise<GenerationResult> {
    const hasProducts = req.productImages.length > 0;
    const canUseEditImage = isSubjectReferenceAvailable();

    // Strategy: If we have products AND Vertex AI is configured, prefer editImage
    if (hasProducts && canUseEditImage) {
        try {
            console.log('🔬 Using editImage with SubjectReferenceImage (Vertex AI)');
            return await generateWithEditImage(req);
        } catch (err) {
            const msg = (err as Error)?.message || String(err);
            console.warn('⚠️ editImage failed, falling back to generateContent:', msg);
            // Fall through to generateContent
        }
    }

    // Fallback or primary when no products / no Vertex AI
    if (!canUseEditImage && hasProducts) {
        console.log('ℹ️ Vertex AI not configured — using generateContent with inline images');
    }
    console.log('🎨 Using generateContent (Gemini API)');
    return await generateWithGeminiContent(req);
}
