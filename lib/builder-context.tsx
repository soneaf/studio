'use client';

import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import {
    ANGLES,
    BACKGROUNDS,
    COUNTERTOPS,
    GLASSWARE,
    ICE_OPTIONS,
    TEQUILA_SKUS,
    LIGHTING_MOODS,
    CAMERA_TYPES,
    type AngleOption,
    type BackgroundOption,
    type CountertopOption,
    type GarnishOption,
    type Glassware,
    type IceOption,
    type TequilaSku,
    type GarnishPlacement,
    type LightingOption,
    type CameraOption,
    type PropOption,
    type PropPlacement,
    type CameraSettings,
    PROPS,
    PROP_PLACEMENTS
} from '@/lib/data';
import type { GeneralProduct } from '@/app/settings-actions';

export type SelectedGarnish = {
    id: string;
    name: string;
    placement: GarnishPlacement;
    quantity: number;
};

export type SelectedProp = {
    id: string;
    name: string;
    value?: string;
    placement: PropPlacement;
    placementValue?: string;
    color?: string;
    details?: string;
    quantity: number;
};

export type HumanElement = {
    type: 'none' | 'hands' | 'model';
    gender: 'man' | 'woman';
    ethnicity: string;
    nailColor?: string;
    accessories?: string[];
    customDetail?: string;
};

export type SceneAction = {
    id: string;
    subjectId: string;
    subjectName: string;
    description: string;
};

// Per-drink state
export type DrinkState = {
    id: string; // Unique ID for keying
    customRecipe: string;
    selectedSku: TequilaSku;
    glassware: Glassware;
    ice: IceOption;
    iceQuantity: 'One' | 'Two' | 'Three' | 'Many';
    rocksGlassType: 'Plain' | 'Diamond Cut';
    garnishes: SelectedGarnish[];
    visualDescription: string;
    customGlasswareDetail: string;
    humanElement?: HumanElement;
    placementX?: string;
    placementDepth?: string;
};

// Global Scene State
type BuilderState = {
    // Global properties
    angle: AngleOption;
    lighting: LightingOption;
    camera: CameraOption;
    cameraSettings: CameraSettings & { enabled: boolean }; // New
    background: BackgroundOption;
    countertop: CountertopOption;
    surfacePlacement?: string; // New: Front Edge, Center, Back Edge
    showBottle: boolean;
    bottleOnlyMode: boolean; // New Flag
    customBackground?: string;
    customCountertop?: string;
    customLighting?: string;
    customAngle?: string;
    sceneActions: SceneAction[]; // New: List of actions
    aspectRatio: string;
    selectedAspectRatios: string[]; // Support multi-select
    referenceImage?: string | null;

    // Multi-drink system
    drinks: DrinkState[];
    activeDrinkIndex: number;
    // Tequila Mode state
    standaloneBottleSku: TequilaSku;
    activeBottles: (TequilaSku & { humanElement?: HumanElement, placementX?: string, placementDepth?: string })[]; // New: Multi-select bottles

    // Studio Mode
    mode: 'tequila' | 'studio';
    activeProducts: { product: GeneralProduct, variantIds: string[], humanElement?: HumanElement }[];

    // Photo Shoot Assets
    activePhotoShootAssetId?: string | null;

    // Visual Props
    props: SelectedProp[];

    // Human Element
    humanElement: HumanElement;

    // Multi-tenancy
    activeClientId?: string | null;

    // JSON Template Override
    templateOverridePrompt?: string | null;
    templateReferenceImages?: string[];

    // Campaign
    activeCampaignId?: string | null;
};

const defaultDrink: DrinkState = {
    id: 'drink-1',
    customRecipe: '',
    selectedSku: TEQUILA_SKUS[0],
    visualDescription: '',
    glassware: GLASSWARE[0],
    ice: ICE_OPTIONS[0],
    iceQuantity: 'Many',
    rocksGlassType: 'Plain',
    garnishes: [],
    customGlasswareDetail: '',
};

const defaultState: BuilderState = {
    background: BACKGROUNDS[0],
    countertop: COUNTERTOPS[0],
    angle: ANGLES[0],
    lighting: LIGHTING_MOODS[0],
    camera: CAMERA_TYPES[0], // Default DSLR
    cameraSettings: { enabled: false, lens: '85mm Portrait', aperture: 'f/1.2 (Dreamy)', iso: 'ISO 100', shutter: '1/125s' },
    showBottle: false,
    bottleOnlyMode: false,
    sceneActions: [],
    aspectRatio: '4:5',
    selectedAspectRatios: ['4:5'],
    drinks: [defaultDrink],
    activeDrinkIndex: 0,
    standaloneBottleSku: TEQUILA_SKUS[0],
    activeBottles: [],
    mode: 'tequila',
    activeProducts: [],
    activePhotoShootAssetId: null,
    props: [],
    humanElement: { type: 'none', gender: 'woman', ethnicity: 'Diverse' },
    activeClientId: null,
    templateOverridePrompt: null,
    templateReferenceImages: [],
    activeCampaignId: null,
};


type BuilderContextType = {
    state: BuilderState;
    setState: (s: BuilderState) => void;

    // Global Setters
    setAngle: (angle: AngleOption) => void;
    setLighting: (lighting: LightingOption) => void;
    setCamera: (camera: CameraOption) => void;
    setCameraSettings: (settings: Partial<CameraSettings & { enabled: boolean }>) => void;
    setBackground: (bg: BackgroundOption) => void;
    setCountertop: (ct: CountertopOption) => void;
    setShowBottle: (show: boolean) => void;
    setBottleOnlyMode: (only: boolean) => void;
    setCustomBackground: (bg: string | undefined) => void;
    setCustomCountertop: (ct: string | undefined) => void;
    setCustomLighting: (lighting: string | undefined) => void;
    setCustomAngle: (angle: string | undefined) => void;
    addSceneAction: (action: SceneAction) => void;
    removeSceneAction: (id: string) => void;
    setAspectRatio: (ratio: string) => void;
    toggleAspectRatio: (ratio: string) => void;
    setReferenceImage: (img: string | null) => void;

    // Photo Shoot Assets
    setPhotoShootAssetId: (id: string | null) => void;

    // Props
    addProp: (prop: SelectedProp) => void;
    removeProp: (id: string) => void;

    // Active Drink Actions
    updateMake: (updates: Partial<DrinkState>) => void;
    setIce: (ice: IceOption) => void;
    addGarnish: (garnish: SelectedGarnish) => void;
    removeGarnish: (id: string) => void;
    updateGarnishPlacement: (id: string, placement: GarnishPlacement) => void;
    updateGarnishQuantity: (id: string, quantity: number) => void;
    setGlassware: (g: Glassware) => void;
    setSku: (sku: TequilaSku) => void;
    setCustomRecipe: (recipe: string) => void;
    setVisualDescription: (desc: string) => void;
    setIceQuantity: (qty: 'One' | 'Two' | 'Three' | 'Many') => void;
    setRocksGlassType: (type: 'Plain' | 'Diamond Cut') => void;
    setCustomGlasswareDetail: (detail: string) => void;
    setStandaloneBottleSku: (sku: TequilaSku) => void;

    // Multi-drink management
    activeDrink: DrinkState; // Derived getter convenience
    addDrink: () => void;
    removeDrink: (index: number) => void;
    setActiveDrink: (index: number) => void;
    updateDrink: (index: number, updates: Partial<DrinkState>) => void;
    resetState: () => void;

    // Tequila Bottle Management
    toggleBottle: (sku: TequilaSku) => void;

    // Studio Mode Actions
    setMode: (mode: 'tequila' | 'studio') => void;
    setClientId: (id: string | null) => void;
    activeClientId?: string | null;
    toggleProduct: (product: GeneralProduct) => void;
    toggleProductVariant: (productId: string, variantId: string) => void;
    dispatch: (action: any) => void;

    // JSON Template Override
    setTemplateOverride: (prompt: string | null, referenceImages?: string[]) => void;

    // Campaign
    activeCampaignId?: string | null;
    setActiveCampaign: (id: string | null) => void;
};

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BuilderState>(defaultState);

    // Helper to update active drink
    const updateActiveDrink = (updates: Partial<DrinkState>) => {
        setState(prev => {
            const newDrinks = [...prev.drinks];
            newDrinks[prev.activeDrinkIndex] = { ...newDrinks[prev.activeDrinkIndex], ...updates };
            return { ...prev, drinks: newDrinks };
        });
    };

    // Alias for consistency
    const updateMake = updateActiveDrink;

    // Generic update for any drink
    const updateDrink = (index: number, updates: Partial<DrinkState>) => {
        setState(prev => {
            const newDrinks = [...prev.drinks];
            // Safety check
            if (!newDrinks[index]) return prev;
            newDrinks[index] = { ...newDrinks[index], ...updates };
            return { ...prev, drinks: newDrinks };
        });
    };

    // Global Setters
    const setBackground = (background: BackgroundOption) => setState(prev => ({ ...prev, background }));
    const setCountertop = (countertop: CountertopOption) => setState(prev => ({ ...prev, countertop }));
    const setCustomBackground = (bg: string | undefined) => setState(prev => ({ ...prev, customBackground: bg }));
    const setCustomCountertop = (ct: string | undefined) => setState(prev => ({ ...prev, customCountertop: ct }));
    const setCustomLighting = (l: string | undefined) => setState(prev => ({ ...prev, customLighting: l }));
    const setCustomAngle = (a: string | undefined) => setState(prev => ({ ...prev, customAngle: a }));
    const addSceneAction = (a: SceneAction) => setState(prev => ({ ...prev, sceneActions: [...prev.sceneActions, a] }));
    const removeSceneAction = (id: string) => setState(prev => ({ ...prev, sceneActions: prev.sceneActions.filter(x => x.id !== id) }));
    const setAspectRatio = (ratio: string) => setState(prev => ({ ...prev, aspectRatio: ratio, selectedAspectRatios: [ratio] })); // Reset to single
    const toggleAspectRatio = (ratio: string) => setState(prev => {
        const current = prev.selectedAspectRatios || [prev.aspectRatio];
        let newRatios;
        if (current.includes(ratio)) {
            // Remove, but prevent empty
            if (current.length === 1) return prev;
            newRatios = current.filter(r => r !== ratio);
        } else {
            newRatios = [...current, ratio];
        }
        // Also update primary 'aspectRatio' to the last selected/toggled for preview purposes
        return {
            ...prev,
            selectedAspectRatios: newRatios,
            aspectRatio: newRatios[newRatios.length - 1]
        };
    });
    const setAngle = (angle: AngleOption) => setState(prev => ({ ...prev, angle }));
    const setLighting = (lighting: LightingOption) => setState(prev => ({ ...prev, lighting }));
    // Updated setCamera to apply defaults
    const setCamera = (camera: CameraOption) => setState(prev => {
        let newSettings = prev.cameraSettings;
        if (camera.defaultSettings) {
            newSettings = { ...newSettings, ...camera.defaultSettings };
        }
        return { ...prev, camera, cameraSettings: newSettings };
    });
    const setCameraSettings = (settings: Partial<CameraSettings & { enabled: boolean }>) => setState(prev => ({
        ...prev,
        cameraSettings: { ...prev.cameraSettings, ...settings }
    }));
    const setShowBottle = (show: boolean) => setState(prev => ({ ...prev, showBottle: show }));
    const setBottleOnlyMode = (only: boolean) => setState(prev => ({ ...prev, bottleOnlyMode: only }));
    const setStandaloneBottleSku = (sku: TequilaSku) => setState(prev => ({ ...prev, standaloneBottleSku: sku }));
    const setReferenceImage = (img: string | null) => setState(prev => ({ ...prev, referenceImage: img }));

    // Drink Setters (Proxy to active drink)
    const setSku = (sku: TequilaSku) => {
        updateActiveDrink({ selectedSku: sku });
    };
    const setCustomRecipe = (recipe: string) => updateActiveDrink({ customRecipe: recipe });
    const setVisualDescription = (desc: string) => updateActiveDrink({ visualDescription: desc });
    const setIceQuantity = (qty: 'One' | 'Two' | 'Three' | 'Many') => updateActiveDrink({ iceQuantity: qty });
    const setRocksGlassType = (type: 'Plain' | 'Diamond Cut') => updateActiveDrink({ rocksGlassType: type });
    const setCustomGlasswareDetail = (detail: string) => updateActiveDrink({ customGlasswareDetail: detail });
    const setGlassware = (glassware: Glassware) => updateActiveDrink({ glassware });
    const setIce = (ice: IceOption) => updateActiveDrink({ ice });

    // Garnish Actions (Complex proxied)
    const addGarnish = (garnish: SelectedGarnish) => setState(prev => {
        const activeDrink = prev.drinks[prev.activeDrinkIndex];
        if (activeDrink.garnishes.some(g => g.id === garnish.id)) return prev;

        const newDrinks = [...prev.drinks];
        newDrinks[prev.activeDrinkIndex] = { ...activeDrink, garnishes: [...activeDrink.garnishes, garnish] };
        return { ...prev, drinks: newDrinks };
    });

    const removeGarnish = (id: string) => setState(prev => {
        const activeDrink = prev.drinks[prev.activeDrinkIndex];
        const newDrinks = [...prev.drinks];
        newDrinks[prev.activeDrinkIndex] = {
            ...activeDrink,
            garnishes: activeDrink.garnishes.filter(g => g.id !== id)
        };
        return { ...prev, drinks: newDrinks };
    });

    const updateGarnishPlacement = (id: string, placement: GarnishPlacement) => {
        setState(prev => {
            const activeDrink = prev.drinks[prev.activeDrinkIndex];
            const newDrinks = [...prev.drinks];
            newDrinks[prev.activeDrinkIndex] = {
                ...activeDrink,
                garnishes: activeDrink.garnishes.map(g => g.id === id ? { ...g, placement } : g)
            };
            return { ...prev, drinks: newDrinks };
        });
    };

    const updateGarnishQuantity = (id: string, quantity: number) => {
        setState(prev => {
            const activeDrink = prev.drinks[prev.activeDrinkIndex];
            const newDrinks = [...prev.drinks];
            newDrinks[prev.activeDrinkIndex] = {
                ...activeDrink,
                garnishes: activeDrink.garnishes.map(g => g.id === id ? { ...g, quantity } : g)
            };
            return { ...prev, drinks: newDrinks };
        });
    };

    // Drink Management
    const addDrink = () => setState(prev => ({
        ...prev,
        drinks: [...prev.drinks, {
            ...defaultDrink,
            id: `drink-${Date.now()}`,
            customRecipe: `New Drink ${prev.drinks.length + 1}`
        }],
        activeDrinkIndex: prev.drinks.length // switch to new drink? yes
    }));

    const removeDrink = (index: number) => setState(prev => {
        const newDrinks = prev.drinks.filter((_, i) => i !== index);
        let newIndex = prev.activeDrinkIndex;
        if (newIndex >= newDrinks.length) newIndex = newDrinks.length - 1;
        // If no drinks left, newIndex becomes -1.
        return { ...prev, drinks: newDrinks, activeDrinkIndex: Math.max(0, newIndex) };
    });

    const setActiveDrink = (index: number) => setState(prev => ({ ...prev, activeDrinkIndex: index }));
    const resetState = () => setState(defaultState);

    // Tequila Toggle
    const toggleBottle = (sku: TequilaSku) => {
        setState(prev => {
            const exists = prev.activeBottles.find(b => b.id === sku.id);
            if (exists) {
                return { ...prev, activeBottles: prev.activeBottles.filter(b => b.id !== sku.id) };
            } else {
                return { ...prev, activeBottles: [...prev.activeBottles, sku] };
            }
        });
    };

    // Studio Mode
    const setMode = (mode: 'tequila' | 'studio') => setState(prev => ({ ...prev, mode }));
    const setClientId = (id: string | null) => setState(prev => ({ ...prev, activeClientId: id }));
    const setTemplateOverride = (prompt: string | null, referenceImages?: string[]) => setState(prev => ({
        ...prev,
        templateOverridePrompt: prompt,
        templateReferenceImages: referenceImages || []
    }));

    // Campaign
    const setActiveCampaign = (id: string | null) => setState(prev => ({ ...prev, activeCampaignId: id }));

    const toggleProduct = (product: GeneralProduct) => {
        setState(prev => {
            const exists = prev.activeProducts.find(p => p.product.id === product.id);
            let newProducts;
            if (exists) {
                // Remove
                newProducts = prev.activeProducts.filter(p => p.product.id !== product.id);
            } else {
                // Add with default main variant selected
                newProducts = [...prev.activeProducts, { product, variantIds: ['main'] }];
            }
            return { ...prev, activeProducts: newProducts };
        });
    };

    const toggleProductVariant = (productId: string, variantId: string) => {
        setState(prev => {
            const newProducts = prev.activeProducts.map(p => {
                if (p.product.id === productId) {
                    const currentIds = p.variantIds || ['main'];
                    let newIds;
                    if (currentIds.includes(variantId)) {
                        newIds = currentIds.filter(id => id !== variantId);
                    } else {
                        newIds = [...currentIds, variantId];
                    }
                    return { ...p, variantIds: newIds };
                }
                return p;
            });
            return { ...prev, activeProducts: newProducts };
        });
    };

    const setPhotoShootAssetId = (id: string | null) => setState(prev => ({ ...prev, activePhotoShootAssetId: id }));

    const addProp = (prop: SelectedProp) => setState(prev => {
        if (prev.props.some(p => p.id === prop.id)) return prev;
        return { ...prev, props: [...prev.props, prop] };
    });

    const removeProp = (id: string) => setState(prev => ({ ...prev, props: prev.props.filter(p => p.id !== id) }));

    const contextValue = useMemo(() => ({
                state,
                setState,
                updateMake,
                setSku,
                setCustomRecipe,
                setVisualDescription,
                setGlassware,
                setBackground,
                setCountertop,
                setIce,
                addGarnish,
                removeGarnish,
                updateGarnishPlacement,
                updateGarnishQuantity,
                setAngle,
                setLighting,
                setCamera,
                setShowBottle,
                setBottleOnlyMode,
                setCustomBackground,
                setCustomCountertop,
                setCustomLighting,
                setCustomAngle,
                setCameraSettings,
                addSceneAction,
                removeSceneAction,
                setIceQuantity,
                setRocksGlassType,
                setAspectRatio,
                toggleAspectRatio,
                setCustomGlasswareDetail,
                setStandaloneBottleSku,
                setReferenceImage,

                // Management
                activeDrink: state.drinks[state.activeDrinkIndex],
                addDrink,
                removeDrink,
                setActiveDrink,
                updateDrink,
                resetState,

                toggleBottle,

                // Studio
                setMode,
                setClientId,
                activeClientId: state.activeClientId,
                toggleProduct,
                toggleProductVariant,
                setPhotoShootAssetId,
                addProp,
                removeProp,
                setTemplateOverride,

                // Campaign
                activeCampaignId: state.activeCampaignId,
                setActiveCampaign,

                // Dispatch Adapter for Wizard
                dispatch: (action: any) => {
                    switch (action.type) {
                        case 'UPDATE_DRINK':
                            updateDrink(action.index, { [action.field]: action.value });
                            break;
                        case 'SET_STANDALONE_BOTTLE':
                            setStandaloneBottleSku(action.sku);
                            break;
                        case 'ADD_GARNISH':
                            // Logic duplicated from addGarnish but allowing index specific target
                            // Actually addGarnish uses activeDrinkIndex. Wizard uses index 0 specifically sometimes.
                            // Let's implement specific index generic garnish add
                            setState(prev => {
                                const targetDrink = prev.drinks[action.index];
                                if (targetDrink.garnishes.some((g: any) => g.id === action.garnish.id)) return prev;
                                const newDrinks = [...prev.drinks];
                                newDrinks[action.index] = { ...targetDrink, garnishes: [...targetDrink.garnishes, action.garnish] };
                                return { ...prev, drinks: newDrinks };
                            });
                            break;
                        case 'SET_BACKGROUND':
                            setBackground(action.value);
                            break;
                        case 'SET_COUNTERTOP':
                            setCountertop(action.value);
                            break;
                        case 'UPDATE_SURFACE_PLACEMENT':
                            setState(prev => ({ ...prev, surfacePlacement: action.value }));
                            break;
                        case 'SET_LIGHTING':
                            setLighting(action.value);
                            break;
                        case 'SET_CAMERA':
                            setCamera(action.value);
                            break;
                        case 'SET_CAMERA_SETTINGS':
                            setCameraSettings(action.value);
                            break;
                        case 'SET_ANGLE':
                            setAngle(action.value);
                            break;
                        case 'SET_MODE':
                            setMode(action.value);
                            break;
                        case 'SET_CLIENT_ID':
                            setClientId(action.value);
                            break;
                        case 'SET_BOTTLE_ONLY_MODE':
                            setBottleOnlyMode(action.value);
                            break;
                        case 'ADD_SCENE_ACTION':
                            addSceneAction(action.value);
                            break;
                        case 'REMOVE_SCENE_ACTION':
                            removeSceneAction(action.value);
                            break;
                        case 'ADD_BOTTLE':
                            setState(prev => {
                                if (prev.activeBottles.some(b => b.id === action.value.id)) return prev;
                                return { ...prev, activeBottles: [...prev.activeBottles, action.value] };
                            });
                            break;
                        case 'REMOVE_BOTTLE':
                            setState(prev => ({ ...prev, activeBottles: prev.activeBottles.filter(b => b.id !== action.value.id) }));
                            break;
                        case 'UPDATE_BOTTLE_PLACEMENT':
                            // Value: { id: string, x?: string, depth?: string }
                            setState(prev => ({
                                ...prev,
                                activeBottles: prev.activeBottles.map(b =>
                                    b.id === action.value.id
                                        ? {
                                            ...b,
                                            placementX: action.value.x !== undefined ? action.value.x : b.placementX,
                                            placementDepth: action.value.depth !== undefined ? action.value.depth : b.placementDepth
                                        }
                                        : b
                                )
                            }));
                            break;
                        case 'ADD_PROP':
                            addProp(action.value);
                            break;
                        case 'REMOVE_PROP':
                            removeProp(action.value);
                            break;
                        case 'SET_HUMAN_ELEMENT':
                            setState(prev => ({ ...prev, humanElement: action.value }));
                            break;
                        case 'UPDATE_PRODUCT_HUMAN_ELEMENT':
                            // action.value = { productId, humanElement }
                            setState(prev => ({
                                ...prev,
                                activeProducts: prev.activeProducts.map(p =>
                                    p.product.id === action.value.productId
                                        ? { ...p, humanElement: action.value.humanElement }
                                        : p
                                )
                            }));
                            break;
                        case 'UPDATE_BOTTLE_HUMAN_ELEMENT':
                            // action.value = { skuId, humanElement }
                            setState(prev => ({
                                ...prev,
                                activeBottles: prev.activeBottles.map(b =>
                                    b.id === action.value.skuId
                                        ? { ...b, humanElement: action.value.humanElement }
                                        : b
                                )
                            }));
                            break;
                        default:
                            console.warn("Unknown dispatch action:", action.type);
                    }
                }
            }), [state]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <BuilderContext.Provider value={contextValue}>
            {children}
        </BuilderContext.Provider>
    );
}

export function useBuilder() {
    const context = useContext(BuilderContext);
    if (context === undefined) {
        throw new Error('useBuilder must be used within a BuilderProvider');
    }
    return context;
}
