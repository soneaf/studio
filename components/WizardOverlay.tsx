'use client';

import ConfirmDialog from './ConfirmDialog';
import { useBuilder } from '@/lib/builder-context';
import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion'; // Removed to avoid dependency issues
import { TEQUILA_SKUS, RECIPES, GLASSWARE, ICE_OPTIONS, GARNISHES, BACKGROUNDS, COUNTERTOPS, LIGHTING_MOODS, CAMERA_TYPES, ANGLES, PROPS, PROP_PLACEMENTS, BOTTLE_X_POSITIONS, BOTTLE_DEPTH_POSITIONS, SURFACE_PLACEMENTS, SEASONAL_PRESETS, type SeasonalPreset } from '@/lib/data';
import Image from 'next/image';
import GlasswareGrid from './GlasswareGrid';
import CameraSelector from './CameraSelector';
import PromptReviewPanel from './PromptReviewPanel';

// Fallback for missing framer-motion if not available (using standard div)
const MotionDiv = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => <div className={className} {...props}>{children}</div>;

import { getSettings, type GeneralProduct, type BrandPreset, saveBrandPreset, deleteBrandPreset, type Client, type JsonTemplate, saveJsonTemplate, deleteJsonTemplate } from '@/app/settings-actions';

export default function WizardOverlay({ onClose, onComplete, inline = false }: { onClose: () => void, onComplete: (templatePrompt?: string, templateReferenceImages?: string[]) => void, inline?: boolean }) {
    const { state, dispatch, addDrink, setActiveDrink, removeDrink, setReferenceImage, toggleProduct, toggleProductVariant, setAspectRatio, toggleAspectRatio, activeClientId, setClientId, setTemplateOverride } = useBuilder();
    const [currentStep, setCurrentStep] = useState(0);
    const [maxStepReached, setMaxStepReached] = useState(0);
    const [isDescribing, setIsDescribing] = useState(false);

    useEffect(() => {
        if (currentStep > maxStepReached) {
            setMaxStepReached(currentStep);
        }
    }, [currentStep, maxStepReached]);

    // Custom Data State
    const [customBottles, setCustomBottles] = useState<GeneralProduct[]>([]);
    const [studioProducts, setStudioProducts] = useState<GeneralProduct[]>([]);
    const [photoShootAssets, setPhotoShootAssets] = useState<import('@/app/settings-actions').PhotoShootAsset[]>([]);
    const [customPresets, setCustomPresets] = useState<BrandPreset[]>([]);
    const [hiddenPresetIds, setHiddenPresetIds] = useState<string[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    const isVisible = (item: { clientId?: string | null }) => {
        if (!activeClientId) return !item.clientId; // Global View
        return !item.clientId || item.clientId === activeClientId; // Client View: Global + Client Items
    };

    const isVisibleStrict = (item: { clientId?: string | null }) => {
        if (!activeClientId) return !item.clientId;
        return item.clientId === activeClientId;
    };

    // Save Preset State
    const [showSavePresetModal, setShowSavePresetModal] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [newPresetEmoji, setNewPresetEmoji] = useState('✨');

    // Preset Flow Logic
    const [isPresetFlow, setIsPresetFlow] = useState(false);
    const PRESET_SKIPS = ['format', 'camera', 'angle', 'your-scene', 'atmosphere', 'lighting'];

    // Local state for Garnish Modal (duplicated logic from Controls)
    const [showGarnishModal, setShowGarnishModal] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [selectedGarnishToAdd, setSelectedGarnishToAdd] = useState<{ id: string; name: string; section: string } | null>(null);
    const [toothpickMode, setToothpickMode] = useState(false);
    const [toothpickStyle, setToothpickStyle] = useState<'Wood' | 'Metal' | 'Decorative'>('Wood');
    const [customGarnishInput, setCustomGarnishInput] = useState('');
    const [isBottleOnly, setIsBottleOnly] = useState(false);
    const [includeExtraBottles, setIncludeExtraBottles] = useState(false);
    const [actionSubjectId, setActionSubjectId] = useState('');
    const [actionDescription, setActionDescription] = useState('');
    const [garnishSearch, setGarnishSearch] = useState('');
    const [isSuggestingGarnishes, setIsSuggestingGarnishes] = useState(false);
    const [showSaveFullTemplateModal, setShowSaveFullTemplateModal] = useState(false);
    const [fullTemplateName, setFullTemplateName] = useState('');
    const [isSavingFullTemplate, setIsSavingFullTemplate] = useState(false);
    const [customSubjectName, setCustomSubjectName] = useState('');
    const [propToAdd, setPropToAdd] = useState<{ id: string; name: string; value?: string; section?: string } | null>(null);
    const [customPropName, setCustomPropName] = useState('');
    const [activePropSection, setActivePropSection] = useState<string | null>(null);
    const [propSearch, setPropSearch] = useState('');
    const [customPlacement, setCustomPlacement] = useState('');
    const [showCustomPlacementInput, setShowCustomPlacementInput] = useState(false);
    const [customPropColor, setCustomPropColor] = useState('');
    const [showColorInput, setShowColorInput] = useState(false);
    const [propDetails, setPropDetails] = useState('');
    const [showDetailsInput, setShowDetailsInput] = useState(false);
    const [warningDialog, setWarningDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [humanEditTarget, setHumanEditTarget] = useState<string>('global');
    // JSON Template State
    const [showJsonTemplateSection, setShowJsonTemplateSection] = useState(false);
    const [jsonTemplateInput, setJsonTemplateInput] = useState('');
    const [parsedTemplate, setParsedTemplate] = useState<Record<string, unknown> | null>(null);
    const [templateFormValues, setTemplateFormValues] = useState<Record<string, any>>({});
    const [jsonParseError, setJsonParseError] = useState<string | null>(null);
    const [savedTemplates, setSavedTemplates] = useState<{ id: string; name: string; json: string }[]>([]);
    const [templateName, setTemplateName] = useState('');
    const [isTemplateMode, setIsTemplateMode] = useState(false);
    const [generatedPromptPreview, setGeneratedPromptPreview] = useState('');
    const [templatePromptCopied, setTemplatePromptCopied] = useState(false);
    const [templateStep, setTemplateStep] = useState(0); // 0 = paste, 1 = edit form, 2 = generated
    const [selectedSubjectProduct, setSelectedSubjectProduct] = useState<{ name: string; image?: string } | null>(null);
    const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [variableProductSelections, setVariableProductSelections] = useState<Record<string, { name: string; image?: string }>>({});

    // Fetch Settings on Mount
    useEffect(() => {
        getSettings().then((settings) => {
            if (settings.customBottles) {
                setCustomBottles(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newBottles = settings.customBottles!.filter(p => !existingIds.has(p.id)) as unknown as GeneralProduct[];
                    return [...prev, ...newBottles];
                });
            }
            if (settings.photoShootAssets) setPhotoShootAssets(settings.photoShootAssets);
            if (settings.generalProducts) setStudioProducts(settings.generalProducts);
            if (settings.brandPresets) setCustomPresets(settings.brandPresets);
            if (settings.brandPresets) setCustomPresets(settings.brandPresets);
            if (settings.hiddenPresetIds) setHiddenPresetIds(settings.hiddenPresetIds);
            if (settings.clients) setClients(settings.clients);
            if (settings.jsonTemplates) setSavedTemplates(settings.jsonTemplates);
        });
    }, []);



    const TEQUILA_STEPS = [
        { id: 'intro', title: 'Start', subtitle: 'Choose your workflow.' },
        { id: 'format', title: 'Format', subtitle: 'Select the aspect ratio for your image.' },
        { id: 'camera', title: 'Camera Style', subtitle: 'Choose the lens and aesthetic.' },
        { id: 'angle', title: 'Shot Angle', subtitle: 'Frame your shot.' },
        { id: 'liquid', title: 'Choose Your Poison', subtitle: 'Describe your cocktail recipe.' },
        { id: 'bottles', title: 'Select Bottles', subtitle: 'Choose bottles to display in the scene.' },
        { id: 'vessel', title: 'Select Glassware', subtitle: 'What vessel should this be served in?' },
        { id: 'ice', title: 'The Chill', subtitle: 'Select ice type and quantity.' },
        { id: 'garnish', title: 'Garnish', subtitle: 'Add the finishing touches.' },

        { id: 'props', title: 'Props/Elements', subtitle: 'Add styling elements to your scene.' },
        { id: 'human', title: 'Human Element', subtitle: 'Add human touch to the shot.' },
        { id: 'your-scene', title: 'Your Scene', subtitle: 'Choose a pre-made photo shoot background.' },
        { id: 'set-scene', title: 'Set the Scene', subtitle: 'Custom Environment and Vibe.' },
        { id: 'lighting', title: 'Lighting', subtitle: 'Set the mood.' },
        { id: 'review', title: 'Review & Prompt', subtitle: 'Fine-tune your prompt before generating.' },
    ];

    const STUDIO_STEPS = [
        { id: 'intro', title: 'Start', subtitle: 'Choose your workflow.' },
        { id: 'format', title: 'Format', subtitle: 'Select the aspect ratio for your image.' },
        { id: 'camera', title: 'Camera Style', subtitle: 'Choose the lens and aesthetic.' },
        { id: 'angle', title: 'Shot Angle', subtitle: 'Frame your shot.' },
        { id: 'product', title: 'Studio Products', subtitle: 'Select products to showcase.' },
        { id: 'props', title: 'Props/Elements', subtitle: 'Add styling elements to your scene.' },
        { id: 'human', title: 'Human Element', subtitle: 'Add human touch to the shot.' },
        { id: 'your-scene', title: 'Your Scene', subtitle: 'Choose a pre-made photo shoot background.' },
        { id: 'atmosphere', title: 'Set the Scene', subtitle: 'Environment, Lighting, and Vibe.' },
        { id: 'lighting', title: 'Lighting', subtitle: 'Set the mood.' },
        { id: 'review', title: 'Review & Prompt', subtitle: 'Fine-tune your prompt before generating.' },
    ];

    const STEPS = state.mode === 'studio' ? STUDIO_STEPS : TEQUILA_STEPS;

    const handleNext = () => {
        const stepId = STEPS[currentStep].id;
        let warning = null;
        const isAssetActive = state.background?.id?.startsWith('asset-');

        // Validation Checks
        if (stepId === 'format' && !state.aspectRatio) {
            warning = { title: 'No Format Selected', message: 'Please select an image format to continue.' };
        } else if (stepId === 'camera' && (!state.camera?.id || state.camera.id === '')) {
            warning = { title: 'No Camera Style Selected', message: 'Please choose a camera style.' };
        } else if (stepId === 'angle' && (!state.angle?.id || state.angle.id === '' || (state.angle.id === 'match-asset' && !isAssetActive))) {
            warning = { title: 'No Shot Angle Selected', message: 'Please select a camera angle for your shot.' };
        } else if (stepId === 'product' && state.activeProducts.length === 0) {
            warning = { title: 'No Products Selected', message: 'You haven\'t selected any products to showcase. Are you sure you want to proceed?' };
        } else if (stepId === 'props' && state.props.length === 0) {
            warning = { title: 'No Props Selected', message: 'Adding props helps create a more realistic scene. Do you want to continue without them?' };
        } else if (stepId === 'your-scene' && (!state.background?.id || state.background.id === '')) {
            warning = { title: 'No Scene Selected', message: 'You haven\'t selected a background asset. Proceed with a solid color?' };
        } else if (stepId === 'lighting' && (!state.lighting?.id || state.lighting.id === '' || (state.lighting.id === 'match-asset' && !isAssetActive))) {
            warning = { title: 'No Lighting Selected', message: 'Please select a lighting mood.' };
        }

        const proceed = () => {
            if (currentStep < STEPS.length - 1) {
                let nextIndex = currentStep + 1;

                // Find next invalid-to-skip step
                while (nextIndex < STEPS.length) {
                    const id = STEPS[nextIndex].id;
                    const skipForBottle = isBottleOnly && ['vessel', 'ice', 'garnish'].includes(id);
                    const skipForPreset = isPresetFlow && PRESET_SKIPS.includes(id);

                    if (skipForBottle || skipForPreset) {
                        nextIndex++;
                    } else {
                        break; // Found valid step
                    }
                }

                if (nextIndex < STEPS.length) {
                    setCurrentStep(nextIndex);
                } else {
                    // Try to finish? Or if we skipped everything to the end?
                    // Currently last step is Review, which is not in skip list, so we're safe.
                    onComplete();
                }
            } else {
                onComplete();
            }
        };

        if (warning) {
            setWarningDialog({
                isOpen: true,
                title: warning.title,
                message: warning.message,
                onConfirm: () => {
                    setWarningDialog(prev => ({ ...prev, isOpen: false }));
                    proceed();
                }
            });
        } else {
            proceed();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            let prevIndex = currentStep - 1;

            while (prevIndex >= 0) {
                const id = STEPS[prevIndex].id;
                const skipForBottle = isBottleOnly && ['vessel', 'ice', 'garnish'].includes(id);
                const skipForPreset = isPresetFlow && PRESET_SKIPS.includes(id);

                if (skipForBottle || skipForPreset) {
                    prevIndex--;
                } else {
                    break;
                }
            }

            if (prevIndex >= 0) {
                setCurrentStep(prevIndex);
            } else {
                // Return to Intro
                setCurrentStep(0);
                setIsPresetFlow(false); // Reset if going all the way back
            }
        }
    };

    const handleGarnishSelection = (garnish: { id: string; name: string }, placement: string) => {
        let finalName = garnish.name;
        if (toothpickMode) {
            finalName += ` (On ${toothpickStyle} Pick)`;
        }
        dispatch({
            type: 'ADD_GARNISH',
            index: state.activeDrinkIndex,
            garnish: { id: garnish.id, name: finalName, placement, quantity: 1 }
        });
        setShowGarnishModal(false);
        setActiveSection(null);
        setSelectedGarnishToAdd(null);
        setToothpickMode(false);
        setToothpickStyle('Wood');
    };

    // Import this at top if not present, but I'll assume I can just use the import if available or I'll need to add it via another edit.
    // Wait, I need to make sure generateVisualDescription is imported.
    // I will use a separate edit for imports if needed, but 'replace_file_content' is powerful. 
    // I'll assume the import needs to be added or is globally available in context? No, it's a util.
    // I'll check imports later or just add it now if possible? I can't add imports easily mid-file.
    // I'll stick to logic here and fix imports in next step if it errors.

    // Actually, I can just use dynamic import for the action if I want to be safe or assuming it serves next.js actions.
    const handleAutoDescribe = async () => {
        const recipeName = state.drinks[state.activeDrinkIndex]?.customRecipe;
        if (!recipeName) return;
        setIsDescribing(true);
        try {
            const { generateVisualDescription } = await import('@/app/auto-describe'); // Dynamic import to avoid top-level mess
            const result = await generateVisualDescription(recipeName);
            if (result.success && result.description) {
                dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'visualDescription', value: result.description });
            }
        } catch (e) {
            console.error(e);
        }
        setIsDescribing(false);
    };

    const handleInspireMe = () => {
        const randomRecipe = RECIPES[Math.floor(Math.random() * RECIPES.length)] as any;
        dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'customRecipe', value: randomRecipe.name });
        // Optionally auto-describe it too?
        dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'visualDescription', value: randomRecipe.description || randomRecipe.visualDescription || '' });
    };

    const toggleBottleOnly = () => {
        const newState = !isBottleOnly;
        setIsBottleOnly(newState);

        // Sync with global state for Prompt Generator
        dispatch({ type: 'SET_BOTTLE_ONLY_MODE', value: newState });

        if (newState) {
            dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'customRecipe', value: 'Bottle Shot' });
            dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'visualDescription', value: 'Professional product photography of the bottle, centered, high quality.' });
            // Maybe set glass to none?
            dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'glassware', value: { id: 'none', name: 'None', imagePath: '' } });
            // Clear garnish?
            dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'garnishes', value: [] });
            // Clear ice?
            dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'ice', value: ICE_OPTIONS.find(i => i.id === 'none') || ICE_OPTIONS[0] });
        } else {
            dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'customRecipe', value: '' });
            dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'visualDescription', value: '' });
        }
    };

    // --- STEP RENDERERS ---

    const renderStepStudioProducts = () => (
        <div className="space-y-8">
            <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                Select Studio Products
            </label>

            {studioProducts.length === 0 ? (
                <div className="text-sm text-gray-400 italic bg-[#1a1a1a] p-8 rounded-xl text-center border border-[#333] border-dashed">
                    No studio products found. Go to Settings &gt; Studio Assets to upload one.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {studioProducts.filter(isVisibleStrict).map(prod => {
                        const selection = state.activeProducts?.find(p => p.product.id === prod.id);
                        const isSelected = !!selection;
                        const variantIds = selection?.variantIds || ['main'];

                        // Thumbnail logic
                        let displayImage = prod.imagePath;
                        if (isSelected && !variantIds.includes('main') && variantIds.length > 0 && prod.variants) {
                            const firstVarId = variantIds[0];
                            const v = prod.variants.find(v => v.id === firstVarId);
                            if (v) displayImage = v.imagePath;
                        }

                        return (
                            <div key={prod.id} className="relative flex flex-col gap-2 z-10 group">
                                {/* Main Button */}
                                <button
                                    onClick={() => { toggleProduct(prod);}}
                                    className={`relative w-full aspect-square rounded-xl border-2 overflow-hidden transition-all group ${isSelected ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)] bg-[#1a1a1a]' : 'border-[#333] hover:border-[#555] bg-[#111]'}`}
                                >
                                    <div className="absolute inset-0 p-4">
                                        <div className="relative w-full h-full">
                                            <Image src={`/api/download?path=${encodeURIComponent(displayImage)}`} unoptimized alt={prod.name} fill className="object-contain" />
                                        </div>
                                    </div>
                                    {/* Gold Dot on Card */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)] z-20" />
                                    )}
                                </button>

                                {/* Name */}
                                <div className="text-xs text-center truncate w-full text-gray-400 group-hover:text-white transition-colors font-medium">{prod.name}</div>

                                {/* Variant Selector */}
                                {prod.variants && prod.variants.length > 0 && isSelected && (
                                    <div className="space-y-1 bg-[#1a1a1a] border border-[#333] rounded-lg p-2">
                                        <div
                                            onClick={() => toggleProductVariant(prod.id, 'main')}
                                            className="flex items-center gap-2 p-1.5 hover:bg-[#222] rounded cursor-pointer group"
                                        >
                                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${variantIds.includes('main') ? 'border-[var(--color-yave-gold)] bg-[var(--color-yave-gold)]/10' : 'border-[#444] group-hover:border-[#666]'}`}>
                                                {variantIds.includes('main') && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_5px_var(--color-yave-gold)]" />}
                                            </div>
                                            <span className="text-[10px] text-gray-300">Main View</span>
                                        </div>
                                        {prod.variants.map(v => (
                                            <div
                                                key={v.id}
                                                onClick={() => toggleProductVariant(prod.id, v.id)}
                                                className="flex items-center gap-2 p-1.5 hover:bg-[#222] rounded cursor-pointer group"
                                            >
                                                <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${variantIds.includes(v.id) ? 'border-[var(--color-yave-gold)] bg-[var(--color-yave-gold)]/10' : 'border-[#444] group-hover:border-[#666]'}`}>
                                                    {variantIds.includes(v.id) && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_5px_var(--color-yave-gold)]" />}
                                                </div>
                                                <span className="text-[10px] text-gray-300 truncate">{v.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const DEFAULT_PRESETS = [
        {
            id: 'speakeasy',
            title: 'Speakeasy Bar',
            subtitle: 'Dark, moody, cinematic.',
            emoji: '🥃',
            mode: 'tequila',
            settings: {
                camera: 'pro-studio',
                lighting: 'moody-bar',
                background: 'leather-black',
                countertop: 'wood-walnut',
                angle: 'straight-on'
            }
        },
        {
            id: 'bright-studio',
            title: 'Daylight Studio',
            subtitle: 'Bright, airy, commercial.',
            emoji: '☀️',
            mode: 'tequila',
            settings: {
                camera: 'ecommerce',
                lighting: 'natural-daylight',
                background: 'concrete-grey',
                countertop: 'marble-white',
                angle: 'straight-on'
            }
        },
        {
            id: 'neon-club',
            title: 'Neon Nightclub',
            subtitle: 'Vibrant, colorful, edgy.',
            emoji: '🟣',
            mode: 'tequila',
            settings: {
                camera: 'neon',
                lighting: 'neon-club',
                background: 'leather-black',
                countertop: 'marble-black',
                angle: 'high-angle'
            }
        }
    ];

    const allPresets = [...DEFAULT_PRESETS.filter(p => !hiddenPresetIds.includes(p.id)), ...customPresets];

    const handleDeletePreset = (id: string) => {
        setWarningDialog({
            isOpen: true,
            title: 'Delete Preset?',
            message: 'Are you sure you want to remove this preset?',
            onConfirm: async () => {
                const res = await deleteBrandPreset(id);
                if (res.success) {
                    if (customPresets.some(p => p.id === id)) {
                        setCustomPresets(prev => prev.filter(p => p.id !== id));
                    } else {
                        setHiddenPresetIds(prev => [...prev, id]);
                    }
                    setWarningDialog(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handlePreset = (p: any) => {
        setIsPresetFlow(true);
        const targetMode = p.mode || 'tequila';

        // 1. Set Mode
        dispatch({ type: 'SET_MODE', value: targetMode });

        // 2. Apply Settings (Safely finding data objects)
        const cam = CAMERA_TYPES.find(c => c.id === p.settings.camera);
        if (cam) dispatch({ type: 'SET_CAMERA', value: cam });

        const light = LIGHTING_MOODS.find(l => l.id === p.settings.lighting);
        if (light) dispatch({ type: 'SET_LIGHTING', value: light });

        const bg = BACKGROUNDS.find(b => b.id === p.settings.background);
        if (bg) dispatch({ type: 'SET_BACKGROUND', value: bg });

        const ct = COUNTERTOPS.find(c => c.id === p.settings.countertop);
        if (ct) dispatch({ type: 'SET_COUNTERTOP', value: ct });

        const ang = ANGLES.find(a => a.id === p.settings.angle);
        if (ang) dispatch({ type: 'SET_ANGLE', value: ang });

        // 3. Set Default Format
        setAspectRatio('4:5'); // Set directly to avoid toggle logic confusion

        // 4. Jump to Correct Step based on Mode
        const targetStepId = targetMode === 'studio' ? 'product' : 'liquid';
        const stepList = targetMode === 'studio' ? STUDIO_STEPS : TEQUILA_STEPS;

        const nextStepIndex = stepList.findIndex(s => s.id === targetStepId);
        if (nextStepIndex !== -1) {
            setCurrentStep(nextStepIndex);
        }
    };

    const handleSeasonalPreset = (preset: SeasonalPreset) => {
        // Apply theme settings without changing mode - user picks mode via main cards

        // Apply lighting
        const light = LIGHTING_MOODS.find(l => l.id === preset.lightingId);
        if (light) dispatch({ type: 'SET_LIGHTING', value: light });

        // Apply suggested background
        if (preset.backgroundSuggestion) {
            const bg = BACKGROUNDS.find(b => b.id === preset.backgroundSuggestion);
            if (bg) dispatch({ type: 'SET_BACKGROUND', value: bg });
        }

        // Apply suggested countertop
        if (preset.countertopSuggestion) {
            const ct = COUNTERTOPS.find(c => c.id === preset.countertopSuggestion);
            if (ct) dispatch({ type: 'SET_COUNTERTOP', value: ct });
        }

        // Add suggested props (limit to first 3)
        preset.propIds.slice(0, 3).forEach(propId => {
            const prop = PROPS.find(p => p.id === propId);
            if (prop) {
                dispatch({
                    type: 'ADD_PROP',
                    value: {
                        id: prop.id,
                        name: prop.name,
                        value: prop.value,
                        placement: 'surrounding',
                        quantity: 1
                    }
                });
            }
        });

        // Pre-load suggested garnishes (will apply when user picks Tequila mode)
        preset.suggestedGarnishIds.slice(0, 3).forEach(garnishId => {
            const garnish = GARNISHES.find(g => g.id === garnishId);
            if (garnish) {
                dispatch({
                    type: 'ADD_GARNISH',
                    index: state.activeDrinkIndex,
                    garnish: { id: garnish.id, name: garnish.name, placement: 'rim', quantity: 1 }
                });
            }
        });

        // Set default format
        setAspectRatio('4:5');
    };

    const handleAutoSuggestGarnishes = async () => {
        const recipeName = state.drinks[state.activeDrinkIndex]?.customRecipe;
        if (!recipeName || recipeName.trim().length === 0) {
            return;
        }

        setIsSuggestingGarnishes(true);
        try {
            const { suggestGarnishes } = await import('@/app/auto-suggest-garnishes');
            const result = await suggestGarnishes(recipeName);

            if (result.success && result.garnishIds) {
                result.garnishIds.forEach(id => {
                    const garnish = GARNISHES.find(g => g.id === id);
                    if (garnish) {
                        // Check if garnish already added
                        const alreadyAdded = state.drinks[state.activeDrinkIndex]?.garnishes?.some((g: any) => g.id === id);
                        if (!alreadyAdded) {
                            dispatch({
                                type: 'ADD_GARNISH',
                                index: state.activeDrinkIndex,
                                garnish: { id: garnish.id, name: garnish.name, placement: 'rim', quantity: 1 }
                            });
                        }
                    }
                });
            }
        } catch (error) {
            console.error('AI garnish suggestion failed:', error);
        }
        setIsSuggestingGarnishes(false);
    };

    // Filter full templates from customPresets
    const fullTemplates = customPresets.filter(p => p.isFullTemplate === true);

    const handleLoadFullTemplate = (template: any) => {
        setIsPresetFlow(true);

        // Set mode
        const targetMode = template.mode || 'tequila';
        dispatch({ type: 'SET_MODE', value: targetMode });

        // Apply basic settings (same as handlePreset)
        const cam = CAMERA_TYPES.find(c => c.id === template.settings.camera);
        if (cam) dispatch({ type: 'SET_CAMERA', value: cam });

        const light = LIGHTING_MOODS.find(l => l.id === template.settings.lighting);
        if (light) dispatch({ type: 'SET_LIGHTING', value: light });

        const bg = BACKGROUNDS.find(b => b.id === template.settings.background);
        if (bg) dispatch({ type: 'SET_BACKGROUND', value: bg });

        const ct = COUNTERTOPS.find(c => c.id === template.settings.countertop);
        if (ct) dispatch({ type: 'SET_COUNTERTOP', value: ct });

        const ang = ANGLES.find(a => a.id === template.settings.angle);
        if (ang) dispatch({ type: 'SET_ANGLE', value: ang });

        // Apply full config if present
        if (template.fullConfig) {
            const fc = template.fullConfig;

            if (fc.recipeName) {
                dispatch({ type: 'UPDATE_DRINK', index: 0, field: 'customRecipe', value: fc.recipeName });
            }
            if (fc.visualDescription) {
                dispatch({ type: 'UPDATE_DRINK', index: 0, field: 'visualDescription', value: fc.visualDescription });
            }
            if (fc.glasswareId) {
                const gw = GLASSWARE.find(g => g.id === fc.glasswareId);
                if (gw) dispatch({ type: 'UPDATE_DRINK', index: 0, field: 'glassware', value: gw });
            }
            if (fc.iceId) {
                const ice = ICE_OPTIONS.find(i => i.id === fc.iceId);
                if (ice) dispatch({ type: 'UPDATE_DRINK', index: 0, field: 'ice', value: ice });
            }
            if (fc.garnishes && fc.garnishes.length > 0) {
                fc.garnishes.forEach((g: any) => {
                    dispatch({
                        type: 'ADD_GARNISH',
                        index: 0,
                        garnish: { id: g.id, name: g.name, placement: g.placement || 'rim', quantity: g.quantity || 1 }
                    });
                });
            }
            if (fc.props && fc.props.length > 0) {
                fc.props.forEach((p: any) => {
                    dispatch({
                        type: 'ADD_PROP',
                        value: { id: p.id, name: p.name, value: p.value || '', placement: p.placement || 'surrounding', quantity: p.quantity || 1 }
                    });
                });
            }
            if (fc.aspectRatio) {
                setAspectRatio(fc.aspectRatio);
            }
        }

        // Jump to appropriate step
        const targetStepId = targetMode === 'studio' ? 'product' : 'liquid';
        const stepList = targetMode === 'studio' ? STUDIO_STEPS : TEQUILA_STEPS;
        const nextStepIndex = stepList.findIndex(s => s.id === targetStepId);
        if (nextStepIndex !== -1) {
            setCurrentStep(nextStepIndex);
        }
    };

    const handleSaveFullTemplate = async () => {
        if (!fullTemplateName.trim()) return;

        setIsSavingFullTemplate(true);
        try {
            const activeDrink = state.drinks[state.activeDrinkIndex];
            const { saveFullTemplate } = await import('@/app/settings-actions');

            const template = {
                title: fullTemplateName.trim(),
                subtitle: activeDrink?.customRecipe || 'Full Configuration',
                emoji: '📋',
                mode: state.mode as 'tequila' | 'studio',
                isFullTemplate: true as const,
                settings: {
                    camera: state.camera?.id || '',
                    lighting: state.lighting?.id || '',
                    background: state.background?.id || '',
                    countertop: state.countertop?.id || '',
                    angle: state.angle?.id || ''
                },
                fullConfig: {
                    recipeName: activeDrink?.customRecipe,
                    visualDescription: activeDrink?.visualDescription,
                    glasswareId: activeDrink?.glassware?.id,
                    iceId: activeDrink?.ice?.id,
                    iceQuantity: activeDrink?.iceQuantity,
                    garnishes: activeDrink?.garnishes,
                    props: state.props,
                    aspectRatio: state.aspectRatio,
                    customBackground: state.customBackground,
                    customCountertop: state.customCountertop,
                    customLighting: state.customLighting,
                    humanElement: state.humanElement
                }
            };

            const result = await saveFullTemplate(template);
            if (result.success) {
                setShowSaveFullTemplateModal(false);
                setFullTemplateName('');
            }
        } catch (error) {
            console.error('Failed to save full template:', error);
        }
        setIsSavingFullTemplate(false);
    };

    // JSON Template Helpers
    const parseJsonTemplate = (jsonStr: string) => {
        try {
            const parsed = JSON.parse(jsonStr);
            setJsonParseError(null);
            setParsedTemplate(parsed);

            // Initialize form values with defaults from the template
            const initialValues: Record<string, any> = {};

            // Detect {{variables}} in the JSON string
            const variablePattern = /\{\{(\w+)\}\}/g;
            const foundVariables = new Set<string>();
            let match;
            while ((match = variablePattern.exec(jsonStr)) !== null) {
                foundVariables.add(match[1]);
            }
            const variableList = Array.from(foundVariables);
            setDetectedVariables(variableList);
            console.log('📋 Detected variables:', variableList);

            // Initialize variable values
            const initialVarValues: Record<string, string> = {};
            variableList.forEach(v => {
                initialVarValues[v] = '';
            });
            setVariableValues(initialVarValues);
            setVariableProductSelections({});

            // Recursively extract all values from an object
            const extractAllValues = (obj: any, prefix = '') => {
                for (const [key, value] of Object.entries(obj)) {
                    if (key === 'id') continue; // Skip ID fields
                    const fieldKey = prefix ? `${prefix}.${key}` : key;

                    if (Array.isArray(value)) {
                        // Extract values from array items
                        value.forEach((item, idx) => {
                            if (typeof item === 'object' && item !== null) {
                                extractAllValues(item, `${fieldKey}.${idx}`);
                            } else {
                                initialValues[`${fieldKey}.${idx}`] = item;
                            }
                        });
                    } else if (typeof value === 'object' && value !== null) {
                        extractAllValues(value, fieldKey);
                    } else {
                        initialValues[fieldKey] = value;
                    }
                }
            };

            // Handle root-level arrays (multiple options to choose from)
            if (Array.isArray(parsed) && parsed.length > 0) {
                initialValues['_selectedVariation'] = 0;
                initialValues['_isRootArray'] = true;
                // Extract values from the first item
                extractAllValues(parsed[0], '0');
                console.log('📋 Root is array with', parsed.length, 'options');
            } else {
                // Handle nested arrays (like variations inside an object)
                const findAndHandleArrays = (obj: any, prefix = '') => {
                    for (const [key, value] of Object.entries(obj)) {
                        const fieldKey = prefix ? `${prefix}.${key}` : key;
                        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                            initialValues['_selectedVariation'] = 0;
                            initialValues['_variationsPath'] = fieldKey;
                            extractAllValues(value[0], `${fieldKey}.0`);
                        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            findAndHandleArrays(value, fieldKey);
                        }
                    }
                };
                extractAllValues(parsed, '');
                findAndHandleArrays(parsed, '');
            }

            setTemplateFormValues(initialValues);
            console.log('📋 Parsed template with initial values:', initialValues);
            return true;
        } catch (e: any) {
            setJsonParseError(e.message || 'Invalid JSON');
            setParsedTemplate(null);
            return false;
        }
    };

    // Check if a variable name suggests it's a product/hero/subject
    const isProductVariable = (varName: string): boolean => {
        const productKeywords = ['product', 'hero', 'subject', 'item', 'main', 'food', 'dish', 'object'];
        const lowerName = varName.toLowerCase();
        return productKeywords.some(kw => lowerName.includes(kw));
    };

    const handleSaveTemplate = async () => {
        if (!jsonTemplateInput.trim() || !templateName.trim()) return;
        const result = await saveJsonTemplate(templateName, jsonTemplateInput);
        if (result.success && result.template) {
            setSavedTemplates(prev => [...prev, result.template!]);
            setTemplateName('');
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        const result = await deleteJsonTemplate(id);
        if (result.success) {
            setSavedTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleLoadTemplate = (template: { id: string; name: string; json: string }) => {
        setJsonTemplateInput(template.json);
        parseJsonTemplate(template.json);
    };

    // Replace {{variables}} in a string with their values
    const replaceVariables = (text: string): string => {
        let result = text;
        for (const [varName, varValue] of Object.entries(variableValues)) {
            if (varValue) {
                const pattern = new RegExp(`\\{\\{${varName}\\}\\}`, 'gi');
                result = result.replace(pattern, varValue);
            }
        }
        return result;
    };

    const generatePromptFromTemplate = (): string => {
        if (!parsedTemplate) return '';

        // Deep clone the template so we can apply edits
        const cloneAndApplyEdits = (obj: any, prefix = ''): any => {
            if (Array.isArray(obj)) {
                return obj.map((item, idx) => cloneAndApplyEdits(item, prefix ? `${prefix}.${idx}` : String(idx)));
            } else if (typeof obj === 'object' && obj !== null) {
                const result: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    const fieldKey = prefix ? `${prefix}.${key}` : key;
                    // Check if user edited this field
                    if (templateFormValues.hasOwnProperty(fieldKey)) {
                        result[key] = templateFormValues[fieldKey];
                    } else if (typeof value === 'object' && value !== null) {
                        result[key] = cloneAndApplyEdits(value, fieldKey);
                    } else {
                        result[key] = value;
                    }
                }
                return result;
            }
            return obj;
        };

        // Apply user edits to the template
        const editedTemplate = cloneAndApplyEdits(parsedTemplate);

        // Return the full JSON as a string - this is what Gemini expects
        const jsonPrompt = JSON.stringify(editedTemplate, null, 2);
        console.log('📋 Sending full JSON template to Gemini:', jsonPrompt.substring(0, 500) + '...');

        return jsonPrompt;
    };

    // Render editable fields for a single JSON item
    const renderEditableFields = (obj: any, prefix = '', level = 0): React.JSX.Element[] => {
        const elements: React.JSX.Element[] = [];

        for (const [key, value] of Object.entries(obj)) {
            if (key === 'id' || key.startsWith('_')) continue;

            const fieldKey = prefix ? `${prefix}.${key}` : key;
            const displayLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            if (Array.isArray(value)) {
                // Array of actions/items - render each as a group
                elements.push(
                    <div key={fieldKey} className={`mb-4 ${level > 0 ? 'ml-4' : ''}`}>
                        <h5 className="text-xs text-[var(--color-yave-gold)] uppercase tracking-wider mb-2 font-bold">{displayLabel}</h5>
                        <div className="space-y-2">
                            {value.map((item, idx) => {
                                if (typeof item === 'object' && item !== null) {
                                    return (
                                        <div key={idx} className="p-3 bg-[#0a0a0a] border border-[#333] rounded-lg">
                                            <span className="text-[10px] text-gray-500 mb-2 block">Item {idx + 1}</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(item).map(([k, v]) => {
                                                    const itemKey = `${fieldKey}.${idx}.${k}`;
                                                    const itemLabel = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                    return (
                                                        <div key={itemKey}>
                                                            <label className="text-[10px] text-gray-500 block mb-1">{itemLabel}</label>
                                                            <input
                                                                type="text"
                                                                value={templateFormValues[itemKey] ?? v ?? ''}
                                                                onChange={(e) => setTemplateFormValues(prev => ({ ...prev, [itemKey]: e.target.value }))}
                                                                className="w-full bg-[#111] border border-[#333] rounded px-2 py-1 text-xs text-white focus:border-[var(--color-yave-gold)] focus:outline-none"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                );
            } else if (typeof value === 'object' && value !== null) {
                // Nested object - render as a section with its fields
                elements.push(
                    <div key={fieldKey} className={`mb-4 p-3 bg-[#0f0f0f] border border-[#333] rounded-lg ${level > 0 ? 'ml-4' : ''}`}>
                        <h5 className="text-xs text-[var(--color-yave-gold)] uppercase tracking-wider mb-3 font-bold">{displayLabel}</h5>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(value).map(([k, v]) => {
                                if (typeof v === 'object') return null; // Skip nested objects here
                                const nestedKey = `${fieldKey}.${k}`;
                                const nestedLabel = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                const isProduct = isProductVariable(k);
                                const allProducts = isProduct ? [
                                    ...customBottles.map(p => ({ ...p, type: 'Bottle' })),
                                    ...studioProducts.map(p => ({ ...p, type: 'Product' }))
                                ] : [];

                                return (
                                    <div key={nestedKey} className={isProduct && allProducts.length > 0 ? 'col-span-2' : ''}>
                                        <label className="text-[10px] text-gray-400 block mb-1">{nestedLabel}</label>
                                        <input
                                            type="text"
                                            value={templateFormValues[nestedKey] ?? v ?? ''}
                                            onChange={(e) => setTemplateFormValues(prev => ({ ...prev, [nestedKey]: e.target.value }))}
                                            className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-yave-gold)] focus:outline-none"
                                        />
                                        {isProduct && allProducts.length > 0 && (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                                {allProducts.slice(0, 6).map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setTemplateFormValues(prev => ({ ...prev, [nestedKey]: p.name }));
                                                            setVariableProductSelections(prev => ({ ...prev, [nestedKey]: { name: p.name, image: p.imagePath } }));
                                                        }}
                                                        className={`w-10 h-10 rounded border-2 overflow-hidden ${variableProductSelections[nestedKey]?.name === p.name ? 'border-[var(--color-yave-gold)]' : 'border-[#333]'}`}
                                                    >
                                                        {p.imagePath && <img src={p.imagePath.startsWith('/') ? `/api/download?path=${encodeURIComponent(p.imagePath)}` : p.imagePath} alt={p.name} className="w-full h-full object-cover" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else {
                // Simple value - render as input
                const isProduct = isProductVariable(key);
                elements.push(
                    <div key={fieldKey} className={`mb-3 ${level > 0 ? 'ml-4' : ''}`}>
                        <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">{displayLabel}</label>
                        <input
                            type="text"
                            value={templateFormValues[fieldKey] ?? value ?? ''}
                            onChange={(e) => setTemplateFormValues(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-yave-gold)] focus:outline-none"
                        />
                    </div>
                );
            }
        }

        return elements;
    };

    const renderTemplateForm = (obj: any, prefix = '', level = 0): React.JSX.Element[] => {
        const elements: React.JSX.Element[] = [];

        // Handle root-level array - show selection cards first
        if (Array.isArray(obj) && obj.length > 0) {
            const selectedIndex = templateFormValues['_selectedVariation'] ?? 0;

            // Selection cards
            elements.push(
                <div key="variation-selector" className="mb-6">
                    <h4 className="text-sm font-bold text-[var(--color-yave-gold)] uppercase tracking-wider mb-3">
                        Select Template ({obj.length} options)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {obj.map((item: any, idx: number) => {
                            const itemId = item.id || `option-${idx}`;
                            const itemTitle = item.id?.replace(/_/g, ' ') || item.subject?.product || item.name || `Option ${idx + 1}`;
                            const isSelected = selectedIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        // Re-extract values for the newly selected item
                                        const newValues: Record<string, any> = { '_selectedVariation': idx, '_isRootArray': true };
                                        const extractValues = (o: any, p: string) => {
                                            for (const [k, v] of Object.entries(o)) {
                                                if (k === 'id') continue;
                                                const fk = p ? `${p}.${k}` : k;
                                                if (Array.isArray(v)) {
                                                    v.forEach((item, i) => {
                                                        if (typeof item === 'object') extractValues(item, `${fk}.${i}`);
                                                        else newValues[`${fk}.${i}`] = item;
                                                    });
                                                } else if (typeof v === 'object' && v !== null) {
                                                    extractValues(v, fk);
                                                } else {
                                                    newValues[fk] = v;
                                                }
                                            }
                                        };
                                        extractValues(item, String(idx));
                                        setTemplateFormValues(newValues);
                                    }}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-[var(--color-yave-gold)] bg-[#1a1a1a]' : 'border-[#333] bg-[#111] hover:border-gray-500'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-[var(--color-yave-gold)]' : 'bg-[#333]'}`} />
                                        <span className={`font-bold text-sm ${isSelected ? 'text-[var(--color-yave-gold)]' : 'text-white'}`}>
                                            {itemTitle}
                                        </span>
                                    </div>
                                    {item.subject && <p className="text-xs text-gray-500 mt-1">{item.subject.brand} - {item.subject.product}</p>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Editable fields for selected item */}
                    <div className="border-t border-[#333] pt-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Edit Selected Template</h4>
                        {renderEditableFields(obj[selectedIndex], String(selectedIndex))}
                    </div>
                </div>
            );

            return elements;
        }

        // For non-array objects, use the original nested logic but improved
        for (const [key, value] of Object.entries(obj)) {
            const fieldKey = prefix ? `${prefix}.${key}` : key;
            const displayLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            // Handle arrays within objects (like variations)
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                const selectedIndex = templateFormValues['_selectedVariation'] ?? 0;
                elements.push(
                    <div key={fieldKey} className="mb-6">
                        <h4 className="text-sm font-bold text-[var(--color-yave-gold)] uppercase tracking-wider mb-3">
                            {displayLabel} ({value.length} options)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {value.map((item: any, idx: number) => {
                                const itemTitle = item.theme || item.name || item.title || item.id || `Option ${idx + 1}`;
                                const isSelected = selectedIndex === idx;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            const newValues: Record<string, any> = { ...templateFormValues, '_selectedVariation': idx };
                                            // Extract values from selected item
                                            const extractValues = (o: any, p: string) => {
                                                for (const [k, v] of Object.entries(o)) {
                                                    const fk = `${p}.${k}`;
                                                    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                                                        extractValues(v, fk);
                                                    } else if (!Array.isArray(v)) {
                                                        newValues[fk] = v;
                                                    }
                                                }
                                            };
                                            extractValues(item, `${fieldKey}.${idx}`);
                                            setTemplateFormValues(newValues);
                                        }}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-[var(--color-yave-gold)] bg-[#1a1a1a]' : 'border-[#333] bg-[#111] hover:border-gray-500'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-[var(--color-yave-gold)]' : 'bg-[#333]'}`} />
                                            <span className={`font-bold text-sm ${isSelected ? 'text-[var(--color-yave-gold)]' : 'text-white'}`}>{itemTitle}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {/* Show editable fields for selected variation */}
                        <div className="mt-4 p-4 bg-[#0a0a0a] border border-[#444] rounded-xl">
                            {renderEditableFields(value[selectedIndex], `${fieldKey}.${selectedIndex}`)}
                        </div>
                    </div>
                );
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Nested section
                elements.push(
                    <div key={fieldKey} className={`${level > 0 ? 'ml-4 pl-4 border-l border-[#333]' : ''} mb-4`}>
                        <h4 className="text-sm font-bold text-[var(--color-yave-gold)] uppercase tracking-wider mb-3">{displayLabel}</h4>
                        {renderEditableFields(value, fieldKey)}
                    </div>
                );
            } else if (!Array.isArray(value)) {
                // Input field
                const currentValue = templateFormValues[fieldKey] ?? value ?? '';
                const isLongText = typeof value === 'string' && value.length > 50;
                const isSubjectField = key.toLowerCase() === 'subject' || key.toLowerCase().includes('subject');

                // Special handling for subject field - show product selector
                if (isSubjectField) {
                    const allProducts = [
                        ...customBottles.map(p => ({ ...p, type: 'Bottle Asset' })),
                        ...studioProducts.map(p => ({ ...p, type: 'Studio Product' }))
                    ];

                    elements.push(
                        <div key={fieldKey} className="mb-4 p-4 bg-[#0a0a0a] border border-[#444] rounded-xl">
                            <label className="text-xs text-[var(--color-yave-gold)] uppercase tracking-wide block mb-3 font-bold">{displayLabel}</label>

                            {/* Custom text input */}
                            <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => {
                                    setTemplateFormValues(prev => ({ ...prev, [fieldKey]: e.target.value }));
                                    setSelectedSubjectProduct(null);
                                }}
                                placeholder="Type a custom subject..."
                                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-yave-gold)] focus:outline-none mb-3"
                            />

                            {/* Product selector */}
                            {allProducts.length > 0 && (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-px bg-[#333] flex-1" />
                                        <span className="text-[10px] text-gray-500 uppercase">Or select from your products</span>
                                        <div className="h-px bg-[#333] flex-1" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1">
                                        {allProducts.map((product) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => {
                                                    setTemplateFormValues(prev => ({ ...prev, [fieldKey]: product.name }));
                                                    setSelectedSubjectProduct({ name: product.name, image: product.imagePath });
                                                }}
                                                className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                                    selectedSubjectProduct?.name === product.name
                                                        ? 'border-[var(--color-yave-gold)] shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                                                        : 'border-[#333] hover:border-gray-500'
                                                }`}
                                            >
                                                {product.imagePath ? (
                                                    <img src={product.imagePath.startsWith('/') ? `/api/download?path=${encodeURIComponent(product.imagePath)}` : product.imagePath} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-[#222] flex items-center justify-center text-gray-500 text-xs">{product.name.slice(0, 2).toUpperCase()}</div>
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-0.5">
                                                    <span className="text-[8px] text-white truncate block">{product.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {selectedSubjectProduct && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            Using "{selectedSubjectProduct.name}" with reference image
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                } else {
                    elements.push(
                        <div key={fieldKey} className="mb-3">
                            <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">{displayLabel}</label>
                            {isLongText ? (
                                <textarea
                                    value={currentValue}
                                    onChange={(e) => setTemplateFormValues(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-2 text-sm text-white focus:border-[var(--color-yave-gold)] focus:outline-none resize-none"
                                    rows={3}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => setTemplateFormValues(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:border-[var(--color-yave-gold)] focus:outline-none"
                                />
                            )}
                        </div>
                    );
                }
            }
        }

        return elements;
    };

    // Aspect Ratio Data matching the "perfect" picker style
    const renderStepIntro = () => (
        <div className="h-full flex flex-col justify-center items-center pb-20">
            {/* Main Workflow Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
                <button
                    onClick={() => {
                        dispatch({ type: 'SET_MODE', value: 'tequila' });
                        setIsPresetFlow(false);
                        handleNext();
                    }}
                    className="group relative h-80 rounded-3xl border border-[#333] bg-[#111] hover:border-[var(--color-yave-gold)] transition-all overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/80" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-yave-gold)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-5xl mb-5 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110 block">🥃</span>
                        <h3 className="text-2xl font-black text-white mb-2 group-hover:text-[var(--color-yave-gold)] transition-colors uppercase italic tracking-tighter">Tequila Mode</h3>
                        <p className="text-gray-400 text-xs max-w-[200px] mx-auto leading-relaxed">Create stunning cocktail and bottle shots with customized recipes and garnishes.</p>
                    </div>
                </button>

                <button
                    onClick={() => {
                        dispatch({ type: 'SET_MODE', value: 'studio' });
                        setIsPresetFlow(false);
                        handleNext();
                    }}
                    className="group relative h-80 rounded-3xl border border-[#333] bg-[#111] hover:border-[var(--color-yave-gold)] transition-all overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/80" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-yave-gold)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-5xl mb-5 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110 block">📸</span>
                        <h3 className="text-2xl font-black text-white mb-2 group-hover:text-[var(--color-yave-gold)] transition-colors uppercase italic tracking-tighter">Studio Mode</h3>
                        <p className="text-gray-400 text-xs max-w-[200px] mx-auto leading-relaxed">Showcase generic products, cosmetics, or other items in a professional studio setting.</p>
                    </div>
                </button>
            </div>

            {/* FAST TRACK SECTION */}
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-[#222] flex-1" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center px-4">Or Fast Track (Preset Vibe)</span>
                    <div className="h-px bg-[#222] flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allPresets.map((p) => {
                        return (
                            <button
                                key={p.id}
                                onClick={() => handlePreset(p)}
                                className="relative bg-[#111] border border-[#222] hover:border-[var(--color-yave-gold)] rounded-xl p-4 flex items-center gap-4 text-left group transition-all hover:bg-[#161616]"
                            >
                                <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{p.emoji}</span>
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-[var(--color-yave-gold)] transition-colors">{p.title}</h4>
                                    <p className="text-xs text-gray-500">{p.subtitle}</p>
                                </div>

                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePreset(p.id);
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/80 rounded z-10"
                                    title="Delete Preset"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-500"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SEASONAL THEMES SECTION */}
            <div className="w-full max-w-5xl mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-[#222] flex-1" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center px-4">Or Apply Seasonal Theme</span>
                    <div className="h-px bg-[#222] flex-1" />
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 justify-center flex-wrap">
                    {SEASONAL_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => handleSeasonalPreset(preset)}
                            className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl bg-[#111] border border-[#222] hover:border-[var(--color-yave-gold)] transition-all min-w-[120px] group"
                            title={preset.description}
                        >
                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{preset.emoji}</span>
                            <span className="text-xs font-bold text-white group-hover:text-[var(--color-yave-gold)] transition-colors">{preset.name}</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colorScheme.primary }} />
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colorScheme.secondary }} />
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colorScheme.accent }} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* MY SAVED TEMPLATES SECTION */}
            {fullTemplates.length > 0 && (
                <div className="w-full max-w-5xl mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-[#222] flex-1" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center px-4">My Saved Templates</span>
                        <div className="h-px bg-[#222] flex-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {fullTemplates.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleLoadFullTemplate(t)}
                                className="relative bg-[#111] border border-[#222] hover:border-purple-500 rounded-xl p-4 flex items-center gap-4 text-left group transition-all hover:bg-[#161616]"
                            >
                                <span className="text-2xl">{t.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-purple-400 transition-colors truncate">{t.title}</h4>
                                    <p className="text-xs text-gray-500 truncate">{t.subtitle}</p>
                                </div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePreset(t.id);
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black/80 rounded z-10"
                                    title="Delete Template"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 hover:text-red-500"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const ASPECT_RATIOS = [
        { id: '1:1', label: '1:1', width: 24, height: 24 },
        { id: '9:16', label: '9:16', width: 18, height: 32 },
        { id: '16:9', label: '16:9', width: 32, height: 18 },
        { id: '4:5', label: '4:5', width: 20, height: 25 },
        { id: '5:4', label: '5:4', width: 25, height: 20 },
        { id: '1.91:1', label: '1.91:1', width: 32, height: 16 }, // Approx
        { id: '1:1.91', label: '1:1.91', width: 16, height: 32 }  // Approx
    ];

    const renderStepFormat = () => (
        <div className="h-full flex flex-col justify-center min-h-[50vh] pb-24">
            <div className="w-full flex justify-center pb-6">
                <div className="flex items-end gap-10">
                    {ASPECT_RATIOS.map((ratio) => {
                        const isSelected = state.selectedAspectRatios
                            ? state.selectedAspectRatios.includes(ratio.id)
                            : state.aspectRatio === ratio.id;
                        return (
                            <button
                                key={ratio.id}
                                onClick={() => { toggleAspectRatio(ratio.id);}}
                                className="group flex flex-col items-center gap-3 focus:outline-none"
                            >
                                <div
                                    className={`border-2 rounded transition-all duration-300 ${isSelected
                                        ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.4)] bg-[#1a1a1a]'
                                        : 'border-[#333] bg-[#111] group-hover:border-gray-500'
                                        }`}
                                    style={{
                                        width: `${ratio.width * 3.8}px`,
                                        height: `${ratio.height * 3.8}px`
                                    }}
                                />
                                <span className={`text-sm font-bold tracking-wider transition-colors ${isSelected ? 'text-[var(--color-yave-gold)]' : 'text-[#333] group-hover:text-gray-500'}`}>
                                    {ratio.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="text-center text-gray-500 text-xs uppercase tracking-widest font-bold mt-8 animate-pulse">
                Select Multiple Formats by Clicking
            </div>
        </div>
    );

    const renderStepCameraStyle = () => (
        <CameraSelector />
    );

    const renderStepShotAngle = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ANGLES.map(a => {
                    const isAssetActive = state.background.id && state.background.id.startsWith('asset-');
                    if (a.id === 'match-asset' && !isAssetActive) return null;
                    const isSelected = state.angle.id === a.id;
                    return (
                        <button
                            key={a.id}
                            onClick={() => { dispatch({ type: 'SET_ANGLE', value: a });}}
                            className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between group transition-all ${isSelected
                                ? 'bg-[#1a1a1a] border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                : 'bg-[#111] border-[#333] hover:border-gray-500 hover:bg-[#161616]'
                                }`}
                        >
                            <div className={`font-bold text-sm uppercase tracking-wider ${isSelected ? 'text-[var(--color-yave-gold)]' : 'text-gray-300'}`}>
                                {a.label}
                            </div>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-[var(--color-yave-gold)]" />}
                        </button>
                    )
                })}
            </div>
        </div>
    );

    const renderStepLiquid = () => (
        <div className="space-y-8">
            {/* Drink Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pt-2 pb-2 border-b border-[#222]">
                {state.drinks.map((drink, idx) => (
                    <div key={drink.id} className="relative group shrink-0">
                        <div className={`rounded-t-lg transition-all ${state.activeDrinkIndex === idx ? 'bg-[#222]' : 'hover:bg-[#1a1a1a]'}`}>
                            <button
                                onClick={() => setActiveDrink(idx)}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-all block w-full text-left ${state.activeDrinkIndex === idx
                                    ? 'text-[var(--color-yave-gold)] border-[var(--color-yave-gold)]'
                                    : 'text-gray-500 border-transparent hover:text-white'
                                    }`}
                            >
                                {drink.customRecipe || `Drink ${idx + 1}`}
                            </button>

                            {/* Drink Positioning Controls */}
                            {state.activeDrinkIndex === idx && (
                                <div className="p-3 border-x border-[#333] border-b border-[#333] rounded-b-lg mb-2 relative top-[2px] bg-[#1a1a1a] shadow-xl z-20 min-w-[200px]">
                                    <label className="text-[9px] text-gray-500 uppercase font-bold block mb-2">Position In Frame</label>
                                    <div className="space-y-2">
                                        <div className="flex gap-1">
                                            {BOTTLE_X_POSITIONS.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={(e) => { e.stopPropagation(); dispatch({ type: 'UPDATE_DRINK', index: idx, field: 'placementX', value: p.id }); }}
                                                    className={`flex-1 py-1 text-[10px] rounded border ${drink.placementX === p.id
                                                        ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] font-bold'
                                                        : 'bg-black text-gray-500 border-[#333] hover:bg-[#222]'}`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex gap-1">
                                            {BOTTLE_DEPTH_POSITIONS.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={(e) => { e.stopPropagation(); dispatch({ type: 'UPDATE_DRINK', index: idx, field: 'placementDepth', value: p.id }); }}
                                                    className={`flex-1 py-1 text-[10px] rounded border ${drink.placementDepth === p.id
                                                        ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] font-bold'
                                                        : 'bg-black text-gray-500 border-[#333] hover:bg-[#222]'}`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (state.drinks.length > 1) removeDrink(idx);
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#111] text-gray-400 hover:text-red-500 text-[10px] hidden group-hover:flex items-center justify-center border border-[#333] hover:border-red-500 transition-colors z-30"
                            title="Remove Drink"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={addDrink}
                    className="w-8 h-8 rounded-full border border-dashed border-[#444] text-gray-500 flex items-center justify-center hover:border-[var(--color-yave-gold)] hover:text-[var(--color-yave-gold)] transition-colors"
                    title="Add Another Drink"
                >
                    +
                </button>
            </div>

            {/* Cocktail Recipe / Base */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold">
                        Select Your Poison
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInspireMe}
                            disabled={isBottleOnly}
                            className="text-[10px] uppercase font-bold text-[var(--color-yave-gold)] border border-[var(--color-yave-gold)] px-3 py-1 rounded hover:bg-[var(--color-yave-gold)] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ✨ Inspire Me
                        </button>
                        <button
                            onClick={toggleBottleOnly}
                            className={`text-[10px] uppercase font-bold border px-3 py-1 rounded transition-colors ${isBottleOnly ? 'bg-white text-black border-white' : 'text-gray-400 border-gray-600 hover:text-white hover:border-white'}`}
                        >
                            Only Bottle
                        </button>
                    </div>
                </div>

                <div className={`space-y-4 transition-all duration-300 ${isBottleOnly ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    {/* Text Input for Recipe Name */}
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={state.drinks[state.activeDrinkIndex]?.customRecipe || ''}
                            onChange={(e) => dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'customRecipe', value: e.target.value })}
                            className="w-full bg-[#111] border border-[#333] text-white text-sm px-4 h-12 rounded-lg focus:border-[var(--color-yave-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--color-yave-gold)] transition-all placeholder:text-[#434343] font-medium"
                            placeholder='Recipe Name (e.g. "Spicy Pineapple Margarita")'
                            disabled={isBottleOnly}
                        />

                        {/* Visual Description + Mixologist */}
                        <div className="flex gap-3 items-stretch min-h-[3rem]">
                            <div className="relative flex-1 bg-[#111] border border-[#333] rounded-lg overflow-hidden group focus-within:border-[var(--color-yave-gold)] transition-colors">
                                <textarea
                                    value={state.drinks[state.activeDrinkIndex]?.visualDescription || ''}
                                    onChange={(e) => dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'visualDescription', value: e.target.value })}
                                    className="w-full h-full bg-transparent border-none text-white px-4 py-3.5 text-sm focus:ring-0 focus:outline-none transition-all placeholder:text-[#434343] font-medium resize-none overflow-hidden"
                                    placeholder="Visual Description (AI Guide)"
                                    rows={1}
                                    disabled={isBottleOnly}
                                />
                                {isDescribing && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-800 overflow-hidden">
                                        <div className="h-full bg-[var(--color-yave-gold)] animate-progress-indeterminate absolute" />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAutoDescribe}
                                disabled={isDescribing || !state.drinks[state.activeDrinkIndex]?.customRecipe || isBottleOnly}
                                className="px-6 bg-[var(--color-yave-gold)] hover:bg-[#b08d26] text-black font-bold rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
                                title="Auto-Describe visual look from recipe name"
                            >
                                {isDescribing ? 'Thinking...' : 'Mixologist'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Include Bottles Toggle */}
            <div className="mt-6 p-4 rounded-lg border border-[#333] bg-[#1a1a1a] flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="text-sm font-bold text-white mb-1">Add Bottles to Scene?</div>
                    <div className="text-xs text-gray-500">Pick specific tequila bottles to display next to your drink.</div>
                </div>
                <button
                    onClick={() => setIncludeExtraBottles(!includeExtraBottles)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out border border-[#444] ${includeExtraBottles ? 'bg-[var(--color-yave-gold)] border-[var(--color-yave-gold)]' : 'bg-[#111]'}`}
                >
                    <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 ${includeExtraBottles ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>

        </div>
    );

    const renderStepBottles = () => (
        <div className="space-y-8">
            {/* SKU Selector (Standard) */}
            <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-2">
                    SELECT BOTTLES (MULTIPLE)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {TEQUILA_SKUS.map((sku) => {
                        // Check if in activeBottles
                        const isSelected = state.activeBottles?.some(b => b.id === sku.id);
                        return (
                            <button
                                key={sku.id}
                                onClick={() => {
                                    // Toggle Logic
                                    if (isSelected) {
                                        dispatch({ type: 'REMOVE_BOTTLE', value: sku });
                                    } else {
                                        dispatch({ type: 'ADD_BOTTLE', value: sku });
                                    }
                                }}
                                className={`w-full px-4 py-3 rounded-lg border text-sm transition-all flex items-center gap-3 ${isSelected
                                    ? 'bg-[#1a1a1a] text-white border-[var(--color-yave-gold)] shadow-[0_0_10px_rgba(212,175,55,0.1)] font-bold'
                                    : 'bg-[#1a1a1a] text-gray-300 border-[#333] hover:border-gray-500'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[var(--color-yave-gold)] shadow-[0_0_5px_var(--color-yave-gold)]' : 'bg-[#444]'}`} />
                                <span>{sku.name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Custom Brands (Text Style) */}
            {customBottles.length > 0 && (
                <div>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-2">
                        CUSTOM BRANDS
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {customBottles.filter(isVisibleStrict).map((bottle) => {
                            const isSelected = state.activeBottles?.some(b => b.id === bottle.id);
                            return (
                                <button
                                    key={bottle.id}
                                    onClick={() => {
                                        if (isSelected) {
                                            dispatch({ type: 'REMOVE_BOTTLE', value: bottle });
                                        } else {
                                            dispatch({ type: 'ADD_BOTTLE', value: bottle });
                                        }
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg border text-sm transition-all flex items-center gap-3 ${isSelected
                                        ? 'border-[var(--color-yave-gold)] shadow-[0_0_10px_rgba(212,175,55,0.1)] font-bold bg-[#1a1a1a] text-white'
                                        : 'border-[#333] hover:border-gray-500 bg-[#1a1a1a] text-gray-300'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[var(--color-yave-gold)] shadow-[0_0_5px_var(--color-yave-gold)]' : 'bg-[#444]'}`} />
                                    <span className="truncate">{bottle.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ACTIVE BOTTLE CONFIGURATION */}
            {state.activeBottles.length > 0 && (

                <div className="bg-[#111] border border-[#222] rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-4 border-b border-[#333] pb-2">
                        BOTTLE PLACEMENT & DETAILS
                    </p>
                    <div className="space-y-4">
                        {state.activeBottles.map((bottle, idx) => (
                            <div key={`${bottle.id}-${idx}`} className="bg-black border border-[#333] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_5px_var(--color-yave-gold)]" />
                                        <span className="font-bold text-white text-sm">{bottle.name}</span>
                                    </div>
                                    <button
                                        onClick={() => dispatch({ type: 'REMOVE_BOTTLE', value: bottle })}
                                        className="text-xs text-red-500 hover:text-red-400 font-bold uppercase"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Horizontal Position */}
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Horizontal</label>
                                        <div className="flex gap-2">
                                            {BOTTLE_X_POSITIONS.map(p => {
                                                const isActive = bottle.placementX === p.id;
                                                return (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => dispatch({ type: 'UPDATE_BOTTLE_PLACEMENT', value: { id: bottle.id, x: p.id } })}
                                                        className={`flex-1 px-3 py-1.5 rounded text-xs transition-all border ${isActive
                                                            ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] font-bold'
                                                            : 'bg-[#222] text-gray-400 border-transparent hover:text-white hover:bg-[#333]'
                                                            }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Depth Position */}
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Depth</label>
                                        <div className="flex gap-2">
                                            {BOTTLE_DEPTH_POSITIONS.map(p => {
                                                const isActive = bottle.placementDepth === p.id;
                                                return (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => dispatch({ type: 'UPDATE_BOTTLE_PLACEMENT', value: { id: bottle.id, depth: p.id } })}
                                                        className={`flex-1 px-3 py-1.5 rounded text-xs transition-all border ${isActive
                                                            ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] font-bold'
                                                            : 'bg-[#222] text-gray-400 border-transparent hover:text-white hover:bg-[#333]'
                                                            }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
            }
        </div >
    );



    const renderStepVessel = () => (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-[#333] flex-grow" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-yave-silver)]">
                    Glassware Reference
                </h2>
                <div className="h-px bg-[#333] flex-grow" />
            </div>
            <GlasswareGrid />
        </div>
    );

    const renderStepIce = () => (
        <div className="space-y-8">
            {state.drinks.length > 1 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-[#333]">
                    {state.drinks.map((d, i) => (
                        <button
                            key={d.id}
                            onClick={() => setActiveDrink(i)}
                            className={`text-xs px-4 py-3 rounded-t-lg border-b-2 transition-all whitespace-nowrap ${state.activeDrinkIndex === i ? 'border-[var(--color-yave-gold)] text-[var(--color-yave-gold)] font-bold bg-white/5' : 'border-transparent text-gray-500 hover:text-white'}`}
                        >
                            {d.customRecipe || `Cocktail ${i + 1}`}
                        </button>
                    ))}
                </div>
            )}
            {/* ICE SECTION - Matching 'The Chill' styling */}
            <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    The Chill (Ice)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {ICE_OPTIONS.map((i) => (
                        <div key={i.id} className="relative">
                            <button
                                onClick={() => dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'ice', value: i })}
                                className={`w-full h-16 rounded-lg px-4 flex items-center justify-between border-2 transition-all ${state.drinks[state.activeDrinkIndex]?.ice.id === i.id
                                    ? 'bg-[#1a1a1a] border-[var(--color-yave-gold)] text-[var(--color-yave-gold)]'
                                    : 'bg-transparent border-[#333] text-gray-400 hover:border-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <span className="text-sm font-bold">{i.name}</span>
                                {state.drinks[state.activeDrinkIndex]?.ice.id === i.id && <span className="text-lg">❄️</span>}
                            </button>
                            {/* Quantity Dropdown */}
                            {state.drinks[state.activeDrinkIndex]?.ice.id === i.id && i.id !== 'none' && (
                                <div className="absolute top-1/2 right-12 -translate-y-1/2">
                                    <select
                                        value={state.drinks[state.activeDrinkIndex]?.iceQuantity || 'Many'} // Default to Many if undefined
                                        onChange={(e) => dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'iceQuantity', value: e.target.value })}
                                        className="bg-[#111] text-gray-300 text-[10px] px-2 py-1 rounded border border-[#444] focus:border-[var(--color-yave-gold)] focus:outline-none mr-2 appearance-none text-center cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="One">One</option>
                                        <option value="Two">Two</option>
                                        <option value="Three">Three</option>
                                        <option value="Many">Many</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStepGarnish = () => (
        <div className="space-y-8">
            {state.drinks.length > 1 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-[#333]">
                    {state.drinks.map((d, i) => (
                        <button
                            key={d.id}
                            onClick={() => setActiveDrink(i)}
                            className={`text-xs px-4 py-3 rounded-t-lg border-b-2 transition-all whitespace-nowrap ${state.activeDrinkIndex === i ? 'border-[var(--color-yave-gold)] text-[var(--color-yave-gold)] font-bold bg-white/5' : 'border-transparent text-gray-500 hover:text-white'}`}
                        >
                            {d.customRecipe || `Cocktail ${i + 1}`}
                        </button>
                    ))}
                </div>
            )}
            {/* GARNISH SECTION - Matching 'Finishing Touch' styling */}
            <div>
                <div className="flex items-end justify-between mb-3">
                    <label className="text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold">
                        Finishing Touch (Garnish)
                    </label>
                    <div className="text-right text-xs space-y-1">
                        <div className="text-gray-500 font-medium tracking-wide">
                            Cocktail: <span className="text-white font-bold">{state.drinks[state.activeDrinkIndex]?.customRecipe || 'Current Cocktail'}</span>
                        </div>
                        <div className="text-gray-500 font-medium tracking-wide">
                            Glassware: <span className="text-white font-bold">{state.drinks[state.activeDrinkIndex]?.glassware?.name || 'Standard'}</span>
                        </div>
                        <div className="text-gray-500 font-medium tracking-wide">
                            Ice: <span className="text-white font-bold">{state.drinks[state.activeDrinkIndex]?.ice?.name || 'None'}</span>
                        </div>
                    </div>
                </div>

                {/* Selected Garnishes List */}
                {state.drinks[state.activeDrinkIndex]?.garnishes.length > 0 && (
                    <div className="space-y-3 mb-6 bg-[#111] p-4 rounded-xl border border-[#222]">
                        <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Selected Garnishes & Placement</h4>
                        {state.drinks[state.activeDrinkIndex].garnishes.map((g: any) => (
                            <div key={g.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="flex-1 text-sm font-medium text-white">{g.name}</div>
                                <select // Quick placement selector
                                    value={g.placement}
                                    onChange={(e) => {
                                        const updatedGarnishes = state.drinks[state.activeDrinkIndex].garnishes.map((item: any) =>
                                            item.id === g.id ? { ...item, placement: e.target.value } : item
                                        );
                                        dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'garnishes', value: updatedGarnishes });
                                    }}
                                    className="bg-[#222] text-gray-300 text-xs px-2 py-1.5 rounded border border-[#444] focus:border-[var(--color-yave-gold)] focus:outline-none"
                                >
                                    {['rim', 'in-glass', 'side', 'floating', 'around', 'scattered'].map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <button
                                    onClick={() => {
                                        const newGarnishes = state.drinks[state.activeDrinkIndex].garnishes.filter((x: any) => x.id !== g.id);
                                        dispatch({ type: 'UPDATE_DRINK', index: state.activeDrinkIndex, field: 'garnishes', value: newGarnishes });
                                    }}
                                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                >
                                    <span className="text-xs">✕</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Garnish & AI Suggest Buttons */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => {
                            setShowGarnishModal(true);
                            setActiveSection(null);
                            setSelectedGarnishToAdd(null);
                            setGarnishSearch('');
                        }}
                        className="flex-1 py-4 rounded-xl border-2 border-dashed border-[#333] text-gray-400 font-bold uppercase tracking-widest text-xs hover:border-[var(--color-yave-gold)] hover:text-[var(--color-yave-gold)] transition-all flex items-center justify-center gap-2 group"
                    >
                        <span className="inline-flex w-6 h-6 rounded-full bg-[#222] text-gray-400 group-hover:bg-[var(--color-yave-gold)] group-hover:text-black items-center justify-center transition-colors">+</span>
                        Add Garnish
                    </button>
                    <button
                        onClick={handleAutoSuggestGarnishes}
                        disabled={isSuggestingGarnishes || !state.drinks[state.activeDrinkIndex]?.customRecipe}
                        className="py-4 px-6 rounded-xl border-2 border-[#333] text-gray-400 font-bold uppercase tracking-widest text-xs hover:border-purple-500 hover:text-purple-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#333] disabled:hover:text-gray-400"
                        title={!state.drinks[state.activeDrinkIndex]?.customRecipe ? 'Enter a recipe name first' : 'AI will suggest garnishes based on your recipe'}
                    >
                        <span className="inline-flex w-6 h-6 rounded-full bg-[#222] text-gray-400 group-hover:bg-purple-500 group-hover:text-white items-center justify-center transition-colors group-disabled:group-hover:bg-[#222] group-disabled:group-hover:text-gray-400">✨</span>
                        {isSuggestingGarnishes ? 'Suggesting...' : 'AI Suggest'}
                    </button>
                </div>
            </div>

            {/* Garnish Modal Logic (Hidden unless active) */}
            {
                showGarnishModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGarnishModal(false)}>
                        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222]">
                                <h3 className="text-xl font-bold text-white">
                                    {selectedGarnishToAdd ? `Place ${selectedGarnishToAdd.name}` : (activeSection ? activeSection : 'Select Garnish Category')}
                                </h3>
                                <button onClick={() => setShowGarnishModal(false)} className="text-gray-500 hover:text-white">✕</button>
                            </div>

                            {/* Search Input (Before Results) */}
                            {!selectedGarnishToAdd && (
                                <div className="mb-4 relative">
                                    <input
                                        type="text"
                                        placeholder="Search garnishes..."
                                        value={garnishSearch}
                                        onChange={(e) => setGarnishSearch(e.target.value)}
                                        // Auto-focus if opening modal? Maybe not, categories are useful.
                                        className="w-full bg-[#080808] border border-[#333] text-white rounded-lg p-3 pl-10 focus:border-[var(--color-yave-gold)] focus:outline-none"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                                </div>
                            )}

                            <div className="overflow-y-auto custom-scrollbar p-1">

                                {/* SEARCH RESULTS MODE */}
                                {garnishSearch && !selectedGarnishToAdd && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {(() => {
                                            const results = GARNISHES.filter(g =>
                                                g.name.toLowerCase().includes(garnishSearch.toLowerCase()) ||
                                                (g.section && g.section.toLowerCase().includes(garnishSearch.toLowerCase()))
                                            ).sort((a, b) => a.name.localeCompare(b.name));
                                            if (results.length === 0) return <p className="col-span-2 text-gray-500 text-center py-4">No garnishes found.</p>;
                                            return results.map(g => (
                                                <button key={g.id} onClick={() => setSelectedGarnishToAdd(g)} className="px-4 py-3 rounded-lg bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222] text-sm font-medium text-left border border-transparent hover:border-[var(--color-yave-gold)] transition-all">
                                                    <div className="flex justify-between items-center">
                                                        <span>{g.name}</span>
                                                        <span className="text-[10px] text-gray-600 bg-[#111] px-1 rounded">{g.section}</span>
                                                    </div>
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                )}

                                {/* Level 1: Sections (Only if NOT searching) */}
                                {!activeSection && !selectedGarnishToAdd && !garnishSearch && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Array.from(new Set(GARNISHES.map(g => g.section))).sort().map((section) => (
                                            <button key={section} onClick={() => setActiveSection(section)} className="min-h-[80px] p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] transition-all flex items-center justify-center text-center group h-full">
                                                <span className="text-sm font-bold text-white leading-tight group-hover:text-[var(--color-yave-gold)] transition-colors">{section}</span>
                                            </button>
                                        ))}
                                        {/* Custom Option */}
                                        <button onClick={() => setActiveSection('Custom')} className="min-h-[80px] p-4 rounded-xl bg-[#1a1a1a] border border-[#333] border-dashed hover:border-[var(--color-yave-gold)] hover:bg-[#222] transition-all flex items-center justify-center text-center group h-full">
                                            <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">+ Custom</span>
                                        </button>
                                    </div>
                                )}
                                {/* Level 2: Items (Only if NOT searching) */}
                                {activeSection && !selectedGarnishToAdd && !garnishSearch && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {activeSection === 'Custom' ? (
                                            <div className="space-y-4 p-4 bg-[#111] rounded-xl border border-[#333]">
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Garnish Name</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={customGarnishInput}
                                                    onChange={(e) => setCustomGarnishInput(e.target.value)}
                                                    placeholder="e.g. Flaming Lime Peel, Dehydrated Dragonfruit..."
                                                    className="w-full bg-[#080808] border border-[#333] p-3 text-white rounded-lg focus:outline-none focus:border-[var(--color-yave-gold)]"
                                                />
                                                <button
                                                    disabled={!customGarnishInput.trim()}
                                                    onClick={() => setSelectedGarnishToAdd({ id: `custom-${customGarnishInput}`, name: customGarnishInput, section: 'Custom' })}
                                                    className="w-full py-3 bg-[var(--color-yave-gold)] text-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b08d26] transition-colors"
                                                >
                                                    Continue
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="col-span-2 mb-2">
                                                    <button onClick={() => setActiveSection(null)} className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mb-2">
                                                        ← Back to Categories
                                                    </button>
                                                </div>
                                                {GARNISHES.filter(g => g.section === activeSection).sort((a, b) => a.name.localeCompare(b.name)).map(g => (
                                                    <button key={g.id} onClick={() => setSelectedGarnishToAdd(g)} className="px-4 py-3 rounded-lg bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222] text-sm font-medium text-left border border-transparent hover:border-[var(--color-yave-gold)] transition-all">
                                                        {g.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Level 3: Placement */}
                                {selectedGarnishToAdd && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {['rim', 'in-glass', 'side', 'floating', 'around', 'scattered'].map(pid => (
                                                <button key={pid} onClick={() => handleGarnishSelection(selectedGarnishToAdd, pid)} className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] transition-all text-left">
                                                    <span className="block text-sm font-bold text-white capitalize mb-1">{pid.replace('-', ' ')}</span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {pid === 'rim' ? 'Perched on the edge' :
                                                            pid === 'floating' ? 'Resting on the liquid' :
                                                                pid === 'in-glass' ? 'Inside the drink' : 'Placed decoratively'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Toothpick Option */}
                                        <div className="pt-4 border-t border-[#333] mt-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <input
                                                    type="checkbox"
                                                    id="use-pick"
                                                    checked={toothpickMode}
                                                    onChange={(e) => setToothpickMode(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-600 bg-[#222] text-[var(--color-yave-gold)] focus:ring-[var(--color-yave-gold)]"
                                                />
                                                <label htmlFor="use-pick" className="text-sm font-bold text-white select-none cursor-pointer">Use Cocktail Pick / Toothpick?</label>
                                            </div>

                                            {toothpickMode && (
                                                <div className="pl-7 grid grid-cols-3 gap-2 animate-in slide-in-from-top-2">
                                                    {['Wood', 'Metal', 'Decorative'].map(style => (
                                                        <button
                                                            key={style}
                                                            onClick={() => setToothpickStyle(style as any)}
                                                            className={`px-3 py-2 rounded border text-xs font-bold transition-all ${toothpickStyle === style
                                                                ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)]'
                                                                : 'bg-[#111] text-gray-400 border-[#333] hover:border-gray-500'}`}
                                                        >
                                                            {style}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );

    const renderStepYourScene = () => (
        <div className="space-y-8">
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-[#333] flex-grow" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-yave-silver)]">
                        Your Scene (Photo Shoot Assets)
                    </h2>
                    <div className="h-px bg-[#333] flex-grow" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* None Option */}
                    <button
                        onClick={() => {
                            dispatch({ type: 'SET_BACKGROUND', value: { id: '', name: 'None', type: 'solid' } });
                            setReferenceImage(null);
                        }}
                        className={`aspect-video rounded-lg border-2 flex items-center justify-center transition-all ${!state.background?.id || !state.background.id.startsWith('asset-')
                            ? 'border-[var(--color-yave-gold)] bg-[#1a1a1a] text-white'
                            : 'border-[#333] hover:border-gray-500 text-gray-500'
                            }`}
                    >
                        <span className="text-xs font-bold uppercase">None / Custom</span>
                    </button>

                    {photoShootAssets.filter(isVisible).map((asset: any) => {
                        const isSelected = state.background?.id === `asset-${asset.id}`;
                        return (
                            <button
                                key={asset.id}
                                onClick={() => {
                                    dispatch({ type: 'SET_BACKGROUND', value: { id: `asset-${asset.id}`, name: asset.name, type: 'image', texturePath: asset.imagePath } });
                                    setReferenceImage(asset.imagePath); // Auto-set ref image
                                }}
                                className={`relative aspect-video rounded-lg border-2 overflow-hidden group transition-all ${isSelected
                                    ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                                    : 'border-[#333] hover:border-gray-500'
                                    }`}
                            >
                                <Image
                                    src={`/api/download?path=${encodeURIComponent(asset.imagePath)}`}
                                    unoptimized
                                    alt={asset.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-[var(--color-yave-gold)] flex items-center justify-center">
                                            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate block">
                                        {asset.name}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // --- Props Step ---
    // --- Props Step ---
    const renderStepProps = () => (
        <div className="flex flex-col h-full gap-4">
            {/* TOP: PROP BUILDER */}
            <div className="bg-[#111] border border-[#222] rounded-xl flex-1 flex flex-col overflow-hidden relative">
                {/* Header / Breadcrumbs */}
                <div className="p-4 border-b border-[#222] flex flex-col gap-3 bg-[#0a0a0a]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            {propToAdd ? `Playing with: ${propToAdd.name}` : (activePropSection ? activePropSection : 'Select Category')}
                        </h3>
                        {(activePropSection || propToAdd || propSearch) && (
                            <button
                                onClick={() => {
                                    if (showColorInput) {
                                        setShowColorInput(false);
                                    } else if (showCustomPlacementInput) {
                                        setShowCustomPlacementInput(false);
                                    } else if (propToAdd) {
                                        setPropToAdd(null);
                                        setShowCustomPlacementInput(false);
                                        setCustomPropColor('');
                                        setShowColorInput(false);
                                    } else if (propSearch) {
                                        setPropSearch('');
                                    } else {
                                        setActivePropSection(null);
                                    }
                                }}
                                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                            >
                                ← Back
                            </button>
                        )}
                    </div>

                    {/* Search (Hide if drilling deep) */}
                    {!propToAdd && !showCustomPlacementInput && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search props..."
                                value={propSearch}
                                onChange={(e) => setPropSearch(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] text-white text-xs rounded-lg p-2 pl-8 focus:border-[var(--color-yave-gold)] focus:outline-none"
                            />
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {/* SEARCH RESULTS */}
                    {propSearch ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {PROPS.filter(p => p.name.toLowerCase().includes(propSearch.toLowerCase())).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setPropToAdd(p);
                                        setPropSearch('');
                                        if (p.requiresColor) setShowColorInput(true);
                                        else setShowDetailsInput(true);
                                    }}
                                    className="px-4 py-3 rounded-lg bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222] text-sm font-medium text-left border border-transparent hover:border-[var(--color-yave-gold)] transition-all flex justify-between"
                                >
                                    <span>{p.name}</span>
                                    <span className="text-[10px] bg-[#111] px-2 py-0.5 rounded text-gray-500">{p.section}</span>
                                </button>
                            ))}
                            {PROPS.filter(p => p.name.toLowerCase().includes(propSearch.toLowerCase())).length === 0 && (
                                <div className="text-center text-gray-500 py-8">No props found.</div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* 1. SECTIONS */}
                            {!activePropSection && !propToAdd && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {Array.from(new Set(PROPS.map(p => p.section))).sort().map(section => (
                                        <button
                                            key={section}
                                            onClick={() => setActivePropSection(section)}
                                            className="p-6 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] transition-all text-left group min-h-[100px] flex flex-col justify-end"
                                        >
                                            <span className="text-lg font-bold text-white group-hover:text-[var(--color-yave-gold)]">{section.split(' ')[0]}</span>
                                            <span className="text-xs text-gray-500 mt-1">{section.split(' ').slice(1).join(' ')}</span>
                                        </button>
                                    ))}
                                    {/* Custom Prop Button */}
                                    <button
                                        onClick={() => setActivePropSection('Custom')}
                                        className="p-6 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] transition-all text-left group min-h-[100px] flex flex-col justify-end"
                                    >
                                        <span className="text-lg font-bold text-white group-hover:text-[var(--color-yave-gold)]">✨ Custom</span>
                                        <span className="text-xs text-gray-500 mt-1">Create your own</span>
                                    </button>
                                </div>
                            )}

                            {/* 2. ITEMS */}
                            {activePropSection && !propToAdd && (
                                activePropSection === 'Custom' ? (
                                    <div className="max-w-md mx-auto space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        <label className="block text-sm font-bold text-gray-400">What prop are you adding?</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="e.g. Floating Lime Slice"
                                            value={customPropName}
                                            onChange={(e) => setCustomPropName(e.target.value)}
                                            className="w-full bg-black border border-[#333] p-4 rounded-xl text-white focus:border-[var(--color-yave-gold)] outline-none"
                                        />
                                        <button
                                            disabled={!customPropName.trim()}
                                            onClick={() => {
                                                setPropToAdd({ id: `custom-${Date.now()}`, name: customPropName, value: customPropName, section: 'Custom' });
                                                setCustomPropName('');
                                            }}
                                            className="w-full bg-[var(--color-yave-gold)] text-black font-bold py-3 rounded-xl hover:bg-[#b08d26] disabled:opacity-50"
                                        >
                                            Next: Placement →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 animate-in slide-in-from-right-4 duration-300">
                                        {PROPS.filter(p => p.section === activePropSection).map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setPropToAdd(p); if (p.requiresColor) setShowColorInput(true); else setShowDetailsInput(true); }}
                                                className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] text-left transition-all group"
                                            >
                                                <span className="block font-bold text-white group-hover:text-white">{p.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )
                            )}

                            {/* 3. COLOR / DETAILS / PLACEMENT */}
                            {propToAdd && (
                                showColorInput ? (
                                    <div className="max-w-md mx-auto space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        <label className="block text-sm font-bold text-gray-400">What color should the {propToAdd.name} be?</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="e.g. Red, Neon Blue, Dark..."
                                            value={customPropColor}
                                            onChange={(e) => setCustomPropColor(e.target.value)}
                                            className="w-full bg-black border border-[#333] p-4 rounded-xl text-white focus:border-[var(--color-yave-gold)] outline-none"
                                        />
                                        <button
                                            onClick={() => { setShowColorInput(false); setShowDetailsInput(true); }}
                                            className="w-full bg-[#222] text-gray-300 font-bold py-3 rounded-xl hover:bg-[#333] hover:text-white transition-colors border border-[#333] hover:border-[var(--color-yave-gold)]"
                                        >
                                            {customPropColor ? 'Next: Details →' : 'Skip Color → Details'}
                                        </button>
                                    </div>
                                ) : showDetailsInput ? (
                                    <div className="max-w-md mx-auto space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        <label className="block text-sm font-bold text-gray-400">Add details for the {propToAdd.name} <span className="text-gray-500">(optional)</span></label>
                                        <textarea
                                            autoFocus
                                            placeholder="e.g. slightly melted, glistening with condensation, cracked and weathered..."
                                            value={propDetails}
                                            onChange={(e) => setPropDetails(e.target.value)}
                                            rows={3}
                                            className="w-full bg-black border border-[#333] p-4 rounded-xl text-white focus:border-[var(--color-yave-gold)] outline-none resize-none"
                                        />
                                        <button
                                            onClick={() => setShowDetailsInput(false)}
                                            className="w-full bg-[#222] text-gray-300 font-bold py-3 rounded-xl hover:bg-[#333] hover:text-white transition-colors border border-[#333] hover:border-[var(--color-yave-gold)]"
                                        >
                                            {propDetails ? 'Next: Positioning →' : 'Skip Details → Positioning'}
                                        </button>
                                    </div>
                                ) : (
                                    showCustomPlacementInput ? (
                                        <div className="max-w-md mx-auto space-y-4 animate-in slide-in-from-right-4 duration-300">
                                            <label className="block text-sm font-bold text-gray-400">Where is it placed?</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="e.g. hovering aggressively"
                                                value={customPlacement}
                                                onChange={(e) => setCustomPlacement(e.target.value)}
                                                className="w-full bg-black border border-[#333] p-4 rounded-xl text-white focus:border-[var(--color-yave-gold)] outline-none"
                                            />
                                            <button
                                                disabled={!customPlacement.trim()}
                                                onClick={() => {
                                                    dispatch({ type: 'ADD_PROP', value: { ...propToAdd, placement: customPlacement, placementValue: customPlacement, quantity: 1, color: customPropColor, details: propDetails } });
                                                    setPropToAdd(null);
                                                    setActivePropSection(null);
                                                    setShowCustomPlacementInput(false);
                                                    setCustomPlacement('');
                                                    setCustomPropColor('');
                                                    setPropDetails('');
                                                    setShowColorInput(false);
                                                    setShowDetailsInput(false);
                                                }}
                                                className="w-full bg-[var(--color-yave-gold)] text-black font-bold py-3 rounded-xl hover:bg-[#b08d26] disabled:opacity-50"
                                            >
                                                Add to Scene
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                            <div className="p-4 bg-[var(--color-yave-gold)]/10 border border-[var(--color-yave-gold)] rounded-xl text-center">
                                                <span className="text-[var(--color-yave-gold)] font-bold">Positioning:</span> <span className="text-white">Where should the {propToAdd.name} go?</span>
                                                {customPropColor && <p className="text-xs text-gray-400 mt-1">Color: {customPropColor}</p>}
                                                {propDetails && <p className="text-xs text-gray-400 mt-1">Details: {propDetails}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {PROP_PLACEMENTS.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => {
                                                            dispatch({ type: 'ADD_PROP', value: { ...propToAdd, placement: p.id, placementValue: p.value, quantity: 1, color: customPropColor, details: propDetails } });
                                                            setPropToAdd(null);
                                                            setActivePropSection(null);
                                                            setCustomPropColor('');
                                                            setPropDetails('');
                                                            setShowColorInput(false);
                                                            setShowDetailsInput(false);
                                                        }}
                                                        className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] text-left transition-all group"
                                                    >
                                                        <span className="block font-bold text-white group-hover:text-[var(--color-yave-gold)] mb-1">{p.label}</span>
                                                        <span className="text-xs text-gray-500 line-clamp-2">"{p.value}..."</span>
                                                    </button>
                                                ))}
                                                {/* Custom Placement */}
                                                <button
                                                    onClick={() => setShowCustomPlacementInput(true)}
                                                    className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] text-left transition-all group"
                                                >
                                                    <span className="block font-bold text-white group-hover:text-[var(--color-yave-gold)]">Custom Position</span>
                                                    <span className="text-xs text-gray-500">Manual Entry</span>
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* BOTTOM: ACTIVE LIST */}
            {state.props.length > 0 && (
                <div className="shrink-0 bg-[#111] border border-[#222] rounded-xl p-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-[#666] font-bold mb-3">Active Props</h4>
                    <div className="flex flex-wrap gap-2">
                        {state.props.map(p => (
                            <div key={p.id} className="flex items-center gap-2 bg-black border border-[#333] px-3 py-2 rounded-lg animate-in fade-in zoom-in duration-300">
                                <span className="text-sm font-bold text-white">{p.color ? `${p.color} ` : ''}{p.name}</span>
                                <span className="text-xs text-gray-500 border-l border-[#333] pl-2">{p.placementValue || p.placement}</span>
                                {p.details && <span className="text-xs text-gray-600 border-l border-[#333] pl-2 italic max-w-[150px] truncate" title={p.details}>{p.details}</span>}
                                <button
                                    onClick={() => dispatch({ type: 'REMOVE_PROP', value: p.id })}
                                    className="ml-2 text-gray-500 hover:text-red-500 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );


    const renderStepSetScene = () => (
        <div className="space-y-12">

            {/* Inspiration Reference (MOVED TO TOP) */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-[#333] flex-grow" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-yave-silver)]">
                        Inspiration (Reference Image)
                    </h2>
                    <div className="h-px bg-[#333] flex-grow" />
                </div>
                <div className="border border-dashed border-[#444] rounded-xl p-8 flex flex-col items-center justify-center bg-[#111] hover:bg-[#161616] transition-colors relative group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setReferenceImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {state.referenceImage ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                            <Image src={state.referenceImage} alt="Ref" fill className="object-cover" />
                            <button
                                onClick={(e) => { e.stopPropagation(); setReferenceImage(null); }}
                                className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 z-20"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <span className="text-2xl text-gray-400">+</span>
                            </div>
                            <span className="text-sm font-medium text-gray-400">Upload Reference Image</span>
                            <span className="text-xs text-gray-600 mt-1">AI will use this for composition & lighting</span>
                        </>
                    )}
                </div>
            </div>

            {/* Atmosphere (Backgrounds) */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-[#333] flex-grow" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-yave-silver)]">
                        Atmosphere (Background)
                    </h2>
                    <div className="h-px bg-[#333] flex-grow" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => dispatch({ type: 'SET_BACKGROUND', value: { id: '', name: 'None', type: 'solid' } })}
                        className={`h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${!state.background.id
                            ? 'border-[var(--color-yave-gold)] bg-[#1a1a1a] text-white'
                            : 'border-[#333] text-gray-500 hover:border-gray-500'
                            }`}
                    >
                        <span className="text-xs font-bold">NONE</span>
                        <span className="text-[10px]">Solid Color</span>
                    </button>
                    {BACKGROUNDS.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => dispatch({ type: 'SET_BACKGROUND', value: bg })}
                            className={`relative h-24 rounded-lg border-2 overflow-hidden transition-all ${state.background.id === bg.id
                                ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                : 'border-[#333] hover:border-gray-500'
                                }`}
                        >
                            {bg.texturePath ? (
                                <Image src={bg.texturePath} alt={bg.name} fill className="object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-[#222]" />
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                            <span className="relative z-10 text-xs font-bold text-white uppercase tracking-wider pl-2 pb-1 absolute bottom-0">{bg.name}</span>
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Custom Atmosphere Description..."
                    onChange={(e) => dispatch({ type: 'SET_BACKGROUND', value: { id: 'custom', name: 'Custom', prompt: e.target.value } })}
                    className="w-full mt-3 bg-[#111] border border-[#333] text-xs px-3 py-2 rounded focus:border-[var(--color-yave-gold)] focus:outline-none text-gray-300"
                />
            </div>

            {/* Countertops */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-[#333] flex-grow" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-yave-silver)]">
                        Surface (Countertop)
                    </h2>
                    <div className="h-px bg-[#333] flex-grow" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {COUNTERTOPS.map((ct) => (
                        <button
                            key={ct.id}
                            onClick={() => dispatch({ type: 'SET_COUNTERTOP', value: ct })}
                            className={`relative h-20 rounded-lg border-2 flex items-center justify-center transition-all ${state.countertop.id === ct.id
                                ? 'border-[var(--color-yave-gold)] bg-[#1a1a1a]'
                                : 'border-[#333] bg-[#000] hover:border-gray-500'
                                }`}
                        >
                            {ct.texturePath ? (
                                <Image src={ct.texturePath} alt={ct.name} fill className="object-cover opacity-60" />
                            ) : null}
                            <span className={`relative z-10 text-xs font-bold uppercase ${state.countertop.id === ct.id ? 'text-[var(--color-yave-gold)]' : 'text-gray-400'}`}>{ct.name}</span>
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Custom Surface Description..."
                    onChange={(e) => dispatch({ type: 'SET_COUNTERTOP', value: { id: 'custom', name: 'Custom', prompt: e.target.value } })}
                    className="w-full mt-3 bg-[#111] border border-[#333] text-xs px-3 py-2 rounded focus:border-[var(--color-yave-gold)] focus:outline-none text-gray-300"
                />
            </div>

            {/* Surface Placement (For Bottles/Products) */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mt-4">
                <label className="text-[10px] text-[var(--color-yave-gold)] uppercase font-bold tracking-wider mb-2 block">
                    Product Placement on Surface
                </label>
                <div className="flex gap-2">
                    {SURFACE_PLACEMENTS.map(sp => {
                        const isSelected = state.surfacePlacement === sp.id;
                        return (
                            <button
                                key={sp.id}
                                onClick={() => dispatch({ type: 'UPDATE_SURFACE_PLACEMENT', value: sp.id })}
                                className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${isSelected
                                    ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)]'
                                    : 'bg-black text-gray-400 border-[#333] hover:border-gray-500'
                                    }`}
                            >
                                {sp.label}
                            </button>
                        )
                    })}
                </div>
            </div>
            {/* Action / Motion (Multi-Item) */}
            <div>
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-[#333] flex-grow" />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-yave-silver)]">
                        Action / Motion
                    </h2>
                    <div className="h-px bg-[#333] flex-grow" />
                </div>

                <div className="space-y-4">
                    {/* List of Actions */}
                    {state.sceneActions?.length > 0 && (
                        <div className="space-y-2">
                            {state.sceneActions.map((action, idx) => (
                                <div key={action.id || idx} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 flex items-center justify-between animate-in fade-in slide-in-from-bottom-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-8 bg-[var(--color-yave-gold)] rounded-full" />
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-[var(--color-yave-gold)] block mb-0.5">
                                                {action.subjectName}
                                            </span>
                                            <div className="text-sm text-gray-200 font-medium">
                                                {action.description}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dispatch({ type: 'REMOVE_SCENE_ACTION', value: action.id })}
                                        className="text-gray-500 hover:text-red-400 p-2 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Action Form */}
                    <div className="bg-[#111] border border-[#333] rounded-xl p-4 space-y-3">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Add Dynamic Action</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-1">
                                <select
                                    value={actionSubjectId}
                                    onChange={(e) => setActionSubjectId(e.target.value)}
                                    className="w-full h-full bg-[#080808] border border-[#333] text-xs text-white rounded-lg px-3 py-3 focus:border-[var(--color-yave-gold)] focus:outline-none appearance-none cursor-pointer hover:border-gray-500 transition-colors"
                                >
                                    <option value="" disabled>Select Item...</option>
                                    <option value="general">Scene / General</option>
                                    <option value="custom">Custom Item...</option>
                                    {/* Tequila Mode: Show cocktails and bottles */}
                                    {state.mode !== 'studio' && state.drinks.length > 0 && (
                                        <>
                                            <option disabled>──────────</option>
                                            {state.drinks.map((d, i) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.customRecipe || `Cocktail ${i + 1}`}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                    {state.mode !== 'studio' && state.activeBottles.length > 0 && (
                                        <>
                                            <option disabled>──────────</option>
                                            {state.activeBottles.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </>
                                    )}
                                    {/* Studio Mode: Show products AND their selected variants */}
                                    {state.mode === 'studio' && state.activeProducts.length > 0 && (
                                        <>
                                            <option disabled>──────────</option>
                                            {state.activeProducts.flatMap(p => {
                                                // Show each selected variant as a separate option
                                                if (p.variantIds && p.variantIds.length > 0) {
                                                    return p.variantIds.map(vid => {
                                                        let variantName = p.product.name;
                                                        if (vid !== 'main' && p.product.variants) {
                                                            const variant = p.product.variants.find(v => v.id === vid);
                                                            variantName = `${p.product.name} - ${variant?.name || vid}`;
                                                        }
                                                        return (
                                                            <option key={`${p.product.id}:${vid}`} value={`${p.product.id}:${vid}`}>
                                                                {variantName}
                                                            </option>
                                                        );
                                                    });
                                                }
                                                // Fallback if no variants selected
                                                return [(
                                                    <option key={p.product.id} value={p.product.id}>{p.product.name}</option>
                                                )];
                                            })}
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Custom Subject Name Input (Only if Custom Item selected) */}
                            {actionSubjectId === 'custom' && (
                                <div className="md:col-span-1">
                                    <input
                                        type="text"
                                        placeholder="Item Name (e.g. Spoon)"
                                        value={customSubjectName}
                                        onChange={(e) => setCustomSubjectName(e.target.value)}
                                        className="w-full bg-[#080808] border border-[#333] text-sm text-white rounded-lg p-3 focus:border-[var(--color-yave-gold)] focus:outline-none placeholder-gray-600"
                                    />
                                </div>
                            )}

                            <div className={`${actionSubjectId === 'custom' ? 'md:col-span-1' : 'md:col-span-2'} flex gap-2`}>
                                <input
                                    type="text"
                                    placeholder="e.g. Pouring, Splashing, Breaking..."
                                    value={actionDescription}
                                    onChange={(e) => setActionDescription(e.target.value)}
                                    className="flex-1 bg-[#080808] border border-[#333] text-sm text-white rounded-lg p-3 focus:border-[var(--color-yave-gold)] focus:outline-none placeholder-gray-600"
                                    onKeyDown={(e) => {
                                        const isCustom = actionSubjectId === 'custom';
                                        const isValid = actionSubjectId && actionDescription && (!isCustom || customSubjectName);

                                        if (e.key === 'Enter' && isValid) {
                                            let subjectName = 'Unknown';
                                            if (isCustom) {
                                                subjectName = customSubjectName;
                                            } else {
                                                // Build subjects list including product variants for Studio Mode
                                                const studioSubjects = state.mode === 'studio'
                                                    ? state.activeProducts.flatMap(p => {
                                                        if (p.variantIds && p.variantIds.length > 0) {
                                                            return p.variantIds.map(vid => {
                                                                let variantName = p.product.name;
                                                                if (vid !== 'main' && p.product.variants) {
                                                                    const variant = p.product.variants.find(v => v.id === vid);
                                                                    variantName = `${p.product.name} - ${variant?.name || vid}`;
                                                                }
                                                                return { id: `${p.product.id}:${vid}`, name: variantName };
                                                            });
                                                        }
                                                        return [{ id: p.product.id, name: p.product.name }];
                                                    })
                                                    : [];

                                                const subjects = [
                                                    { id: 'general', name: 'Scene' },
                                                    ...(state.mode !== 'studio' ? state.drinks.map((d, i) => ({ id: d.id, name: d.customRecipe || `Cocktail ${i + 1}` })) : []),
                                                    ...(state.mode !== 'studio' ? state.activeBottles.map(b => ({ id: b.id, name: b.name })) : []),
                                                    ...studioSubjects
                                                ];
                                                subjectName = subjects.find(s => s.id === actionSubjectId)?.name || 'Unknown';
                                            }

                                            dispatch({
                                                type: 'ADD_SCENE_ACTION',
                                                value: {
                                                    id: Date.now().toString(),
                                                    subjectId: actionSubjectId,
                                                    subjectName,
                                                    description: actionDescription
                                                }
                                            });
                                            setActionDescription('');
                                            setActionSubjectId('');
                                            setCustomSubjectName('');
                                        }
                                    }}
                                />
                                <button
                                    disabled={!actionSubjectId || !actionDescription || (actionSubjectId === 'custom' && !customSubjectName)}
                                    onClick={() => {
                                        let subjectName = 'Unknown';
                                        if (actionSubjectId === 'custom') {
                                            subjectName = customSubjectName;
                                        } else {
                                            // Build subjects list including product variants for Studio Mode
                                            const studioSubjects = state.mode === 'studio'
                                                ? state.activeProducts.flatMap(p => {
                                                    if (p.variantIds && p.variantIds.length > 0) {
                                                        return p.variantIds.map(vid => {
                                                            let variantName = p.product.name;
                                                            if (vid !== 'main' && p.product.variants) {
                                                                const variant = p.product.variants.find(v => v.id === vid);
                                                                variantName = `${p.product.name} - ${variant?.name || vid}`;
                                                            }
                                                            return { id: `${p.product.id}:${vid}`, name: variantName };
                                                        });
                                                    }
                                                    return [{ id: p.product.id, name: p.product.name }];
                                                })
                                                : [];

                                            const subjects = [
                                                { id: 'general', name: 'Scene' },
                                                ...(state.mode !== 'studio' ? state.drinks.map((d, i) => ({ id: d.id, name: d.customRecipe || `Cocktail ${i + 1}` })) : []),
                                                ...(state.mode !== 'studio' ? state.activeBottles.map(b => ({ id: b.id, name: b.name })) : []),
                                                ...studioSubjects
                                            ];
                                            subjectName = subjects.find(s => s.id === actionSubjectId)?.name || 'Unknown';
                                        }

                                        dispatch({
                                            type: 'ADD_SCENE_ACTION',
                                            value: {
                                                id: Date.now().toString(),
                                                subjectId: actionSubjectId,
                                                subjectName,
                                                description: actionDescription
                                            }
                                        });
                                        setActionDescription('');
                                        setActionSubjectId('');
                                        setCustomSubjectName('');
                                    }}
                                    className="bg-[var(--color-yave-gold)] text-black px-5 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#b08d26] transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );

    const renderStepHuman = () => {
        // Init target
        let targets: { id: string, name: string }[] = [{ id: 'global', name: 'Global / Default' }];

        if (state.mode === 'studio') {
            targets = [...targets, ...(state.activeProducts || []).map(p => ({ id: p.product.id, name: `Item: ${p.product.name}` }))];
        } else {
            // Tequila Mode
            // Drinks
            if (state.drinks.length > 0) {
                targets = [...targets, ...state.drinks.map((d, i) => ({ id: `drink-${i}`, name: d.customRecipe || `Cocktail ${i + 1}` }))];
            }
            // Bottles
            if (state.activeBottles && state.activeBottles.length > 0) {
                targets = [...targets, ...state.activeBottles.map(b => ({ id: `bottle-${b.id}`, name: `Bottle: ${b.name}` }))];
            }
        }

        const currentTargetId = humanEditTarget;
        // Verify target exists
        const visibleId = targets.some(t => t.id === currentTargetId) ? currentTargetId : 'global';

        // Get value
        let rawParams: any = state.humanElement; // Default Global
        if (visibleId !== 'global') {
            if (state.mode === 'studio') {
                rawParams = state.activeProducts?.find(p => p.product.id === visibleId)?.humanElement;
            }
            else if (visibleId.startsWith('drink-')) {
                const idx = parseInt(visibleId.split('-')[1]);
                rawParams = state.drinks[idx]?.humanElement;
            }
            else if (visibleId.startsWith('bottle-')) {
                const bid = visibleId.replace('bottle-', '');
                rawParams = state.activeBottles?.find(b => b.id === bid)?.humanElement;
            }
        }

        // Ensure Defined for UI
        const currentParams = rawParams || { type: 'none', gender: 'woman', ethnicity: 'Diverse' };

        const updateParams = (newVal: any) => {
            if (visibleId === 'global') {
                dispatch({ type: 'SET_HUMAN_ELEMENT', value: newVal });
            } else if (state.mode === 'studio') {
                dispatch({ type: 'UPDATE_PRODUCT_HUMAN_ELEMENT', value: { productId: visibleId, humanElement: newVal } });
            } else if (visibleId.startsWith('drink-')) {
                const idx = parseInt(visibleId.split('-')[1]);
                dispatch({ type: 'UPDATE_DRINK', index: idx, field: 'humanElement', value: newVal });
            } else if (visibleId.startsWith('bottle-')) {
                const bid = visibleId.replace('bottle-', '');
                dispatch({ type: 'UPDATE_BOTTLE_HUMAN_ELEMENT', value: { skuId: bid, humanElement: newVal } });
            }
        }

        return (
            <div className="space-y-6">
                {(targets.length > 1) && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-[#333]">
                        {targets.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setHumanEditTarget(t.id)}
                                className={`text-xs px-4 py-3 rounded-t-lg border-b-2 transition-all whitespace-nowrap ${visibleId === t.id ? 'border-[var(--color-yave-gold)] text-[var(--color-yave-gold)] font-bold bg-white/5' : 'border-transparent text-gray-500 hover:text-white'}`}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-[#111] border border-[#333] rounded-xl p-6 space-y-6">
                    {/* Visual Indicator of what we are editing */}
                    {visibleId !== 'global' && (
                        <div className="text-xs text-[var(--color-yave-gold)] font-bold uppercase tracking-widest mb-2">
                            Configuring specifics for: {targets.find(t => t.id === visibleId)?.name}
                        </div>
                    )}

                    {/* Type Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Human Presence</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['none', 'hands', 'model'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => updateParams({ ...currentParams, type })}
                                    className={`text-sm font-bold uppercase py-4 rounded-lg border transition-all ${currentParams.type === type ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)]' : 'bg-black border-[#333] text-gray-400 hover:text-white'}`}
                                >
                                    <span className="text-2xl">{type === 'none' ? '🚫' : type === 'hands' ? '🤲' : '🧍'}</span>
                                    {type === 'none' ? 'No Human' : type === 'hands' ? 'Hands Only' : 'Full Model'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    {currentParams.type !== 'none' && (
                        <div className="animate-in fade-in slide-in-from-top-4 space-y-6 border-t border-[#333] pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Gender */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Gender</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['woman', 'man'].map(g => (
                                            <button
                                                key={g}
                                                onClick={() => updateParams({ ...currentParams, gender: g })}
                                                className={`text-xs py-2 rounded border transition-all ${currentParams.gender === g ? 'bg-white/10 border-white text-white' : 'bg-black border-[#333] text-gray-500'}`}
                                            >
                                                {g === 'woman' ? 'Woman' : 'Man'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Ethnicity */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Ethnicity</label>
                                    <select
                                        value={currentParams.ethnicity || 'Diverse'}
                                        onChange={(e) => updateParams({ ...currentParams, ethnicity: e.target.value })}
                                        className="w-full bg-[#080808] border border-[#333] text-xs text-white rounded px-2 py-2.5 focus:border-[var(--color-yave-gold)] focus:outline-none"
                                    >
                                        <option value="Diverse">Any / Diverse</option>
                                        <option value="Caucasian">Caucasian</option>
                                        <option value="Black">Black / African Descent</option>
                                        <option value="Latino">Latino / Hispanic</option>
                                        <option value="Asian">Asian</option>
                                        <option value="Middle Eastern">Middle Eastern</option>
                                        <option value="Indian">Indian</option>
                                    </select>
                                </div>
                            </div>

                            {/* Styles */}
                            <div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Accessories / Style</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Gold Rings', 'Silver High Jewelry', 'Diamond Ring', 'Luxury Watch', 'Minimalist Bracelet', 'Tattoos', 'Formal Sleeve', 'Leather Jacket'].map(item => {
                                            const active = currentParams.accessories?.includes(item);
                                            return (
                                                <button
                                                    key={item}
                                                    onClick={() => {
                                                        const current = currentParams.accessories || [];
                                                        const newAcc = active ? current.filter((x: any) => x !== item) : [...current, item];
                                                        updateParams({ ...currentParams, accessories: newAcc });
                                                    }}
                                                    className={`text-[10px] uppercase font-bold px-3 py-2 rounded-lg border transition-all ${active ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)]' : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}
                                                >
                                                    {active ? '✓ ' : '+ '}{item}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Custom Details */}
                            <div className="mt-6 pt-4 border-t border-[#333]">
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Custom Accessory / Detail (Optional)</label>
                                <textarea
                                    placeholder="Describe specific details (e.g. 'Model has a small tattoo on wrist', 'Wearing a vintage Rolex', 'Hand holding the bottle by the neck')..."
                                    value={currentParams.customDetail || ''}
                                    onChange={(e) => updateParams({ ...currentParams, customDetail: e.target.value })}
                                    className="w-full bg-[#080808] border border-[#333] text-sm text-white rounded-lg p-3 focus:border-[var(--color-yave-gold)] focus:outline-none placeholder-gray-600 h-20 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderStepLighting = () => (
        <div className="space-y-8">
            <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    Lighting Mood
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    {LIGHTING_MOODS.map(l => {
                        const isAssetActive = state.background.id && state.background.id.startsWith('asset-');
                        if (l.id === 'match-asset' && !isAssetActive) return null;
                        return (
                            <button
                                key={l.id}
                                onClick={() => { dispatch({ type: 'SET_LIGHTING', value: l });}}
                                className={`p-3 rounded-lg border text-left transition-all ${state.lighting.id === l.id ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] font-bold' : 'bg-[#111] border-[#333] text-gray-400 hover:text-white'}`}
                            >
                                <span className="text-xs font-bold">{l.label}</span>
                            </button>
                        )
                    })}
                </div>
                <input
                    type="text"
                    placeholder="Custom Lighting Description..."
                    onChange={(e) => dispatch({ type: 'SET_LIGHTING', value: { id: 'custom', label: 'Custom', prompt: e.target.value } })}
                    className="w-full bg-[#111] border border-[#333] text-xs px-3 py-2 rounded focus:border-[var(--color-yave-gold)] focus:outline-none text-gray-300"
                />
            </div>
        </div>
    );

    const handleSavePreset = async () => {
        if (!newPresetName) return;

        const preset = {
            title: newPresetName,
            subtitle: 'Custom Brand Preset',
            emoji: newPresetEmoji,
            mode: state.mode, // Save Mode
            settings: {
                camera: state.camera?.id || 'dslr',
                lighting: state.lighting?.id || 'studio-dramatic',
                background: state.background?.id || 'none',
                countertop: state.countertop?.id || 'none',
                angle: state.angle?.id || 'straight-on'
            }
        };

        const res = await saveBrandPreset(preset);
        if (res.success && res.preset) {
            setCustomPresets(prev => [...prev, res.preset!]);
            setShowSavePresetModal(false);
            setNewPresetName('');
            setNewPresetEmoji('✨');
        } else {
            console.error('Failed to save preset');
        }
    };

    const renderStepReview = () => (
        <div className="space-y-8">
            <PromptReviewPanel />

            {/* Save as Template Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={() => setShowSaveFullTemplateModal(true)}
                    className="px-6 py-3 bg-[#1a1a1a] border border-[#333] rounded-xl text-gray-300 font-bold text-xs uppercase tracking-widest hover:border-[var(--color-yave-gold)] hover:text-[var(--color-yave-gold)] transition-all flex items-center gap-2"
                >
                    <span>📋</span>
                    Save as Template
                </button>
            </div>

            {/* Save Template Modal */}
            {showSaveFullTemplateModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSaveFullTemplateModal(false)}>
                    <div className="bg-[#111] border border-[#333] rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Save as Template</h3>
                            <button onClick={() => setShowSaveFullTemplateModal(false)} className="text-gray-500 hover:text-white">✕</button>
                        </div>

                        <p className="text-gray-400 text-sm mb-4">
                            Save your current configuration (recipe, garnishes, props, lighting, etc.) as a reusable template.
                        </p>

                        <input
                            type="text"
                            value={fullTemplateName}
                            onChange={(e) => setFullTemplateName(e.target.value)}
                            placeholder="Template name..."
                            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-white placeholder-gray-500 focus:border-[var(--color-yave-gold)] focus:outline-none mb-4"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSaveFullTemplateModal(false)}
                                className="flex-1 px-4 py-3 bg-[#222] border border-[#444] rounded-xl text-gray-300 font-bold text-sm hover:bg-[#333] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveFullTemplate}
                                disabled={!fullTemplateName.trim() || isSavingFullTemplate}
                                className="flex-1 px-4 py-3 bg-[var(--color-yave-gold)] rounded-xl text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingFullTemplate ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStepCamera = () => null; // Deprecated placeholder

    const containerClasses = inline
        ? "w-full h-[85vh] flex flex-col bg-[#0a0a0a] border border-[#333] rounded-2xl overflow-hidden shadow-2xl relative"
        : "w-full max-w-5xl h-[85vh] flex flex-col bg-[#0a0a0a] border border-[#333] rounded-2xl overflow-hidden shadow-2xl";

    const wrapperClasses = inline
        ? "w-full"
        : "fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300";

    return (
        <div className={wrapperClasses}>
            {/* App Branding Top Left (Overlay Mode Only) */}
            {!inline && (
                <div className="absolute top-8 left-8 z-50">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-white tracking-widest uppercase">
                            Maverick <span className="font-medium text-gray-500">Creative Suite</span>
                        </h1>
                    </div>
                </div>
            )}
            <div className={containerClasses}>

                {/* Header with Progress */}
                <div className="flex bg-[#111] p-6 items-center justify-between relative">
                    <div className="flex flex-col gap-1 items-start">

                        <div>
                            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase inline-block mr-2">Scene Wizard</h2>
                            {currentStep > 0 && (
                                <p className="text-gray-400 text-xs mt-1 block">Step {currentStep} of {STEPS.length - 1}: <span className="text-[var(--color-yave-gold)] font-bold">{STEPS[currentStep].title}</span></p>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {currentStep > 0 && (
                        <div className="absolute left-1/2 -translate-x-1/2 flex gap-2">
                            {STEPS.slice(1).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (i + 1 <= maxStepReached) setCurrentStep(i + 1);
                                    }}
                                    disabled={i + 1 > maxStepReached}
                                    className={`${STEPS.length > 12 ? 'w-8' : 'w-12'} h-1.5 rounded-full transition-all ${i <= currentStep - 1 ? 'bg-[var(--color-yave-gold)]' : (i + 1 <= maxStepReached ? 'bg-[#555] hover:bg-gray-400 cursor-pointer' : 'bg-[#333] cursor-not-allowed')}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Finish Button - Header (Only on Last Step) */}
                    {currentStep === STEPS.length - 1 && (
                        <button
                            onClick={handleNext}
                            className="bg-[var(--color-yave-gold)] text-black font-extrabold uppercase tracking-wide px-8 py-3 rounded-full hover:bg-[#b08d26] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)] text-sm animate-in fade-in slide-in-from-right-4 duration-500"
                        >
                            Finish & Generate
                        </button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className={`mx-auto transition-all duration-500 ${currentStep === STEPS.length - 1 ? 'max-w-6xl' : 'max-w-4xl'}`}>
                        <div className="mb-8 flex items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">{STEPS[currentStep].title}</h1>
                                <p className="text-xl text-gray-500">{STEPS[currentStep].subtitle}</p>
                            </div>

                            {/* Save Preset Button (Header Location) */}
                            {STEPS[currentStep].id === 'review' && (
                                <button
                                    onClick={() => setShowSavePresetModal(true)}
                                    className="shrink-0 flex items-center gap-2 text-gray-500 hover:text-[var(--color-yave-gold)] transition-colors text-xs font-bold uppercase tracking-widest border border-dashed border-[#444] hover:border-[var(--color-yave-gold)] px-4 py-3 rounded-lg group mb-1"
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform">💾</span>
                                    Save as Preset
                                </button>
                            )}
                        </div>

                        <div className="animate-in slide-in-from-right-8 duration-500 fade-in">
                            {state.mode === 'studio' ? (
                                <>
                                    {currentStep === 0 && renderStepIntro()}
                                    {currentStep === 1 && renderStepFormat()}
                                    {currentStep === 2 && renderStepCameraStyle()}
                                    {currentStep === 3 && renderStepShotAngle()}
                                    {currentStep === 4 && renderStepStudioProducts()}
                                    {currentStep === 5 && renderStepProps()}
                                    {currentStep === 6 && renderStepHuman()}
                                    {currentStep === 7 && renderStepYourScene()}
                                    {currentStep === 8 && renderStepSetScene()}
                                    {currentStep === 9 && renderStepLighting()}
                                    {currentStep === 10 && renderStepReview()}
                                </>
                            ) : (
                                <>
                                    {currentStep === 0 && renderStepIntro()}
                                    {currentStep === 1 && renderStepFormat()}
                                    {currentStep === 2 && renderStepCameraStyle()}
                                    {currentStep === 3 && renderStepShotAngle()}
                                    {currentStep === 4 && renderStepLiquid()}
                                    {currentStep === 5 && renderStepBottles()}
                                    {currentStep === 6 && renderStepVessel()}
                                    {currentStep === 7 && renderStepIce()}
                                    {currentStep === 8 && renderStepGarnish()}
                                    {currentStep === 9 && renderStepProps()}
                                    {currentStep === 10 && renderStepHuman()}
                                    {currentStep === 11 && renderStepYourScene()}
                                    {currentStep === 12 && renderStepSetScene()}
                                    {currentStep === 13 && renderStepLighting()}
                                    {currentStep === 14 && renderStepReview()}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Controls - Hidden on Intro Step */}
                {currentStep !== 0 && (
                    <div className="bg-[#111] border-t border-[#333] p-6 flex justify-between items-center">
                        <button
                            onClick={() => {
                                // Back Button Skip Logic
                                if (state.mode === 'tequila') {
                                    // 1. Skip Bottles if not included
                                    if (currentStep === 6 && !includeExtraBottles) {
                                        // Vessel(6) -> Skip Bottles(5) -> Liquid(4)
                                        setCurrentStep(4);
                                        return;
                                    }
                                    // 2. Skip Set Scene if Your Scene has asset
                                    if (currentStep === 12) {
                                        // Lighting(12) -> Check if we should skip SetScene(11) -> YourScene(10)
                                        if (state.background?.id?.startsWith('asset-')) {
                                            setCurrentStep(10);
                                            return;
                                        }
                                    }
                                }
                                handleBack();
                            }}
                            disabled={currentStep === 0}
                            className="px-10 py-4 rounded-full border border-[#333] bg-black font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:border-white disabled:opacity-30 disabled:hover:text-gray-400 transition-all"
                        >
                            Back
                        </button>

                        <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                            {activeClientId ? clients.find(c => c.id === activeClientId)?.name : 'Global Library'}
                        </div>

                        {/* Next Button - Hidden on Last Step (Moved to Header) */}
                        {currentStep < STEPS.length - 1 && (
                            <button
                                onClick={() => {
                                    // Step Skip Logic (Forward)
                                    if (state.mode === 'tequila') {
                                        // 1. Skip Bottles if not included
                                        if (currentStep === 4 && !includeExtraBottles) {
                                            // Liquid(4) -> Skip Bottles(5) -> Vessel(6)
                                            setCurrentStep(6);
                                            return;
                                        }
                                        // 2. Skip Set Scene if Your Scene has asset
                                        if (currentStep === 10) {
                                            // Your Scene(10). Check asset.
                                            if (state.background?.id?.startsWith('asset-')) {
                                                // Skip Set Scene(11) -> Lighting(12)
                                                setCurrentStep(12);
                                                return;
                                            }
                                        }
                                    }
                                    handleNext();
                                }}
                                className="px-12 py-4 rounded-full bg-[var(--color-yave-gold)] text-black font-bold uppercase tracking-wider hover:bg-[#b08d26] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                            >
                                Next
                            </button>
                        )}
                    </div>
                )}

            </div>
            <ConfirmDialog
                isOpen={warningDialog.isOpen}
                title={warningDialog.title}
                message={warningDialog.message}
                onConfirm={warningDialog.onConfirm}
                onCancel={() => setWarningDialog(prev => ({ ...prev, isOpen: false }))}
                confirmText="Continue Anyway"
                isDanger={false}
            />

            {/* Save Preset Modal */}
            {showSavePresetModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setShowSavePresetModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            ✕
                        </button>

                        <h3 className="text-xl font-bold text-white mb-1">Save Brand Preset</h3>
                        <p className="text-gray-400 text-sm mb-6">Save this Camera, Lighting, and Background combination for quick access.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Preset Name</label>
                                <input
                                    type="text"
                                    value={newPresetName}
                                    onChange={(e) => setNewPresetName(e.target.value)}
                                    placeholder="e.g. Moody Night Shot"
                                    className="w-full bg-[#222] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[var(--color-yave-gold)] focus:outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Icon (Emoji)</label>
                                <div className="flex gap-2">
                                    {['✨', '🔥', '🥃', '📸', '🌿', '🌊', '🌑', '💡'].map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setNewPresetEmoji(emoji)}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${newPresetEmoji === emoji ? 'bg-[var(--color-yave-gold)] text-black' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSavePreset}
                                disabled={!newPresetName}
                                className="w-full bg-[var(--color-yave-gold)] text-black font-bold uppercase tracking-wider py-3 rounded-lg mt-4 hover:bg-[#b08d26] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Save Preset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
