'use client';

import { BACKGROUNDS, COUNTERTOPS, GARNISHES, TEQUILA_SKUS, GARNISH_PLACEMENTS, ICE_OPTIONS, GLASSWARE, RECIPES, ANGLES, LIGHTING_MOODS, type GarnishSection, type GarnishOption, type GarnishPlacement, type TequilaSku } from '@/lib/data';
import { useBuilder, type SelectedGarnish } from '@/lib/builder-context';
import { generateVisualDescription } from '@/app/auto-describe';
import { useState, useRef, useEffect } from 'react';
import { getSettings, type PhotoShootAsset } from '@/app/settings-actions';
import ConfirmDialog from './ConfirmDialog';

export default function CocktailBuilderControls({ onGenerate, isGenerating }: { onGenerate: () => void, isGenerating: boolean }) {
    const [customBottles, setCustomBottles] = useState<TequilaSku[]>([]);
    const [photoShootAssets, setPhotoShootAssets] = useState<PhotoShootAsset[]>([]);

    useEffect(() => {
        getSettings().then(s => {
            if (s.customBottles) setCustomBottles(s.customBottles);
            if (s.photoShootAssets) setPhotoShootAssets(s.photoShootAssets);
        });
    }, []);

    const {
        state,
        activeDrink,
        addDrink,
        removeDrink,
        setActiveDrink, // Renamed from setActiveDrinkIndex
        setBackground,
        setCountertop,
        setIce,
        addGarnish,
        removeGarnish,
        setLighting,
        updateGarnishPlacement,
        updateGarnishQuantity,
        setCustomRecipe,
        setSku,
        setShowBottle,
        setVisualDescription,
        setCustomBackground,
        setCustomCountertop,
        setIceQuantity,
        setCustomGlasswareDetail,
        setStandaloneBottleSku,
        updateDrink,
        setBottleOnlyMode,
        setAngle,
        setReferenceImage,
        setAspectRatio,
        resetState,
        toggleBottle,
        setPhotoShootAssetId // New
    } = useBuilder();

    // Destructure Global State
    const { background, countertop, customBackground, customCountertop } = state;

    // Destructure Active Drink State (Safely)
    const { customRecipe, selectedSku, visualDescription, ice, iceQuantity, garnishes, customGlasswareDetail } = activeDrink || {};

    const [isDescribing, setIsDescribing] = useState(false);
    const [customGarnishInput, setCustomGarnishInput] = useState('');
    const [garnishSearch, setGarnishSearch] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [drinkToDelete, setDrinkToDelete] = useState<number | null>(null);

    // Auto-resize textarea when content changes
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [visualDescription]);

    // Garnish Modal State
    const [showGarnishModal, setShowGarnishModal] = useState(false);
    const [activeSection, setActiveSection] = useState<GarnishSection | null>(null);
    const [selectedGarnishToAdd, setSelectedGarnishToAdd] = useState<GarnishOption | null>(null);
    // Toothpick State
    const [toothpickMode, setToothpickMode] = useState(false);
    const [toothpickStyle, setToothpickStyle] = useState<'Wood' | 'Metal' | 'Decorative'>('Wood');

    const handleAutoDescribe = async () => {
        if (!activeDrink || !activeDrink.customRecipe) return;
        setIsDescribing(true);
        const result = await generateVisualDescription(activeDrink.customRecipe);
        if (result.success && result.description) {
            setVisualDescription(result.description);
        } else {
            console.error(result.error);
        }
        setIsDescribing(false);
    };

    const handleBartendersChoice = () => {
        if (!activeDrink) return;

        // 1. Pick a Random Real Recipe
        const randomRecipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];

        // 2. Find matching objects from data
        const sku = TEQUILA_SKUS.find(s => s.sku === randomRecipe.liquor) || TEQUILA_SKUS[0];
        const glass = GLASSWARE.find(g => g.id === randomRecipe.glasswareId) || GLASSWARE[0];
        const iceOption = ICE_OPTIONS.find(i => i.id === randomRecipe.ice) || ICE_OPTIONS[0];

        // 3. Random Garnish
        const randomGarnish = GARNISHES[Math.floor(Math.random() * GARNISHES.length)];
        const placement = GARNISH_PLACEMENTS[Math.floor(Math.random() * GARNISH_PLACEMENTS.length)].id;

        // 4. Random Scene
        const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
        const randomCounter = COUNTERTOPS[Math.floor(Math.random() * COUNTERTOPS.length)];
        const randomAngle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
        const randomLighting = LIGHTING_MOODS[Math.floor(Math.random() * LIGHTING_MOODS.length)];

        // 5. Apply All Updates
        updateDrink(state.activeDrinkIndex, {
            customRecipe: randomRecipe.name,
            visualDescription: randomRecipe.visualDescription,
            selectedSku: sku,
            glassware: glass,
            ice: iceOption,
            garnishes: [{ id: randomGarnish.id, name: randomGarnish.name, placement: placement as import('@/lib/data').GarnishPlacement, quantity: 1 }]
        });

        // Update Global Scene Settings
        setBackground(randomBg);
        setCustomBackground('');
        setCountertop(randomCounter);
        setCustomCountertop('');
        setAngle(randomAngle);
        setLighting(randomLighting);
    };

    const handleRemoveDrink = (index: number) => {
        if (state.drinks.length > 1) {
            // More than 1 drink? Just delete it.
            removeDrink(index);
        } else {
            // Last drink? Confirm switching to bottle mode.
            setDrinkToDelete(index);
        }
    };

    const handleAddCustomGarnish = () => {
        if (!customGarnishInput.trim()) return;
        // This is now handled via modal or we keep it for now as requested to move to modal. 
        // User asked to REMOVE it from main, so we will implement logic inside modal instead.
        setCustomGarnishInput('');
    };

    const openGarnishModal = () => {
        setShowGarnishModal(true);
        setActiveSection(null);
        setSelectedGarnishToAdd(null);
    };

    const handleGarnishSelection = (garnish: GarnishOption, placement: GarnishPlacement) => {
        let finalName = garnish.name;
        if (toothpickMode) {
            finalName += ` (On ${toothpickStyle} Pick)`;
        }

        const newGarnish: SelectedGarnish = {
            id: garnish.id,
            name: finalName,
            placement: placement,
            quantity: 1
        };
        addGarnish(newGarnish);
        setShowGarnishModal(false);
        // Reset
        setActiveSection(null);
        setSelectedGarnishToAdd(null);
        setToothpickMode(false);
        setToothpickStyle('Wood');
    };

    // STANDALONE BOTTLE MODE (0 Drinks)
    if (state.drinks.length === 0) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 1. Standalone Bottle Config */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold">
                            1. Standalone Bottle Mode
                        </label>
                        <button
                            onClick={addDrink}
                            className="text-xs bg-[#222] hover:bg-[#333] border border-[#333] px-3 py-1.5 rounded-full text-white transition-colors flex items-center gap-2"
                        >
                            <span>+ Add a Drink</span>
                        </button>
                    </div>

                    <div className="bg-[#111] border border-[#222] p-6 rounded-xl text-center">
                        <h3 className="text-white font-bold mb-2">Detailed Product Shot</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            No drinks configured. The AI will generate a cinematic product shot focusing solely on the selected bottle.
                        </p>

                        <div className="text-left">
                            <label className="block text-xs text-gray-400 mb-2">Select Hero Bottle</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {TEQUILA_SKUS.map((sku) => (
                                    <button
                                        key={sku.id}
                                        onClick={() => { setStandaloneBottleSku(sku); setSku(sku); }}
                                        className={`px-3 py-3 rounded border text-sm transition-all ${state.standaloneBottleSku.id === sku.id
                                            ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                            : 'bg-[#080808] text-gray-300 border-[#333] hover:border-gray-500'
                                            }`}
                                    >
                                        {sku.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-[#222] my-8" />

                {/* Common Scene Settings Reuse */}
                <SceneSettings
                    state={state}
                    setBackground={setBackground}
                    setCustomBackground={setCustomBackground}
                    setCountertop={setCountertop}
                    setCustomCountertop={setCustomCountertop}
                    setReferenceImage={setReferenceImage}
                    setAngle={setAngle}
                    setLighting={setLighting} // Ensuring specific props are passed if needed, though SceneSettings destructures state too
                    photoShootAssets={photoShootAssets}
                    setPhotoShootAssetId={setPhotoShootAssetId}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* 1. The Cocktail (Manual Input & SKU) */}
            <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3 flex justify-between items-center">
                    <span>1. The Cocktail</span>
                    <button
                        onClick={handleBartendersChoice}
                        className="text-[10px] bg-[#222] hover:bg-[#333] border border-[#333] px-3 py-1.5 rounded-full text-[var(--color-yave-gold)] transition-colors flex items-center gap-2 font-bold uppercase tracking-wider"
                    >
                        Inspire Me
                    </button>
                </label>

                {/* Drink Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pt-2 pb-2 border-b border-[#222]">
                    {state.drinks.map((drink, idx) => (
                        <div key={drink.id} className="relative group shrink-0">
                            <button
                                onClick={() => setActiveDrink(idx)}
                                className={`px-4 py-2 rounded-t-lg text-sm font-bold border-b-2 transition-all ${state.activeDrinkIndex === idx
                                    ? 'text-[var(--color-yave-gold)] border-[var(--color-yave-gold)] bg-[#222]'
                                    : 'text-gray-500 border-transparent hover:text-white hover:bg-[#1a1a1a]'
                                    }`}
                            >
                                {drink.customRecipe || `Drink ${idx + 1}`}
                            </button>

                            {/* Remove Drink Button (Always allow removing to reach 0) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDrink(idx);
                                }}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#111] text-gray-400 hover:text-red-500 text-[10px] hidden group-hover:flex items-center justify-center border border-[#333] hover:border-red-500 transition-colors"
                                title="Remove Drink"
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* Add Drink Button */}
                    <button
                        onClick={addDrink}
                        className="w-8 h-8 rounded-full border border-dashed border-[#444] text-gray-500 flex items-center justify-center hover:border-[var(--color-yave-gold)] hover:text-[var(--color-yave-gold)] transition-colors"
                        title="Add Another Drink"
                    >
                        +
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Text Input for Recipe Name */}
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={customRecipe}
                            onChange={(e) => setCustomRecipe(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] text-white text-sm px-4 h-12 rounded-lg focus:border-[var(--color-yave-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--color-yave-gold)] transition-all placeholder:text-[#434343] font-medium"
                            placeholder='Recipe Name (e.g. "Spicy Pineapple Margarita")'
                        />

                        <div className="flex gap-3 items-stretch min-h-[3rem]">
                            <div className="relative flex-1 bg-[#111] border border-[#333] rounded-lg overflow-hidden group focus-within:border-[var(--color-yave-gold)] transition-colors">
                                <textarea
                                    ref={textareaRef}
                                    value={visualDescription}
                                    onChange={(e) => setVisualDescription(e.target.value)}
                                    className="w-full h-full bg-transparent border-none text-white px-4 py-3.5 text-sm focus:ring-0 focus:outline-none transition-all placeholder:text-[#434343] font-medium resize-none overflow-hidden"
                                    placeholder="Visual Description (AI Guide)"
                                    rows={1}
                                />
                                {isDescribing && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-800 overflow-hidden">
                                        <div className="h-full bg-[var(--color-yave-gold)] animate-progress-indeterminate absolute" />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAutoDescribe}
                                disabled={isDescribing || !customRecipe}
                                className="px-6 bg-[var(--color-yave-gold)] hover:bg-[#b08d26] text-black font-bold rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider"
                                title="Auto-Describe visual look from recipe name"
                            >
                                Mixologist
                            </button>
                        </div>
                    </div>

                    {/* SKU Selector */}
                    {/* Bottle Toggles */}
                    <div className="mb-4">
                        <div className="flex items-center gap-6">
                            {/* 1. Include Bottle Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowBottle(!state.showBottle)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out border ${state.showBottle ? 'bg-[var(--color-yave-gold)] border-[var(--color-yave-gold)]' : 'bg-[#111] border-[#333]'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${state.showBottle ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                                <label className="text-sm text-gray-300 cursor-pointer select-none" onClick={() => setShowBottle(!state.showBottle)}>
                                    Include Bottle
                                </label>
                            </div>

                            {/* 2. Bottle Only Mode Toggle (Conditional) */}
                            {state.showBottle && (
                                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300 border-l border-[#333] pl-6">
                                    <button
                                        onClick={() => setBottleOnlyMode(!state.bottleOnlyMode)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out border ${state.bottleOnlyMode ? 'bg-[var(--color-yave-gold)] border-[var(--color-yave-gold)]' : 'bg-[#111] border-[#333]'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${state.bottleOnlyMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                    <label className="text-sm text-gray-300 cursor-pointer select-none" onClick={() => setBottleOnlyMode(!state.bottleOnlyMode)}>
                                        Bottle Only (No Drink)
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SKU Selector (Shown only if Bottle is toggled on) */}
                    {state.showBottle && (
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-2">
                                {state.bottleOnlyMode ? 'Select Bottles (Multi-Select)' : 'Select Bottle'}
                            </p>

                            {/* Official SKUs */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                {TEQUILA_SKUS.map((sku) => {
                                    // Logic: Multi-select always allowed if bottle shown
                                    const isSelected = state.activeBottles.some(b => b.id === sku.id);

                                    // Also check if this is the "Active Drink Base" for highlight distinction?
                                    // For simplicity, we just use Green Dot for "In Scene".
                                    // Maybe Yellow text for "Selected for Drink"? 
                                    const isDrinkBase = selectedSku.id === sku.id;

                                    return (
                                        <div key={sku.id} className="relative">
                                            <div
                                                className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full z-20 pointer-events-none transition-all ${isSelected
                                                    ? 'bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)]'
                                                    : 'bg-[#444] border border-[#222]'
                                                    }`}
                                            />
                                            <button
                                                onClick={() => {
                                                    // Toggle presence
                                                    toggleBottle(sku);
                                                    // If adding (was not selected), also set as drink base
                                                    if (!isSelected) {
                                                        setSku(sku);
                                                    }
                                                }}
                                                className={`w-full px-3 py-2 rounded border text-sm transition-all pl-6 ${isSelected
                                                    ? 'bg-[#1a1a1a] text-white border-[var(--color-yave-gold)] shadow-[0_0_10px_rgba(212,175,55,0.1)] font-bold'
                                                    : 'bg-[#1a1a1a] text-gray-300 border-[#333] hover:border-gray-500'
                                                    }`}
                                            >
                                                {sku.name}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Custom SKUs */}
                            {customBottles.length > 0 && (
                                <>
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-2">Custom Brands</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {customBottles.map((sku) => {
                                            const isSelected = state.activeBottles.some(b => b.id === sku.id);
                                            const isDrinkBase = selectedSku.id === sku.id;

                                            return (
                                                <div key={sku.id} className="relative">
                                                    <div
                                                        className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full z-20 pointer-events-none transition-all ${isSelected
                                                            ? 'bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)]'
                                                            : 'bg-[#444] border border-[#222]'
                                                            }`}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            toggleBottle(sku);
                                                            if (!isSelected) setSku(sku);
                                                        }}
                                                        className={`w-full px-3 py-2 rounded border text-sm transition-all truncate pl-6 ${isSelected
                                                            ? 'bg-[#1a1a1a] text-white border-[var(--color-yave-gold)] shadow-[0_0_10px_rgba(212,175,55,0.1)] font-bold'
                                                            : 'bg-[#1a1a1a] text-gray-300 border-[#333] hover:border-gray-500'
                                                            }`}
                                                        title={sku.name}
                                                    >
                                                        {sku.name}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div >

            {/* 2. The Chill (Ice) - Moved here for Drink grouping */}
            < div >
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    2. The Chill (Ice)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {ICE_OPTIONS.map((i) => (
                        <div key={i.id} className="relative">
                            <button
                                onClick={() => setIce(i)}
                                className={`w-full h-16 rounded-lg px-4 flex items-center justify-between border-2 transition-all ${ice.id === i.id
                                    ? 'bg-[#1a1a1a] border-[var(--color-yave-gold)] text-[var(--color-yave-gold)]'
                                    : 'bg-transparent border-[#333] text-gray-400 hover:border-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <span className="text-sm font-bold">{i.name}</span>
                                {ice.id === i.id && <span className="text-lg">❄️</span>}
                            </button>

                            {/* Quantity Dropdown (Only show if this ice is selected and not 'No Ice') */}
                            {ice.id === i.id && i.id !== 'none' && (
                                <div className="absolute top-1/2 right-12 -translate-y-1/2">
                                    <select
                                        value={iceQuantity}
                                        onChange={(e) => setIceQuantity(e.target.value as any)}
                                        className="bg-[#111] text-gray-300 text-[10px] px-2 py-1 rounded border border-[#444] focus:border-[var(--color-yave-gold)] focus:outline-none mr-2 appearance-none text-center"
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
            </div >

            {/* 3. Finishing Touch (Garnish) - Moved here for Drink grouping */}
            < div >
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    3. Finishing Touch (Garnish)
                </label>

                {/* Custom Garnish Modal Overlay */}
                {showGarnishModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGarnishModal(false)}>
                        <div className="bg-[#111] border border-[#333] rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>

                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222]">
                                <h3 className="text-xl font-bold text-white">
                                    {selectedGarnishToAdd ? `Place ${selectedGarnishToAdd.name}` : (activeSection ? activeSection : 'Select Garnish Category')}
                                </h3>
                                <button onClick={() => setShowGarnishModal(false)} className="text-gray-500 hover:text-white">✕</button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto custom-scrollbar p-1">

                                {/* LEVEL 1: SECTIONS */}
                                {!activeSection && !selectedGarnishToAdd && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Array.from(new Set(GARNISHES.map(g => g.section))).map((section) => (
                                            <button
                                                key={section}
                                                onClick={() => setActiveSection(section)}
                                                className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] transition-all text-left group"
                                            >
                                                <span className="block text-[var(--color-yave-gold)] text-lg mb-1 group-hover:scale-110 transition-transform origin-left">
                                                    {section === 'Citrus' && '🍋'}
                                                    {section === 'Fruit' && '🍒'}
                                                    {section === 'Herbs & Greens' && '🌿'}
                                                    {section === 'Vegetables & Savory' && '🥒'}
                                                    {section === 'Spices, Salts & Sugars' && '🌶️'}
                                                    {section === 'Edible Flowers & Specialty' && '🌸'}
                                                    {section === 'Fun & Retro' && '⛱️'}
                                                </span>
                                                <span className="text-sm font-bold text-white">{section}</span>
                                            </button>
                                        ))}

                                        {/* CUSTOM Option */}
                                        <button
                                            onClick={() => setActiveSection('Custom' as any)}
                                            className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] transition-all text-left group"
                                        >
                                            <span className="block text-[var(--color-yave-gold)] text-lg mb-1 group-hover:scale-110 transition-transform origin-left">
                                                ✨
                                            </span>
                                            <span className="text-sm font-bold text-white">Custom Garnish</span>
                                        </button>
                                    </div>
                                )}

                                {/* LEVEL 2: CUSTOM INPUT */}
                                {activeSection === 'Custom' as any && !selectedGarnishToAdd && (
                                    <div className="space-y-4">
                                        <button onClick={() => setActiveSection(null)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-2">
                                            ← Back to Categories
                                        </button>
                                        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
                                            <label className="block text-sm font-bold text-white mb-2">What garnish are you adding?</label>
                                            <input
                                                type="text"
                                                value={customGarnishInput}
                                                onChange={(e) => setCustomGarnishInput(e.target.value)}
                                                className="w-full bg-black border border-[#444] text-white px-4 py-3 rounded-lg focus:border-[var(--color-yave-gold)] focus:outline-none mb-4"
                                                placeholder="e.g. Flaming Lime Peel"
                                                autoFocus
                                            />
                                            <button
                                                disabled={!customGarnishInput.trim()}
                                                onClick={() => {
                                                    setSelectedGarnishToAdd({ id: `custom-${Date.now()}`, name: customGarnishInput, section: 'Fun & Retro' });
                                                    setCustomGarnishInput('');
                                                }}
                                                className="w-full py-3 bg-[var(--color-yave-gold)] text-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next: Positioning →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* LEVEL 2: ITEMS IN SECTION */}
                                {activeSection && !selectedGarnishToAdd && (
                                    <div className="space-y-4">
                                        <button onClick={() => setActiveSection(null)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-2">
                                            ← Back to Categories
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                            {GARNISHES
                                                .filter(g => g.section === activeSection)
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map((g) => (
                                                    <button
                                                        key={g.id}
                                                        onClick={() => setSelectedGarnishToAdd(g)}
                                                        className="px-4 py-3 rounded-lg bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222] text-sm font-medium text-left border border-transparent hover:border-[var(--color-yave-gold)] transition-all"
                                                    >
                                                        {g.name}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* LEVEL 3: PLACEMENT SELECTION */}
                                {selectedGarnishToAdd && (
                                    <div className="space-y-4">
                                        <button onClick={() => setSelectedGarnishToAdd(null)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mb-2">
                                            ← Back to {activeSection}
                                        </button>

                                        {/* Toothpick Toggle & Config */}
                                        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mb-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-bold text-white flex items-center gap-2">
                                                    📍 Skewer on a Pick?
                                                </span>
                                                <button
                                                    onClick={() => setToothpickMode(!toothpickMode)}
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${toothpickMode ? 'bg-[var(--color-yave-gold)]' : 'bg-[#333]'}`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${toothpickMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>

                                            {toothpickMode && (
                                                <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-2 duration-200">
                                                    {(['Wood', 'Metal', 'Decorative'] as const).map((style) => (
                                                        <button
                                                            key={style}
                                                            onClick={() => setToothpickStyle(style)}
                                                            className={`text-xs py-2 rounded-lg border transition-all ${toothpickStyle === style
                                                                ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] font-bold'
                                                                : 'bg-[#222] text-gray-400 border-[#333] hover:border-gray-500'
                                                                }`}
                                                        >
                                                            {style}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-[var(--color-yave-gold)]/10 rounded-xl border border-[var(--color-yave-gold)] mb-4 text-center">
                                            <span className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] mb-1">Positioning</span>
                                            <span className="text-lg font-bold text-white">Where should the {selectedGarnishToAdd.name} go?</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {GARNISH_PLACEMENTS.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleGarnishSelection(selectedGarnishToAdd, p.id)}
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-[#333] hover:border-[var(--color-yave-gold)] hover:bg-[#222] transition-all text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-black border border-[#333] flex items-center justify-center text-xl">
                                                        {p.id === 'rim' && '🍸'}
                                                        {p.id === 'in-glass' && '🧊'}
                                                        {p.id === 'floating' && '🌊'}
                                                        {p.id === 'side' && '👉'}
                                                        {p.id === 'around' && '🔄'}
                                                        {p.id === 'scattered' && '✨'}
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-white text-sm">{p.label}</span>
                                                        <span className="block text-xs text-gray-500">
                                                            {p.id === 'rim' && 'Perched on the rim'}
                                                            {p.id === 'in-glass' && 'Floating/mixed inside'}
                                                            {p.id === 'floating' && 'Floating on top'}
                                                            {p.id === 'side' && 'Placed next to glass'}
                                                            {p.id === 'around' && 'Arranged around base'}
                                                            {p.id === 'scattered' && 'Casually strewn about'}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Garnish Button */}
                <button
                    onClick={openGarnishModal}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-[#333] text-gray-400 font-bold uppercase tracking-widest text-xs hover:border-[var(--color-yave-gold)] hover:text-[var(--color-yave-gold)] transition-all mb-6 flex items-center justify-center gap-2 group"
                >
                    <span className="inline-flex w-6 h-6 rounded-full bg-[#222] text-gray-400 group-hover:bg-[var(--color-yave-gold)] group-hover:text-black items-center justify-center transition-colors">+</span>
                    Add Garnish
                </button>

                {/* Selected Garnishes List (Configuration) */}
                {
                    garnishes.length > 0 && (
                        <div className="space-y-3 mb-6 bg-[#111] p-4 rounded-xl border border-[#222]">
                            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Selected Garnishes & Placement</h4>
                            {garnishes.map((g) => (
                                <div key={g.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex-1 text-sm font-medium text-white">{g.name}</div>

                                    {/* Qty Input */}
                                    <div className="w-12">
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={g.quantity || 1}
                                            onChange={(e) => updateGarnishQuantity(g.id, parseInt(e.target.value) || 1)}
                                            className="w-full bg-[#222] text-white text-xs px-2 py-1.5 rounded border border-[#444] focus:border-[var(--color-yave-gold)] focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </div>

                                    <select
                                        value={g.placement}
                                        onChange={(e) => updateGarnishPlacement(g.id, e.target.value as any)}
                                        className="bg-[#222] text-gray-300 text-xs px-2 py-1.5 rounded border border-[#444] focus:border-[var(--color-yave-gold)] focus:outline-none"
                                    >
                                        {GARNISH_PLACEMENTS.map(p => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeGarnish(g.id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                }

            </div >

            <div className="h-px bg-[#222] my-8" />

            <SceneSettings
                state={state}
                setBackground={setBackground}
                setCustomBackground={setCustomBackground}
                setCountertop={setCountertop}
                setCustomCountertop={setCustomCountertop}
                setReferenceImage={setReferenceImage}
                setAngle={setAngle}
                setLighting={setLighting}
                photoShootAssets={photoShootAssets}
                setPhotoShootAssetId={setPhotoShootAssetId}
            />

            <ConfirmDialog
                isOpen={drinkToDelete !== null}
                title="Remove Last Drink?"
                message="This will switch the scene to 'Bottle Only' mode since there are no mixed drinks left. Is that what you want?"
                confirmText="Yes, Remove It"
                onConfirm={() => {
                    if (drinkToDelete !== null) {
                        removeDrink(drinkToDelete);
                        setDrinkToDelete(null);
                    }
                }}
                onCancel={() => setDrinkToDelete(null)}
            />
        </div>
    );
}

// Extracted Component for Reuse
function SceneSettings({ state, setBackground, setCustomBackground, setCountertop, setCustomCountertop, setReferenceImage, setAngle, setLighting, photoShootAssets = [], setPhotoShootAssetId }: any) {
    const { background, countertop, customBackground, customCountertop, referenceImage, angle, lighting, activePhotoShootAssetId } = state;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isBgLocked = referenceImage || activePhotoShootAssetId;

    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <div className="h-px bg-[#333] flex-grow" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#666]">Scene Settings</span>
                <div className="h-px bg-[#333] flex-grow" />
            </div>

            {/* 4. Photo Shoot Backgrounds (NEW) */}
            <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3 flex justify-between">
                    <span>4. Photo Shoot Backgrounds</span>
                    {activePhotoShootAssetId && <span className="text-xs text-green-500">Active</span>}
                </label>

                {(!photoShootAssets || photoShootAssets.length === 0) ? (
                    <div className="text-xs text-gray-400 italic bg-[#1a1a1a] p-3 rounded text-center border border-[#333] border-dashed">
                        No photo shoot assets available. Upload them in Settings.
                    </div>
                ) : (
                    <div className="grid grid-cols-6 gap-2">
                        <button
                            onClick={() => setPhotoShootAssetId(null)}
                            className={`relative aspect-[4/5] rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${!activePhotoShootAssetId ? 'border-[var(--color-yave-gold)] bg-[#1a1a1a]' : 'border-[#333] hover:border-[#555] bg-[#111]'}`}
                        >
                            <span className="text-xs text-gray-400 font-bold">None</span>
                        </button>
                        {photoShootAssets.map((asset: any) => (
                            <button
                                key={asset.id}
                                onClick={() => setPhotoShootAssetId(asset.id)}
                                className={`relative aspect-[4/5] rounded-lg border-2 overflow-hidden group transition-all ${activePhotoShootAssetId === asset.id ? 'border-[var(--color-yave-gold)]' : 'border-[#333] hover:border-[#555]'}`}
                            >
                                <img src={asset.imagePath} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" alt={asset.name} />
                                <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-[9px] text-white truncate text-center">
                                    {asset.name}
                                </div>
                                {activePhotoShootAssetId === asset.id && (
                                    <div className="absolute top-1 right-1 bg-[var(--color-yave-gold)] rounded-full p-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 5. Shot Style Selector */}
            <div className={`mb-8 transition-all duration-300 ${referenceImage ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    5. Shot Style (Camera Angle)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {ANGLES.map((a: any) => {
                        if (a.id === 'match-asset' && !activePhotoShootAssetId) return null;

                        return (
                            <button
                                key={a.id}
                                onClick={() => setAngle(a)}
                                className={`p-3 rounded-lg border text-left transition-all ${angle?.id === a.id
                                    ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                    : 'bg-[#111] text-gray-400 border-[#333] hover:border-gray-500 hover:text-white'
                                    }`}
                            >
                                <span className="block text-xs font-bold">{a.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 6. Lighting Mood Selector */}
            <div className={`mb-8 transition-all duration-300 ${referenceImage ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    6. Lighting Mood
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {LIGHTING_MOODS.map((L: any) => {
                        if (L.id === 'match-asset' && !activePhotoShootAssetId) return null;
                        const isSelected = lighting?.id === L.id;

                        return (
                            <button
                                key={L.id}
                                onClick={() => setLighting(L)}
                                className={`p-3 rounded-lg border text-left transition-all ${isSelected
                                    ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                    : 'bg-[#111] text-gray-400 border-[#333] hover:border-gray-500 hover:text-white'
                                    }`}
                            >
                                <span className="block text-xs font-bold">{L.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 7. Inspiration (Reference Image) */}
            <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    7. Inspiration (Reference Image)
                </label>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="reference-upload"
                        />
                        <label
                            htmlFor="reference-upload"
                            className="flex items-center justify-center gap-3 w-full h-16 border-2 border-dashed border-[#333] rounded-lg text-gray-400 hover:border-[var(--color-yave-gold)] hover:text-[var(--color-yave-gold)] transition-all cursor-pointer bg-[#080808]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                            <span className="text-xs uppercase tracking-wider font-bold">Upload Mood Image</span>
                        </label>
                    </div>
                    {referenceImage && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-yave-gold)] group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                            <button
                                onClick={() => setReferenceImage(null)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                    Upload an image to guide the style, lighting, or composition of the scene.
                </p>
            </div>

            {/* Atmosphere (Background) */}
            <div className={`mb-8 transition-all duration-300 ${isBgLocked ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold">
                        Atmosphere (Background)
                    </label>
                    {isBgLocked && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Overridden by {referenceImage ? 'Reference Image' : 'Photo Asset'}</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {BACKGROUNDS.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => { setBackground(bg); setCustomBackground(''); }}
                            className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all group ${(!customBackground && background.id === bg.id)
                                ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                : 'border-[#333] hover:border-gray-500'
                                }`}
                        >
                            {bg.texturePath ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={bg.texturePath} alt={bg.name} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div
                                    className="absolute inset-0 w-full h-full"
                                    style={{ backgroundColor: bg.colorCode || '#111' }}
                                />
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                            <span className="absolute bottom-2 left-2 text-xs font-medium text-white shadow-black drop-shadow-md">
                                {bg.name}
                            </span>
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    value={customBackground || ''}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className={`w-full bg-[#111] border ${customBackground ? 'border-[var(--color-yave-gold)]' : 'border-[#333]'} text-white px-4 py-3 rounded-lg focus:border-[var(--color-yave-gold)] focus:outline-none transition-all placeholder:text-gray-600`}
                    placeholder="Or describe your own atmosphere..."
                />
            </div>

            {/* Surface (Countertop) */}
            <div className={`transition-all duration-300 ${isBgLocked ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold">
                        Surface (Countertop)
                    </label>
                    {isBgLocked && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Overridden by {referenceImage ? 'Reference Image' : 'Photo Asset'}</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {COUNTERTOPS.map((ct) => (
                        <button
                            key={ct.id}
                            onClick={() => { setCountertop(ct); setCustomCountertop(''); }}
                            className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all group ${(!customCountertop && countertop.id === ct.id)
                                ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                : 'border-[#333] hover:border-gray-500'
                                }`}
                        >
                            {ct.texturePath ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={ct.texturePath} alt={ct.name} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-[#222]" />
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                            <span className="absolute bottom-2 left-2 text-xs font-medium text-white shadow-black drop-shadow-md">
                                {ct.name}
                            </span>
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    value={customCountertop || ''}
                    onChange={(e) => setCustomCountertop(e.target.value)}
                    className={`w-full bg-[#111] border ${customCountertop ? 'border-[var(--color-yave-gold)]' : 'border-[#333]'} text-white px-4 py-3 rounded-lg focus:border-[var(--color-yave-gold)] focus:outline-none transition-all placeholder:text-gray-600`}
                    placeholder="Or describe your own surface..."
                />
            </div>
        </>
    );
}
