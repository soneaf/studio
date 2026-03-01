'use client';

import { useBuilder } from '@/lib/builder-context';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

import { saveCocktailToCsv } from '@/app/save-csv';
import { generateCocktailPrompt } from '@/lib/prompt-generator';
import { getSettings, saveToCustomFolder, getHistoryItems } from '@/app/settings-actions';
import { buildFileName } from '@/lib/filename-utils';

export default function GeneratedResult({ savedData, onClose, onRegenerate, onVariations }: { savedData: any, onClose?: () => void, onRegenerate?: () => void, onVariations?: () => void }) {
    const { state } = useBuilder(); // Access global state
    const [isOpen, setIsOpen] = useState(true);
    const [activeResultIndex, setActiveResultIndex] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState('/api/download');
    const [isSaved, setIsSaved] = useState(false);
    const [showFullScreen, setShowFullScreen] = useState(false);

    // Determine Active Data (Batch vs Single)
    const isBatch = savedData && savedData.results && savedData.results.length > 0;
    const activeResult = isBatch ? savedData.results[activeResultIndex] : {
        path: '/generated-result.png',
        savedData: savedData,
        ratio: state.aspectRatio
    };

    // Use specific savedData for details if available in batch, else top-level
    const detailsData = activeResult.savedData || savedData;

    useEffect(() => {
        const prepareDownload = async () => {
            if (savedData && (savedData.success || (savedData.results && savedData.results[0].savedData.success))) {
                const settings = await getSettings();

                const primaryName = state.drinks.length > 0 ? (state.drinks[0].customRecipe || 'Cocktail') : `Bottle_${state.standaloneBottleSku?.name || 'Shot'}`;


                let baseName = buildFileName(settings, primaryName);
                baseName = baseName.replace('{INC}', '001'); // Limit increment for direct download

                // Append ratio to filename if batch
                const ratioSuffix = isBatch ? ` - ${activeResult.ratio.replace(':', '-')}` : '';

                const filename = `${baseName}${ratioSuffix}.png`;

                // Point to specific file path
                const sourcePath = activeResult.path; // e.g. /generated-result-16-9.png
                setDownloadUrl(`/api/download?filename=${encodeURIComponent(filename)}&path=${encodeURIComponent(sourcePath)}`);
                setIsSaved(true);
            }
        };
        prepareDownload();
    }, [savedData, state, activeResultIndex, isBatch, activeResult]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={handleClose}
        >
            <div
                className="relative max-w-5xl w-full bg-[#0a0a0a] border border-[#333] rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Image Side */}
                    <div className="relative aspect-square md:aspect-auto md:h-[600px] bg-[#050505] group flex flex-col">
                        <div className="relative flex-1 w-full h-full">
                            <Image
                                src={`/api/download?path=${encodeURIComponent(activeResult.path)}`}
                                alt="Generated Cocktail"
                                fill
                                unoptimized
                                className="object-contain"
                            />
                            <button
                                onClick={() => setShowFullScreen(true)}
                                className="absolute bottom-4 right-4 p-2 bg-black/60 hover:bg-black/90 backdrop-blur-md text-white rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                                title="View Full Screen"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Batch Tabs */}
                        {isBatch && savedData.results.length > 1 && (
                            <div className="bg-[#111] border-t border-[#222] p-2 flex gap-2 overflow-x-auto justify-center">
                                {savedData.results.map((res: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveResultIndex(idx)}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeResultIndex === idx ? 'bg-[var(--color-yave-gold)] text-black' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
                                    >
                                        {res.ratio}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Side */}
                    <div className="p-8 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-[var(--color-yave-gold)] text-black text-xs font-bold uppercase rounded-full">
                                    Generated Success
                                </span>
                                {isSaved && (
                                    <span className="text-gray-500 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Saved to History
                                    </span>
                                )}
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">
                                {state.mode === 'studio'
                                    ? (state.activeProducts && state.activeProducts.length === 1 ? state.activeProducts[0].product.name : 'Studio Product Shot')
                                    : (state.drinks.length === 0
                                        ? `YaVe ${state.standaloneBottleSku?.name || 'Bottle'} Shot`
                                        : (state.drinks.length > 1 ? 'Cocktail Collection' : state.drinks[0].customRecipe || 'Custom Cocktail')
                                    )
                                }
                            </h2>
                            <p className="text-gray-400 mb-6">
                                {state.mode === 'studio'
                                    ? 'High-end commercial studio photography.'
                                    : (state.drinks.length === 0
                                        ? 'Premium Product Photography'
                                        : `Featuring YaVe ${state.drinks[0].selectedSku.name} Tequila.`
                                    )
                                }
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-[#111] rounded-lg border border-[#222]">
                                    <h4 className="text-xs text-[var(--color-yave-gold)] uppercase tracking-widest mb-2">Scene details</h4>
                                    <ul className="text-sm text-gray-300 space-y-1 mb-4 border-b border-[#222] pb-4">
                                        <li><span className="text-gray-500">Background:</span> {detailsData?.background || state.customBackground || state.background.name}</li>
                                        <li><span className="text-gray-500">Surface:</span> {detailsData?.countertop || state.customCountertop || state.countertop.name}</li>
                                        {state.showBottle && <li><span className="text-gray-500">Extras:</span> Bottle Included</li>}
                                        {isBatch && <li><span className="text-gray-500">Ratio:</span> {activeResult.ratio}</li>}
                                    </ul>

                                    <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {state.mode === 'studio' ? (
                                            /* STUDIO MODE DETAILS */
                                            <div className="text-sm">
                                                <h5 className="text-[var(--color-yave-gold)] font-bold mb-1">Studio Products</h5>
                                                {(!state.activeProducts || state.activeProducts.length === 0) ? (
                                                    <p className="text-gray-500 italic">No products selected.</p>
                                                ) : (
                                                    state.activeProducts.map((p, i) => (
                                                        <div key={i} className="mb-2 pl-2 border-l border-[#333]">
                                                            <div className="font-bold text-gray-300">{p.product.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                Variants: {p.variantIds.includes('main') ? 'Main' : ''}
                                                                {p.variantIds.filter(v => v !== 'main').length > 0 && (p.variantIds.includes('main') ? ', ' : '') + `${p.variantIds.filter(v => v !== 'main').length} Extra`}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        ) : (
                                            /* TEQUILA MODE DETAILS */
                                            state.drinks.length === 0 ? (
                                                <div className="text-sm">
                                                    <h5 className="text-[var(--color-yave-gold)] font-bold mb-1">Standalone Bottle</h5>
                                                    <ul className="text-gray-400 space-y-1 pl-2 border-l border-[#333]">
                                                        <li><span className="text-gray-600">Bottle:</span> {state.standaloneBottleSku?.name || 'Selected Bottle'}</li>
                                                        <li><span className="text-gray-600">Focus:</span> Product Shot</li>
                                                    </ul>
                                                </div>
                                            ) : (
                                                state.drinks.map((drink, i) => (
                                                    <div key={i} className="text-sm">
                                                        <h5 className="text-[var(--color-yave-gold)] font-bold mb-1">{drink.customRecipe || `Drink ${i + 1}`}</h5>
                                                        <ul className="text-gray-400 space-y-1 pl-2 border-l border-[#333]">
                                                            <li><span className="text-gray-600">Glass:</span> {drink.glassware.name}</li>
                                                            <li><span className="text-gray-600">Ice:</span> {drink.ice?.name || 'Cube'}</li>
                                                            <li><span className="text-gray-600">Garnish:</span> {drink.garnishes.length > 0 ? drink.garnishes.map(g => g.name).join(', ') : 'None'}</li>
                                                        </ul>
                                                    </div>
                                                ))
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#222] bg-[#1a1a1a]">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-4 rounded-xl border border-[#333] text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-bold flex items-center justify-center gap-2 h-auto min-h-[50px]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
                                    Back to Editor
                                </button>

                                <button
                                    onClick={() => {
                                        if (onRegenerate) {
                                            if (onClose) onClose();
                                            onRegenerate();
                                        }
                                    }}
                                    className="px-4 py-4 rounded-xl border border-[#333] text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm font-bold flex items-center justify-center gap-2 h-auto min-h-[50px]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" /></svg>
                                    Regenerate
                                </button>

                                {onVariations && (
                                    <button
                                        onClick={() => {
                                            if (onClose) onClose();
                                            onVariations();
                                        }}
                                        className="px-4 py-4 rounded-xl border border-[#333] text-gray-300 hover:text-white hover:border-[var(--color-yave-gold)] hover:text-[var(--color-yave-gold)] transition-colors text-sm font-bold flex items-center justify-center gap-2 h-auto min-h-[50px]"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                                        Variations
                                    </button>
                                )}

                                <a
                                    href={downloadUrl}
                                    className={`px-4 py-4 rounded-xl bg-[var(--color-yave-gold)] text-black font-extrabold text-sm shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:bg-[#b08d26] transition-colors flex items-center justify-center gap-2 h-auto min-h-[50px] text-center leading-tight ${onVariations ? '' : 'col-span-2'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    Download Asset
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Full Screen Modal */}
            {showFullScreen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300 focus:outline-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowFullScreen(false);
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setShowFullScreen(false);
                        if (e.key === 'ArrowLeft' && isBatch && activeResultIndex > 0) setActiveResultIndex(prev => prev - 1);
                        if (e.key === 'ArrowRight' && isBatch && activeResultIndex < savedData.results.length - 1) setActiveResultIndex(prev => prev + 1);
                    }}
                    ref={(el) => { if (el) el.focus(); }}
                >
                    <button
                        onClick={() => setShowFullScreen(false)}
                        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors z-[110]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    {/* Navigation Buttons */}
                    {isBatch && activeResultIndex > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveResultIndex(prev => prev - 1);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                    )}

                    {isBatch && activeResultIndex < savedData.results.length - 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveResultIndex(prev => prev + 1);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    )}

                    {/* Image Container */}
                    <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={`/api/download?path=${encodeURIComponent(activeResult.path)}`}
                            alt="Full Screen Result"
                            fill
                            unoptimized
                            className="object-contain"
                        />
                        {/* Caption/Ratio Indicator */}
                        {isBatch && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white/80 text-sm font-bold border border-white/10">
                                {activeResult.ratio} ({activeResultIndex + 1} / {savedData.results.length})
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
