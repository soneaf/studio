import { DrinkState, SceneAction, SelectedProp, HumanElement } from './builder-context';
import { BackgroundOption, CountertopOption, TequilaSku, ANGLES, LightingOption, PROP_PLACEMENTS, BOTTLE_X_POSITIONS, BOTTLE_DEPTH_POSITIONS, SURFACE_PLACEMENTS } from './data';

import { GeneralProduct, PhotoShootAsset } from '@/app/settings-actions';

// Helper: Build human element text variables from a HumanElement
function buildHumanVars(h: HumanElement) {
    const diversity = h.ethnicity === 'Diverse' ? '' : `${h.ethnicity} `;
    const accText = h.accessories && h.accessories.length > 0 ? `, wearing ${h.accessories.join(', ')}` : '';
    const nailText = h.nailColor ? ` with ${h.nailColor} nail polish` : ' with clean natural manicured nails';
    const detailText = h.customDetail ? ` DETAILS: ${h.customDetail}. ` : '';
    return { diversity, accText, nailText, detailText };
}

// Helper: Build human element prompt text for a subject
function buildHumanText(h: HumanElement, subjectName: string, subjectType: 'product' | 'drink' | 'bottle'): string {
    const { diversity, accText, nailText, detailText } = buildHumanVars(h);
    const label = subjectType === 'bottle' ? `Bottle: ${subjectName}` : subjectName;
    const holdTarget = subjectType === 'bottle' ? 'the bottle neck or body' : (subjectType === 'drink' ? 'the glass' : 'the item');

    if (h.type === 'hands') {
        return `\n** HUMAN ELEMENT (${label}) **: The ${subjectName} is held by a professional ${diversity}${h.gender} hand. Visible fingers holding ${holdTarget} naturally. ${accText}${nailText}. ${detailText}`;
    } else if (h.type === 'model') {
        return `\n** HUMAN ELEMENT (${label}) **: A ${diversity}${h.gender} model is VISIBLE with the ${subjectName}, lifestyle style. ${accText}. ${h.nailColor ? `Note: Model has ${h.nailColor} nails.` : ''} ${detailText}`;
    }
    return '';
}

// Helper: Build YaVe label details text
const YAVE_LABEL_DETAILS = `
CRITICAL - VISIBLE LABEL TEXT DETAILS:
    The following text MUST be legible and accurate on the bottle label:
1. Under the flavor name: "HECHO EN MEXICO", then "100% PURO AGAVE" below it.
    2. Left of key icon: "35% Alc/Vol."
3. Right of key icon: "750 ML"
4. Bottom of label: "Tequila with all natural flavor"
5. Neck / Cap wrap: "UNLOCK POSSIBILITY"
    Ensure strict adherence to these text details without altering the brand's graphic style.`;

function buildLabelDetails(sku: TequilaSku | undefined, bottleName: string): string {
    const isYaVe = sku ? !sku.isCustom : true;
    if (isYaVe) return YAVE_LABEL_DETAILS;
    return `\nCUSTOM BOTTLE DETAILS:\n${sku?.customDescription || `A premium bottle of ${bottleName}.`}`;
}

// Helper: Build the "CRITICAL PRODUCT IMAGE FIDELITY" instruction block
function buildFidelityInstructions(opts: { bottleCountText: string; scaleText: string; suffix?: string }): string {
    return `
    ====================================
    CRITICAL PRODUCT IMAGE FIDELITY INSTRUCTION:
    ====================================
    The provided bottle reference image(s) are the ABSOLUTE GROUND TRUTH. You MUST replicate them EXACTLY:

    1. BOTTLE SHAPE & STRUCTURE: The provided reference image is the ABSOLUTE VISUAL AUTHORITY. Match the exact bottle silhouette, curves, shoulders, and base. Do NOT invent a different bottle shape. Trust the image over any text.

    2. LABEL & BRANDING: The VERY LARGE, prominent, embossed metallic Gold Skeleton Key icon is vertically centered on the front glass panel. The key is THREE-DIMENSIONAL and RAISED FROM the glass surface. The "YaVe" logo in distressed rustic font is at the top neck area. All text must match the reference image precisely in size, position, and appearance.

    3. LIQUID COLOR - CRITICAL: The tequila liquid color inside the bottle MUST match the reference image EXACTLY. Do NOT make it green, tinted with unnatural colors, cloudy, or any color other than what is shown. Trust the reference image for the exact liquid color and transparency.

    4. MATERIALS & RENDERING: Clear glass bottle with wooden cork stopper. The bottle must be rendered as REALISTIC TRANSPARENT GLASS with proper refraction, caustics, and lighting interaction. Background should be visible through the bottle. Do NOT produce a "cut-out" or flat sticker look.

    5. BOTTLE COUNT: ${opts.bottleCountText}

    Do NOT hallucinate, stylize, or deviate from the reference image in ANY way.
    ${opts.scaleText}${opts.suffix || ''}`;
}

// Core Brand Anatomy from brand_config_yave.md
const BOTTLE_CORE = {
    SHAPE: 'Tall rectangular clear glass bottle with a flat front panel, slightly rounded shoulders, and a distinctive square profile. The bottle tapers slightly toward the base with a wooden cork stopper. MATCH THE REFERENCE IMAGE EXACTLY — trust the image over any text description.',
    FRONT_GRAPHIC: 'A VERY LARGE, prominent, embossed metallic Gold Skeleton Key icon vertically centered on the flat front glass panel. The key is THREE-DIMENSIONAL and RAISED FROM the glass surface. It is the dominant visual feature of the bottle — unmissable and bold.',
    INNER_PATTERN: 'The back label visible through the glass is a SOLID WHITE OPAQUE STICKER with a REPETITIVE PATTERN OF SMALL GRAY SKELETON KEYS arranged in a grid. This sticker is NOT transparent — it is a white paper label that fully blocks the background behind it. You can see this white sticker through the clear front glass of the bottle.',
    MAIN_LOGO: '"YaVe" text at the top neck area in a distressed rustic font. Below it is the flavor/variant name.'
};

const BRAND_NEGATIVE_PROMPT = '(green liquid:2.0), (colored liquid:2.0), (tinted liquid:2.0), (green tequila:2.0), (colored tequila:2.0), (wrong bottle shape:1.8), (different bottle:1.8), (wrong key design:1.8), (transparent back label:1.8), (see-through back label:1.8), (clear back sticker:1.8), (extra objects), (random objects), (floating keys:1.5), (fruit floating inside bottle:1.5), (misspelled text), (low quality text), (3d render artifacts), (distorted logo), (incorrect liquid color:2.0), (duplicate bottles:1.5), (extra bottles:1.5), (two bottles), (multiple bottles), (reflection of bottle), (miniature bottles), (cluttered scene), (blurry), (fantasy bottle), (stylized bottle), (cartoon bottle)';

type PromptState = {
    // Global properties
    angleLabel: string;
    background: BackgroundOption;
    countertop: CountertopOption;
    surfacePlacement?: string;
    showBottle: boolean;
    bottleOnlyMode?: boolean;
    customBackground?: string;
    customCountertop?: string;
    customLighting?: string;
    customAngle?: string;
    sceneActions?: SceneAction[];
    aspectRatio?: string;
    lighting?: LightingOption;
    camera?: { promptTemplate: string };
    cameraSettings?: { enabled: boolean; lens: string; aperture: string; iso: string; shutter: string };

    // Studio Mode
    mode?: 'tequila' | 'studio';
    activeProducts?: { product: GeneralProduct, variantIds: string[], humanElement?: HumanElement }[];

    // Photo Shoot Asset (Background)
    photoShootAsset?: PhotoShootAsset | null;

    // Multi-drink
    drinks: DrinkState[];
    standaloneBottleSku?: TequilaSku;
    activeBottles?: BottleWithPlacement[];
    referenceImage?: string | null;

    // Visual Props
    props?: SelectedProp[];

    // Human Element
    humanElement?: HumanElement;
};

// Extended bottle type with optional placement properties
type BottleWithPlacement = TequilaSku & {
    humanElement?: HumanElement;
    placementX?: string;
    placementDepth?: string;
};

// Shared computed scene context passed to each mode-specific generator
type SceneContext = {
    bgDesc: string;
    surfDesc: string;
    bgCustomText: string;
    surfCustomText: string;
    ratioText: string;
    lightingDesc: string;
    actionText: string;
    strictLightingConstraint: string;
    angleDesc: string;
    cameraPrompt: string;
    propsText: string;
    humanText: string;
    hasReference: boolean;
};

// Helper to Process Angle Template
function processAnglePrompt(
    angleLabel: string,
    drinks: DrinkState[],
    standaloneBottleSkuName: string,
    showBottle: boolean,
    bottleOnlyMode: boolean
): string {
    const angleOption = ANGLES.find(a => a.label === angleLabel);
    const template = angleOption?.promptTemplate || `Shot from ${angleLabel}.`;

    // 1. Determine Subject Names
    // Bottle Name
    let bottleName = 'Blanco';
    if (drinks.length > 0) {
        bottleName = drinks[0].selectedSku.name;
    } else if (standaloneBottleSkuName) {
        bottleName = standaloneBottleSkuName;
    }

    // Drink Name
    const drinkName = drinks[0]?.customRecipe ? 'Cocktail' : 'Margarita';

    let processedIdx = template
        .replace(/{bottle}/g, bottleName)
        .replace(/{drink}/g, drinkName);

    return processedIdx;
}

/**
 * Build the shared scene context from PromptState.
 * Computes values used across all mode-specific prompt generators.
 */
function buildSceneContext(state: PromptState): SceneContext {
    const {
        background,
        countertop,
        customBackground,
        customCountertop,
        customLighting,
        customAngle,
        aspectRatio,
        lighting,
        camera,
        sceneActions,
        props = [],
        referenceImage,
        photoShootAsset,
        mode,
        activeProducts,
        drinks,
        activeBottles,
        humanElement,
        showBottle,
        bottleOnlyMode,
    } = state;

    const hasReference = !!referenceImage || !!photoShootAsset;

    // Resolve Custom Texts
    const bgCustomText = customBackground || (background?.id === 'custom' ? background.prompt : '') || '';
    const surfCustomText = customCountertop || (countertop?.id === 'custom' ? countertop.prompt : '') || '';

    const bgDesc = hasReference ? "Matching the reference image background" : (bgCustomText || background?.name || 'Studio Background');
    const surfDesc = hasReference ? "Matching the reference image surface" : (surfCustomText || countertop?.name || 'Solid Surface');
    const ratioText = aspectRatio || '4:5';
    const lightingDesc = customLighting || (lighting?.promptTemplate || 'Professional warm studio lighting.');

    // Action Text
    const actionText = (sceneActions && sceneActions.length > 0)
        ? '\nAction/Motion:\n' + sceneActions.map(a => `- Action on ${a.subjectName}: ${a.description} `).join('\n')
        : '';

    const isMatchLighting = lighting?.id === 'match-asset';
    const strictLightingConstraint = isMatchLighting
        ? "CRITICAL LIGHTING INSTRUCTION: DO NOT ADD any external studio lights, rim lights, colored gels, or artificial brightening. The lighting must be 100% derived from the background image's natural light sources to ensure perfect integration."
        : "";

    // Angle
    const angleDesc = customAngle || processAnglePrompt(state.angleLabel || 'Front View', drinks, state.standaloneBottleSku?.name || '', showBottle, !!bottleOnlyMode);

    // Camera
    const cameraSettings = state.cameraSettings;
    const settingsText = (cameraSettings && cameraSettings.enabled)
        ? `, Shot with ${cameraSettings.lens} lens at ${cameraSettings.aperture}, ${cameraSettings.iso}, Shutter ${cameraSettings.shutter}`
        : '';
    const cameraPrompt = (camera?.promptTemplate || 'Shot on Canon EOS R5 with 85mm f/1.2L lens. Ultra-sharp focus, shallow depth of field, professional commercial studio photography, high resolution texture.') + settingsText;

    // Props
    const propsText = (props && props.length > 0)
        ? '\n*** SCENE OBJECTS & PROPS ***:\n' + props.map((p, i) => {
            let placeText = p.placementValue;
            if (!placeText) {
                const matched = PROP_PLACEMENTS.find(pl => pl.id === p.placement);
                placeText = matched ? matched.value : 'near';
            }
            const item = p.value || p.name;
            const colorDesc = p.color ? `${p.color} ` : '';
            const detailsDesc = p.details ? ` Details: ${p.details}.` : '';
            const qtyDesc = (p.quantity && p.quantity > 1) ? `${p.quantity}x ` : '';
            return `- Item ${i + 1}: ${qtyDesc}${colorDesc}${item}. Placement: ${placeText}.${detailsDesc}`;
        }).join('\n')
        : '';

    // Human Element
    const humanText = buildHumanTextForState(mode, activeProducts, drinks, activeBottles, humanElement);

    return {
        bgDesc, surfDesc, bgCustomText, surfCustomText,
        ratioText, lightingDesc, actionText, strictLightingConstraint,
        angleDesc, cameraPrompt, propsText, humanText, hasReference,
    };
}

/**
 * Compute the combined human element text from per-product, per-drink,
 * per-bottle specifics, or the global fallback.
 */
function buildHumanTextForState(
    mode: string | undefined,
    activeProducts: PromptState['activeProducts'],
    drinks: DrinkState[],
    activeBottles: BottleWithPlacement[] | undefined,
    humanElement: HumanElement | undefined,
): string {
    const specificHumanTexts: string[] = [];

    // Per-Product Specifics (Studio Mode)
    if (mode === 'studio' && activeProducts && activeProducts.length > 0) {
        activeProducts.forEach(p => {
            if (p.humanElement && p.humanElement.type !== 'none') {
                const text = buildHumanText(p.humanElement, p.product.name, 'product');
                if (text) specificHumanTexts.push(text);
            }
        });
    }

    // Per-Item Specifics (Tequila Mode)
    if (mode === 'tequila') {
        drinks.forEach((d, i) => {
            if (d.humanElement && d.humanElement.type !== 'none') {
                const drinkName = d.customRecipe || `Cocktail ${i + 1}`;
                const text = buildHumanText(d.humanElement, drinkName, 'drink');
                if (text) specificHumanTexts.push(text);
            }
        });

        if (activeBottles && activeBottles.length > 0) {
            activeBottles.forEach(b => {
                if (b.humanElement && b.humanElement.type !== 'none') {
                    const text = buildHumanText(b.humanElement, b.name, 'bottle');
                    if (text) specificHumanTexts.push(text);
                }
            });
        }
    }

    if (specificHumanTexts.length > 0) {
        return specificHumanTexts.join('\n');
    }

    // Global fallback
    if (humanElement && humanElement.type !== 'none') {
        const { diversity, accText, nailText, detailText } = buildHumanVars(humanElement);
        const { type, gender, nailColor } = humanElement;

        if (type === 'hands') {
            return `\n** HUMAN ELEMENT - CRITICAL **: The image MUST contain visible human hands interacting with the product. A professional ${diversity}${gender} hand is clearly visible holding or touching the bottle/glass. ${accText}${nailText}. ${detailText} Skin texture is highly realistic. The hand is manicured. The grip is secure but elegant.`;
        } else if (type === 'model') {
            return `\n** HUMAN ELEMENT - CRITICAL **: A ${diversity}${gender} model is VISIBLE in the scene, standing near the product, lifestyle style${accText}. ${nailColor ? `Note: Model has ${nailColor} nails.` : ''} ${detailText} The model is stylish, wearing premium attire. Soft focus on the model to keep the product as the hero, but the model MUST BE VISIBLE to add context.`;
        }
    }

    return '';
}

// ───────────────────────────────────────────
// Studio Mode Prompt
// ───────────────────────────────────────────

function generateStudioPrompt(state: PromptState, ctx: SceneContext): string {
    const products = state.activeProducts || [];
    if (products.length === 0) return "Please select a product.";

    // Flatten Selection into Scene Items (Product + Variant combination)
    const sceneItems: { name: string, description: string, variantName: string }[] = [];

    products.forEach(p => {
        const variantIds = p.variantIds || [];
        variantIds.forEach((vid: string) => {
            let variantName = "Main View";
            if (vid !== 'main' && p.product.variants) {
                const v = p.product.variants.find(x => x.id === vid);
                if (v) variantName = v.name;
            }
            sceneItems.push({
                name: p.product.name,
                description: p.product.description,
                variantName: variantName
            });
        });
    });

    if (sceneItems.length === 0) return "Please select at least one view/variant for the selected product.";

    const productNames = [...new Set(sceneItems.map(i => i.name))].join(' and ');

    let subjectDetails = '';
    if (sceneItems.length === 1) {
        const item = sceneItems[0];
        subjectDetails = `A high - quality product shot of ${item.name}. ${item.description}. The product is the hero of the shot.`;
    } else {
        subjectDetails = `A group shot containing ${sceneItems.length} distinct items: ` +
            sceneItems.map((item, i) => `${i + 1}. ${item.name} (${item.variantName})`).join('  ');
        subjectDetails += `\nEach item listed above must be present in the scene as a separate physical object.
\nProduct Description: ${sceneItems[0]?.description || ''}
\nThe items are arranged harmoniously together. Ensure all ${sceneItems.length} objects are visible and distinct.`;
    }

    const studioItemCount = sceneItems.length;
    const studioCountConstraint = studioItemCount === 1
        ? 'EXACTLY ONE product. DO NOT add extra products or duplicate the item.'
        : `EXACTLY ${studioItemCount} products. Each must be a distinct, separate object. DO NOT add extras.`;

    return `Professional commercial studio photography of ${productNames}. 8k resolution, photorealistic.

    SUBJECT:
        ${subjectDetails}
        ${ctx.propsText}
        ${ctx.actionText}
        ${ctx.humanText}

    ${buildFidelityInstructions({
        bottleCountText: studioCountConstraint,
        scaleText: `The products are the hero subjects of this shot.`
    })}
        PRESERVE all labels, logos, text, fonts, and packaging details from the reference.
        DO NOT change the spelling or layout of any text on the products.

    COMPOSITION:
        ${ctx.angleDesc}. Aspect Ratio ${ctx.ratioText}.
        ${state.photoShootAsset ? "Place the product(s) seamlessly into the provided background reference image. Match the perspective, shadows, and lighting of the background scene." : "The products are centered and perfectly lit."}

    Environment:
        ${state.photoShootAsset ? `Background Reference: Use the provided '${state.photoShootAsset.name}' image as the EXACT environment/background. Do not alter the background scene structure. Integrate the product realistically.\nLighting Style: ${ctx.lightingDesc} ${ctx.strictLightingConstraint}${ctx.bgCustomText ? `\nAdditional Background Details: ${ctx.bgCustomText}` : ''}` : (ctx.hasReference && !ctx.bgCustomText ? `Environment matches reference image exactly. ${ctx.lightingDesc} ${ctx.strictLightingConstraint}` : `The products are sitting on a ${ctx.surfDesc} surface. Background is ${ctx.bgDesc}. ${ctx.lightingDesc}`)}

    STYLE:
        ${ctx.cameraPrompt}
        Aesthetic is clean, premium, high-end commercial advertising style.

    NEGATIVE PROMPT / AVOID: (wrong product shape:1.8), (different product:1.8), (misspelled text), (low quality text), (distorted logo), (blurry), (stylized product), (cartoon product)
        `;
}

// ───────────────────────────────────────────
// Bottle-Only Mode Prompt (Tequila)
// ───────────────────────────────────────────

function generateBottleOnlyPrompt(state: PromptState, ctx: SceneContext): string {
    const { drinks, standaloneBottleSku, activeBottles, photoShootAsset, customBackground } = state;

    const standaloneSkuName = standaloneBottleSku ? standaloneBottleSku.name : 'Blanco';
    const anglePrompt = processAnglePrompt(
        state.angleLabel, drinks, standaloneSkuName, state.showBottle, !!state.bottleOnlyMode
    );

    // Resolve bottles array with placement type
    const bottles: BottleWithPlacement[] = (activeBottles && activeBottles.length > 0)
        ? activeBottles
        : (drinks.length > 0 ? [drinks[0].selectedSku] : (standaloneBottleSku ? [standaloneBottleSku] : []));

    // Surface placement (front edge / center / back edge)
    const bottleSurfacePlacement = state.surfacePlacement ? SURFACE_PLACEMENTS.find(p => p.id === state.surfacePlacement) : null;
    const bottleSurfacePosStr = bottleSurfacePlacement ? `, ${bottleSurfacePlacement.prompt}` : "";

    // Environment reference - with photoShootAsset support
    let envRef: string;
    if (photoShootAsset) {
        envRef = `Background Reference: Use the provided '${photoShootAsset.name}' image as the EXACT environment/background. Do not alter the background scene structure. Integrate the bottles realistically into this scene${bottleSurfacePosStr}.\nLighting Style: ${ctx.lightingDesc} ${ctx.strictLightingConstraint}${customBackground ? `\nAdditional Background Details: ${customBackground}` : ''}`;
    } else if (ctx.hasReference) {
        envRef = `Environment and surface must match the reference image style${bottleSurfacePosStr}. ${ctx.strictLightingConstraint}`;
    } else {
        envRef = `The bottles are centered on a ${ctx.surfDesc} surface${bottleSurfacePosStr}. Background is ${ctx.bgDesc}.`;
    }

    if (bottles.length > 1) {
        return generateMultiBottlePrompt(bottles, anglePrompt, envRef, ctx);
    }

    return generateSingleBottlePrompt(bottles[0], anglePrompt, envRef, ctx);
}

function generateMultiBottlePrompt(
    bottles: BottleWithPlacement[],
    anglePrompt: string,
    envRef: string,
    ctx: SceneContext,
): string {
    const bottleDescriptions = bottles.map((b, i) => {
        const placementObj = b.placementX ? BOTTLE_X_POSITIONS.find(p => p.id === b.placementX) : null;
        const depthObj = b.placementDepth ? BOTTLE_DEPTH_POSITIONS.find(p => p.id === b.placementDepth) : null;
        const placementStr = (placementObj || depthObj) ? ` Positioned ${placementObj?.prompt || ''} ${depthObj?.prompt || ''}.` : '';
        const name = b.isCustom ? b.name : `YaVe ${b.name} Tequila`;
        return `Bottle ${i + 1}: ${name}.${placementStr}`;
    }).join('\n');
    const bottleNames = bottles.map(b => b.isCustom ? b.name : `YaVe ${b.name} Tequila`).join(' and ');
    const multiBottleCount = bottles.length;
    const multiCountConstraint = `EXACTLY ${multiBottleCount} bottles must appear. DO NOT INCLUDE MORE OR FEWER THAN ${multiBottleCount} BOTTLES.`;

    const labelDetails = buildLabelDetails(bottles[0], bottles[0].name);

    return `Professional commercial product photography of a group of bottles: ${bottleNames}.
             ${anglePrompt}
             Aspect Ratio ${ctx.ratioText}.
             ${envRef}
             ${ctx.lightingDesc}

             BOTTLE PLACEMENT:
             ${bottleDescriptions}

             ${buildFidelityInstructions({
                bottleCountText: multiCountConstraint,
                scaleText: `The bottles are standard 750ml bottles. They are the hero subjects of this shot.`,
                suffix: labelDetails
             })}

             ${ctx.strictLightingConstraint}
             ${ctx.actionText}
             ${ctx.propsText}
             ${ctx.humanText}
             NO GLASSWARE. NO COCKTAILS. NO DRINKS. FOCUS ON THE BOTTLES ONLY.
             ${ctx.cameraPrompt}
             Aesthetic is "Maverick" - bold, premium, sophisticated, high contrast.
             high resolution, 8k, photorealistic.
             NEGATIVE PROMPT / AVOID: ${BRAND_NEGATIVE_PROMPT}`;
}

function generateSingleBottlePrompt(
    currentBottle: BottleWithPlacement | undefined,
    anglePrompt: string,
    envRef: string,
    ctx: SceneContext,
): string {
    const bottleName = currentBottle ? currentBottle.name : 'Blanco';
    const isYaVeBottle = currentBottle ? !currentBottle.isCustom : true;

    const singleLabelDetails = buildLabelDetails(currentBottle, bottleName);

    // Single bottle placement
    const singlePlacementObj = currentBottle?.placementX ? BOTTLE_X_POSITIONS.find(p => p.id === currentBottle.placementX) : null;
    const singleDepthObj = currentBottle?.placementDepth ? BOTTLE_DEPTH_POSITIONS.find(p => p.id === currentBottle.placementDepth) : null;
    const singlePlacementStr = (singlePlacementObj || singleDepthObj) ? `\nBottle Positioning: ${singlePlacementObj?.prompt || ''} ${singleDepthObj?.prompt || ''}.` : '';

    return `Professional commercial product photography of a bottle of ${isYaVeBottle ? 'YaVe ' + bottleName : bottleName} Tequila.
        ${anglePrompt}
            Aspect Ratio ${ctx.ratioText}.
            ${envRef}
            ${ctx.lightingDesc}
            ${singlePlacementStr}

            ${buildFidelityInstructions({
                bottleCountText: 'EXACTLY ONE bottle. DO NOT INCLUDE ANY EXTRA BOTTLES. ONLY ONE BOTTLE IS VISIBLE.',
                scaleText: `The bottle is a standard 750ml bottle. It is the hero subject of this shot.`,
                suffix: singleLabelDetails
            })}

            ${ctx.strictLightingConstraint}
            ${ctx.actionText}
            ${ctx.propsText}
            ${ctx.humanText}
            NO GLASSWARE. NO COCKTAILS. NO DRINKS. FOCUS ON THE BOTTLE ONLY.
            ${ctx.cameraPrompt}
            Aesthetic is "Maverick" - bold, premium, sophisticated, high contrast.
            high resolution, 8k, photorealistic.
            NEGATIVE PROMPT / AVOID: ${BRAND_NEGATIVE_PROMPT}`;
}

// ───────────────────────────────────────────
// Tequila Cocktail Mode Prompt
// ───────────────────────────────────────────

function generateTequilaCocktailPrompt(state: PromptState, ctx: SceneContext): string {
    const {
        drinks,
        standaloneBottleSku,
        activeBottles,
        showBottle,
        customLighting,
        lighting,
        photoShootAsset,
    } = state;

    // Process Angle Prompt
    const standaloneSkuName = standaloneBottleSku ? standaloneBottleSku.name : 'Blanco';
    const anglePrompt = processAnglePrompt(
        state.angleLabel, drinks, standaloneSkuName, showBottle, !!state.bottleOnlyMode
    );

    // Common Label Text Definition
    const primarySku = drinks.length > 0 ? drinks[0].selectedSku : (standaloneBottleSku || { name: 'Blanco', isCustom: false } as TequilaSku);
    const isYaVe = !primarySku.isCustom;
    const brandName = isYaVe ? 'YaVe' : primarySku.name;
    const labelDetails = buildLabelDetails(primarySku, primarySku.name);

    // Describe Drinks
    const drinkDescriptions = buildDrinkDescriptions(drinks);

    // Bottle Logic
    const bottleMention = buildBottleMention(primarySku, labelDetails, drinks, activeBottles, showBottle);

    const strictConstraints = "EXTREMELY IMPORTANT: The glassware MUST BE UNBRANDED and CLEAR. NO LOGOS on the glass.";

    // Lighting
    const lightCustomText = customLighting || (lighting?.id === 'custom' ? lighting.prompt : '');
    const finalLightingDesc = lightCustomText || (lighting?.promptTemplate || ', professional studio lighting, high contrast.');

    const base = `Professional commercial studio photography of ${drinks.length > 1 ? 'a group of cocktails' : 'a cocktail'} made with ${brandName} Tequila. 8k resolution, photorealistic.`;
    const composition = `${anglePrompt} Aspect Ratio ${ctx.ratioText}. ${drinks.length > 1 ? 'Group composition with balanced spacing.' : 'Centered composition.'} `;

    // Environment Logic
    const surfacePlacement = state.surfacePlacement ? SURFACE_PLACEMENTS.find(p => p.id === state.surfacePlacement) : null;
    const surfacePosStr = surfacePlacement ? `, ${surfacePlacement.prompt}` : "";

    let environment = "";
    if (photoShootAsset) {
        environment = `Background Reference: Use the provided '${photoShootAsset.name}' image as the EXACT environment/background. Do not alter the background scene structure. Integrate the cocktails realistically into this scene${surfacePosStr}.\nLighting Style: ${finalLightingDesc} ${ctx.strictLightingConstraint} ${ctx.bgCustomText ? `\nAdditional Background Details: ${ctx.bgCustomText}` : ''} `;
    } else if (ctx.hasReference && !ctx.bgCustomText && !ctx.surfCustomText) {
        environment = `The scene environment, background, and surface MUST MATCH the provided reference image style, lighting, and mood. ${finalLightingDesc} ${ctx.strictLightingConstraint} `;
    } else {
        environment = `The drinks are sitting on a ${ctx.surfCustomText || ctx.surfDesc} surface${surfacePosStr}. Background is ${ctx.bgCustomText || ctx.bgDesc}. ${finalLightingDesc} `;
    }

    const style = `Aesthetic is "Maverick" - bold, premium, sophisticated, high contrast. ${ctx.cameraPrompt} `;

    return `${base} ${composition}

    THE SCENE CONTAINS:
    ${drinkDescriptions}
    ${ctx.propsText}

    ${bottleMention}
    ${ctx.actionText}
    ${ctx.humanText}

    ${environment}
    ${strictConstraints}
    ${style}

    NEGATIVE PROMPT / AVOID: ${BRAND_NEGATIVE_PROMPT} `;
}

function buildDrinkDescriptions(drinks: DrinkState[]): string {
    return drinks.map((drink, index) => {
        const liquidDesc = drink.visualDescription || `a delicious ${drink.customRecipe} `;
        const iceQtyStr = drink.iceQuantity ? drink.iceQuantity.toLowerCase() : 'many';
        const iceDesc = drink.ice.id !== 'none' ? `${iceQtyStr} ${drink.ice.detail} ` : 'no ice';

        // Glass Detail
        let glassDesc = drink.glassware.name;
        if (drink.glassware.name === 'Rocks Glass' && drink.rocksGlassType === 'Diamond Cut') {
            glassDesc = 'Diamond Cut Rocks Glass with intricate pattern';
        }
        if (drink.customGlasswareDetail) {
            glassDesc += `, ${drink.customGlasswareDetail} `;
        }

        // Garnish
        const garnishPlacementMap: Record<string, string> = {
            'rim': 'perched on the rim',
            'in-glass': 'floating inside amongst ice',
            'floating': 'floating gently on the surface of the liquid',
            'side': 'placed neatly next to the glass',
            'around': 'arranged aesthetically around the base of the glass',
            'scattered': 'casually scattered on the surface around the glass'
        };
        const garnishDesc = drink.garnishes.length > 0
            ? "Garnished with " + drink.garnishes.map(g => `${g.name} (${garnishPlacementMap[g.placement] || 'on rim'})`).join(" and ")
            : 'No garnish';

        // Position Logic
        let position = '';
        const posX = drink.placementX ? BOTTLE_X_POSITIONS.find(p => p.id === drink.placementX) : null;
        const posDepth = drink.placementDepth ? BOTTLE_DEPTH_POSITIONS.find(p => p.id === drink.placementDepth) : null;

        if (posX || posDepth) {
            position = `Positioned ${posX?.prompt || ''} ${posDepth?.prompt || ''}.`;
        } else if (drinks.length > 1) {
            if (index === 0) position = 'Positioned on the LEFT side of the frame.';
            if (index === 1) position = 'Positioned on the RIGHT side of the frame.';
            if (index === 2) position = 'Positioned in the CENTER, slightly forward.';
        } else {
            position = 'Positioned naturally in the scene.';
        }

        return `COCKTAIL ${index + 1} (${drink.customRecipe}): ${position} A ${glassDesc} filled with ${liquidDesc}, ${iceDesc}. ${garnishDesc}.`;
    }).join('\n');
}

function buildBottleMention(
    primarySku: TequilaSku,
    labelDetails: string,
    drinks: DrinkState[],
    activeBottles: BottleWithPlacement[] | undefined,
    showBottle: boolean,
): string {
    // Scale Logic
    const glassType = drinks.length > 0 ? drinks[0].glassware.id : 'rocks-glass';
    const isMediumGlass = ['highball-glass', 'hurricane-glass', 'pilsner-glass'].includes(glassType);

    const heightCat = primarySku.heightCategory || 'standard';
    let heightMultiplier = 2.5;
    if (heightCat === 'short') heightMultiplier = 1.25;
    if (heightCat === 'tall') heightMultiplier = 3.5;
    if (isMediumGlass) heightMultiplier *= 0.65;

    const scaleConstraint = `The bottle must appear approximately ${heightMultiplier.toFixed(1)}x taller than the glassware.`;

    // Auto-show if bottles are explicitly active, or if toggled
    const shouldShowBottles = showBottle || (activeBottles && activeBottles.length > 0);

    if (!shouldShowBottles) {
        return 'DO NOT include any bottles. Focus on the cocktails.';
    }

    if (activeBottles && activeBottles.length > 0) {
        const bottleNames = activeBottles.map(b => {
            const placementObj = b.placementX ? BOTTLE_X_POSITIONS.find(p => p.id === b.placementX) : null;
            const depthObj = b.placementDepth ? BOTTLE_DEPTH_POSITIONS.find(p => p.id === b.placementDepth) : null;
            const placementStr = (placementObj || depthObj) ? `\n- Position: ${placementObj?.prompt || ''} ${depthObj?.prompt || ''}` : '';

            if (b.isCustom) return `Bottle: ${b.name}${placementStr}`;
            return `Bottle of YaVe ${b.name} Tequila:\n` +
                `- Shape: ${BOTTLE_CORE.SHAPE}\n` +
                `- Liquid: ${b.colorDescription}\n` +
                `- Key Icon: ${BOTTLE_CORE.FRONT_GRAPHIC}\n` +
                `- Pattern: ${BOTTLE_CORE.INNER_PATTERN}\n` +
                `- Logo: ${BOTTLE_CORE.MAIN_LOGO}\n` +
                `- Label Main Text: "${b.bottleText}"\n` +
                `- Label Details: ${b.labelInstructions}` +
                placementStr;
        }).join('\n\n');

        const count = activeBottles.length;
        const intro = count > 1 ? `Also in the scene are EXACTLY ${count} bottles:` : "Also in the scene is EXACTLY ONE bottle:";
        const constraint = count === 1 ? "DO NOT INCLUDE ANY EXTRA BOTTLES. ONLY ONE BOTTLE IS VISIBLE." : `DO NOT INCLUDE MORE THAN ${count} BOTTLES.`;

        return `${intro}\n${bottleNames}. ${buildFidelityInstructions({
            bottleCountText: constraint,
            scaleText: `The bottles are standard 750ml bottles.${scaleConstraint} They are positioned behind or to the side of the cocktails to anchor the composition.`
        })}`;
    }

    // Fallback to single primary SKU logic
    const description = `- Shape: ${BOTTLE_CORE.SHAPE}\n` +
        `- Liquid: ${primarySku.colorDescription}\n` +
        `- Key Icon: ${BOTTLE_CORE.FRONT_GRAPHIC}\n` +
        `- Pattern: ${BOTTLE_CORE.INNER_PATTERN}\n` +
        `- Logo: ${BOTTLE_CORE.MAIN_LOGO}\n` +
        `- Label Main Text: "${primarySku.bottleText}"\n` +
        `- Label Details: ${primarySku.labelInstructions}`;

    return `Also in the scene is EXACTLY ONE premium bottle of ${primarySku.name} Tequila.\n${description}\n${buildFidelityInstructions({
        bottleCountText: 'DO NOT INCLUDE ANY EXTRA BOTTLES. ONLY ONE BOTTLE IS VISIBLE.',
        scaleText: `The bottle is a standard 750ml bottle.${scaleConstraint} It is positioned behind or to the side of the cocktails to anchor the composition.`,
        suffix: labelDetails
    })} `;
}

// ───────────────────────────────────────────
// Main Entry Point
// ───────────────────────────────────────────

export function generateCocktailPrompt(state: PromptState): string {
    const ctx = buildSceneContext(state);

    if (state.mode === 'studio') {
        return generateStudioPrompt(state, ctx);
    }

    if (state.drinks.length === 0 || state.bottleOnlyMode) {
        return generateBottleOnlyPrompt(state, ctx);
    }

    return generateTequilaCocktailPrompt(state, ctx);
}
