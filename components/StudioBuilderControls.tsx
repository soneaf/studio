'use client';

import { useState, useEffect } from 'react';
import { useBuilder } from '@/lib/builder-context';
import { BACKGROUNDS, COUNTERTOPS, LIGHTING_MOODS, ANGLES, CAMERA_TYPES } from '@/lib/data';
import { ChevronRight, Check } from 'lucide-react';
import { getSettings, type PhotoShootAsset, type GeneralProduct } from '@/app/settings-actions';

interface StudioBuilderControlsProps {
    onGenerate?: () => void;
    isGenerating?: boolean;
}

export default function StudioBuilderControls({ onGenerate, isGenerating }: StudioBuilderControlsProps) {
    const {
        state,
        toggleProduct,
        toggleProductVariant,
        setBackground,
        setCountertop,
        setLighting,
        setAngle,
        setCamera,
        setCustomBackground,
        setCustomCountertop,
        setCustomLighting,
        setCustomAngle,
        setPhotoShootAssetId
    } = useBuilder();

    const [products, setProducts] = useState<GeneralProduct[]>([]);
    const [photoShootAssets, setPhotoShootAssets] = useState<PhotoShootAsset[]>([]);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    // Fetch Products & Assets
    useEffect(() => {
        getSettings().then(settings => {
            if (settings.generalProducts) {
                setProducts(settings.generalProducts);
            }
            if (settings.photoShootAssets) {
                setPhotoShootAssets(settings.photoShootAssets);
            }
        });
    }, []);

    const isBgLocked = !!state.activePhotoShootAssetId;

    return (
        <div className="flex flex-col h-full bg-[#111] overflow-y-auto custom-scrollbar p-6">

            {/* 1. STUDIO PRODUCTS */}
            <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    1. Studio Products
                </label>

                {products.length === 0 ? (
                    <div className="text-xs text-gray-400 italic bg-[#1a1a1a] p-3 rounded text-center border border-[#333] border-dashed">
                        Go to Settings &gt; Studio Assets to upload one.
                    </div>
                ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {products.map(prod => {
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
                                <div key={prod.id} className="relative flex flex-col gap-1 z-10 group">
                                    {/* Main Button */}
                                    <button
                                        onClick={() => toggleProduct(prod)}
                                        className={`relative w-full aspect-square rounded-xl border-2 overflow-hidden transition-all group ${isSelected ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-[#333] hover:border-[#555]'}`}
                                    >
                                        <div className="absolute inset-0 bg-white/5" />
                                        <img src={`/api/download?path=${encodeURIComponent(displayImage)}`} alt={prod.name} className="w-full h-full object-contain p-2" />

                                        {/* Gold Dot on Card */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)] z-20" />
                                        )}
                                    </button>

                                    {/* Name */}
                                    <div className="text-[10px] text-center truncate w-full text-gray-400 group-hover:text-white transition-colors">{prod.name}</div>

                                    {/* Variant Selector */}
                                    {prod.variants && prod.variants.length > 0 && isSelected && (
                                        <div className="relative">
                                            <button onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === prod.id ? null : prod.id); }} className="w-full text-[9px] bg-[#222] border border-[#333] rounded px-1 py-0.5 text-gray-300 flex items-center justify-between hover:border-gray-500 focus:outline-none focus:border-[var(--color-yave-gold)]">
                                                <span>{variantIds.length} View{variantIds.length !== 1 ? 's' : ''}</span>
                                                <ChevronRight size={8} className="rotate-90" />
                                            </button>
                                            {openDropdownId === prod.id && (
                                                <div className="absolute top-full left-0 w-[140px] bg-[#111] border border-[#333] rounded-lg z-50 p-2 mt-1 shadow-xl">
                                                    {/* Main */}
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
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="h-px bg-[#222] my-8" />

            {/* 2. PHOTO SHOOT BACKGROUNDS */}
            <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3 flex justify-between">
                    <span>2. Photo Shoot Backgrounds</span>
                    {state.activePhotoShootAssetId && <span className="text-xs text-[var(--color-yave-gold)]">Active</span>}
                </label>

                {photoShootAssets.length === 0 ? (
                    <div className="text-xs text-gray-400 italic bg-[#1a1a1a] p-3 rounded text-center border border-[#333] border-dashed">
                        No assets uploaded in Settings.
                    </div>
                ) : (
                    <div className="grid grid-cols-6 gap-2">
                        <button
                            onClick={() => setPhotoShootAssetId(null)}
                            className={`relative aspect-[4/5] rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${!state.activePhotoShootAssetId ? 'border-[var(--color-yave-gold)] bg-[#1a1a1a] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-[#333] hover:border-[#555] bg-[#111]'}`}
                        >
                            <span className="text-xs text-gray-400 font-bold">None</span>
                            {!state.activePhotoShootAssetId && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_5px_var(--color-yave-gold)]" />
                            )}
                        </button>
                        {photoShootAssets.map(asset => (
                            <button
                                key={asset.id}
                                onClick={() => setPhotoShootAssetId(asset.id)}
                                className={`relative aspect-[4/5] rounded-xl border-2 overflow-hidden group transition-all ${state.activePhotoShootAssetId === asset.id ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-[#333] hover:border-[#555]'}`}
                            >
                                <img src={`/api/download?path=${encodeURIComponent(asset.imagePath)}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-[9px] text-white truncate text-center">
                                    {asset.name}
                                </div>
                                {state.activePhotoShootAssetId === asset.id && (
                                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)]" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. SHOT STYLE */}
            <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    3. Shot Style (Camera Angle)
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {ANGLES.map(a => {
                        if (a.id === 'match-asset' && !state.activePhotoShootAssetId) return null;
                        const isSelected = state.angle?.id === a.id;
                        return (
                            <button
                                key={a.id}
                                onClick={() => setAngle(a)}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? 'bg-[#111] border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                    : 'bg-[#161616] text-gray-400 border-[#333] hover:border-[#555] hover:text-white'
                                    }`}
                            >
                                <span className={`block text-xs font-bold ${isSelected ? 'text-white' : ''}`}>{a.label}</span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_5px_var(--color-yave-gold)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 4. LIGHTING MOOD */}
            <div className="mb-8">
                <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold mb-3">
                    4. Lighting Mood
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {LIGHTING_MOODS.map(l => {
                        if (l.id === 'match-asset' && !state.activePhotoShootAssetId) return null;
                        const isSelected = state.lighting?.id === l.id;
                        return (
                            <button
                                key={l.id}
                                onClick={() => setLighting(l)}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                    ? 'bg-[#111] border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                    : 'bg-[#161616] text-gray-400 border-[#333] hover:border-[#555] hover:text-white'
                                    }`}
                            >
                                <span className={`block text-xs font-bold ${isSelected ? 'text-white' : ''}`}>{l.label}</span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_5px_var(--color-yave-gold)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ATMOSPHERE (BACKGROUND) */}
            <div className={`mb-8 transition-all duration-300 ${isBgLocked ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold">
                        Atmosphere (Background)
                    </label>
                    {isBgLocked && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Overridden by Photo Asset</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {BACKGROUNDS.map((bg) => {
                        const isSelected = !state.customBackground && state.background.id === bg.id;
                        return (
                            <button
                                key={bg.id}
                                onClick={() => { setBackground(bg); setCustomBackground(''); }}
                                className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all group ${isSelected
                                    ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                    : 'border-[#333] hover:border-gray-500'
                                    }`}
                            >
                                {bg.texturePath ? (
                                    <img src={bg.texturePath} alt={bg.name} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{ backgroundColor: bg.colorCode || '#111' }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                <span className="absolute bottom-3 left-3 text-xs font-bold text-white shadow-black drop-shadow-md z-10 w-3/4 text-left leading-tight">
                                    {bg.name}
                                </span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)] z-20" />
                                )}
                            </button>
                        );
                    })}
                </div>
                <input
                    type="text"
                    value={state.customBackground || ''}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className={`w-full bg-[#111] border ${state.customBackground ? 'border-[var(--color-yave-gold)]' : 'border-[#333]'} text-white px-4 py-3 rounded-lg focus:border-[var(--color-yave-gold)] focus:outline-none transition-all placeholder:text-gray-600`}
                    placeholder="Or describe your own atmosphere..."
                />
            </div>

            {/* SURFACE (COUNTERTOP) */}
            <div className={`mb-8 transition-all duration-300 ${isBgLocked ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs uppercase tracking-widest text-[var(--color-yave-gold)] font-bold">
                        Surface (Countertop)
                    </label>
                    {isBgLocked && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Overridden by Photo Asset</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {COUNTERTOPS.map((ct) => {
                        const isSelected = !state.customCountertop && state.countertop.id === ct.id;
                        return (
                            <button
                                key={ct.id}
                                onClick={() => { setCountertop(ct); setCustomCountertop(''); }}
                                className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all group ${isSelected
                                    ? 'border-[var(--color-yave-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                    : 'border-[#333] hover:border-gray-500'
                                    }`}
                            >
                                {ct.texturePath ? (
                                    <img src={ct.texturePath} alt={ct.name} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{ backgroundColor: ct.colorCode || '#222' }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                <span className="absolute bottom-3 left-3 text-xs font-bold text-white shadow-black drop-shadow-md z-10 w-3/4 text-left leading-tight">
                                    {ct.name}
                                </span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)] z-20" />
                                )}
                            </button>
                        );
                    })}
                </div>
                <input
                    type="text"
                    value={state.customCountertop || ''}
                    onChange={(e) => setCustomCountertop(e.target.value)}
                    className={`w-full bg-[#111] border ${state.customCountertop ? 'border-[var(--color-yave-gold)]' : 'border-[#333]'} text-white px-4 py-3 rounded-lg focus:border-[var(--color-yave-gold)] focus:outline-none transition-all placeholder:text-gray-600`}
                    placeholder="Or describe your own surface..."
                />
            </div>

        </div>
    );
}
