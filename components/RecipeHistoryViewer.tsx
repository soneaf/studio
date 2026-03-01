'use client';

import { useState } from 'react';
import { CocktailRecord } from '@/app/read-csv';
import Image from 'next/image';
import { deleteCocktail } from '@/app/delete-cocktail';
import { generateCocktailImage } from '@/app/actions';
import { saveCocktailToCsv } from '@/app/save-csv';
import { useToast } from '@/components/Toast';

import { useRouter } from 'next/navigation';

export default function RecipeHistoryViewer({ initialData }: { initialData: CocktailRecord[] }) {
    const { toast } = useToast();
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeMode, setActiveMode] = useState<'tequila' | 'studio'>('tequila');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter based on active mode + search
    const filteredData = (initialData || []).filter(item => {
        if ((item.mode || 'tequila') !== activeMode) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.recipeName?.toLowerCase().includes(q) ||
            item.sku?.toLowerCase().includes(q) ||
            item.productName?.toLowerCase().includes(q) ||
            item.garnishes?.toLowerCase().includes(q) ||
            item.background?.toLowerCase().includes(q) ||
            item.lighting?.toLowerCase().includes(q)
        );
    });
    const currentRecipe = filteredData[currentIndex];
    const totalRecipes = filteredData.length;

    // Reset index when filters change
    if (currentIndex >= totalRecipes && totalRecipes > 0) {
        setCurrentIndex(0);
    }

    // Safety fallback removed to allow rendering header even if empty

    const goToNext = () => {
        if (currentIndex < totalRecipes - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        const result = await deleteCocktail(currentRecipe.id);
        setIsDeleting(false);
        setShowDeleteConfirm(false);

        if (result.success) {
            if (currentIndex >= totalRecipes - 1 && currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
            }
        } else {
            toast("Failed to delete: " + result.error);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleRegenerate = async () => {
        if (!currentRecipe || isRegenerating) return;
        setIsRegenerating(true);
        try {
            // Derive bottle path from sku (e.g. "Blanco (Silver)" -> "blanco")
            const skuRaw = currentRecipe.sku?.toLowerCase().replace(/\s*\(.*\)/, '').trim();
            const bottlePaths = skuRaw && skuRaw !== 'none' && skuRaw !== 'n/a'
                ? [`/bottles/${skuRaw}.png`]
                : undefined;

            const timestamp = Date.now();
            const outputFilename = `regenerated-${timestamp}.png`;

            const result = await generateCocktailImage(
                currentRecipe.finalPrompt,
                bottlePaths,
                undefined,
                outputFilename
            );

            if (result.success) {
                // Save to history with original recipe metadata
                await saveCocktailToCsv({
                    timestamp: new Date().toISOString(),
                    recipeName: currentRecipe.recipeName,
                    sku: currentRecipe.sku,
                    glassware: currentRecipe.glassware,
                    ice: currentRecipe.ice,
                    garnishes: currentRecipe.garnishes,
                    background: currentRecipe.background,
                    countertop: currentRecipe.countertop,
                    showBottle: currentRecipe.showBottle,
                    finalPrompt: currentRecipe.finalPrompt,
                    mode: currentRecipe.mode || 'tequila',
                    productName: currentRecipe.productName || undefined,
                    lighting: currentRecipe.lighting || undefined,
                    camera: currentRecipe.camera || undefined,
                    angle: currentRecipe.angle || undefined,
                    aspectRatio: currentRecipe.aspectRatio || undefined,
                    sourceFilename: outputFilename,
                });

                toast('Image regenerated and saved!');
                router.refresh();
            } else {
                toast('Regeneration failed: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            toast('Regeneration failed: ' + String(err));
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 cursor-pointer" onClick={() => router.push('/')}>
            <div className="max-w-4xl mx-auto relative cursor-default" onClick={(e) => e.stopPropagation()}>
                {/* Modal Overlay */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Confirm deletion" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Gold Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[var(--color-yave-gold)] shadow-[0_0_20px_var(--color-yave-gold)]" />

                            <h3 className="text-xl font-bold text-white mb-4 text-center">Confirm Deletion</h3>
                            <p className="text-gray-400 text-center mb-8 leading-relaxed">
                                Are you sure you want to remove <span className="text-[var(--color-yave-gold)] font-bold">{currentRecipe.recipeName}</span> from your history? This action cannot be undone.
                            </p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={cancelDelete}
                                    disabled={isDeleting}
                                    className="px-6 py-3 rounded-full border border-[#333] text-gray-300 font-bold hover:bg-[#222] hover:text-white transition-all uppercase tracking-wider text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="px-6 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] uppercase tracking-wider text-xs flex items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header / Nav */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-[var(--color-yave-gold)] transition-colors group">
                        <div className="w-8 h-8 rounded-full border border-[#333] group-hover:border-[var(--color-yave-gold)] flex items-center justify-center bg-[#111]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Builder</span>
                    </button>

                    {/* Mode Switcher Tabs */}
                    <div className="flex gap-2 bg-[#0f0f0f] border border-[#333] p-1 rounded-full">
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveMode('tequila'); setCurrentIndex(0); }}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeMode === 'tequila' ? 'bg-[var(--color-yave-gold)] text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Tequila
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveMode('studio'); setCurrentIndex(0); }}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all ${activeMode === 'studio' ? 'bg-[var(--color-yave-gold)] text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Studio
                        </button>
                    </div>

                    <div className="text-right">
                        <span className="text-[var(--color-yave-gold)] font-mono font-bold text-xl">
                            {(totalRecipes > 0 ? currentIndex + 1 : 0).toString().padStart(2, '0')}
                        </span>
                        <span className="text-gray-600 font-mono text-sm mx-2">/</span>
                        <span className="text-gray-600 font-mono text-sm">
                            {totalRecipes.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0); }}
                            placeholder="Search by name, product, garnish, setting..."
                            className="w-full bg-[#111] border border-[#333] rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[var(--color-yave-gold)] focus:outline-none transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setCurrentIndex(0); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Empty State for Mode */}
                {totalRecipes === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#111] rounded-3xl border border-[#222]">
                        <div className="text-4xl mb-4 opacity-50">📜</div>
                        <h2 className="text-xl font-bold text-white mb-2">No History in {activeMode === 'tequila' ? 'Tequila' : 'Studio'} Mode</h2>
                        <p className="text-gray-500 mb-6 text-sm">You haven't generated any scenes in this mode yet.</p>
                    </div>
                )}

                {totalRecipes > 0 && currentRecipe && (
                    <div className="bg-[#111] border border-[#333] rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-yave-gold)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        {/* Navigation Arrows */}
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">
                            <button
                                onClick={goToPrev}
                                disabled={currentIndex === 0}
                                className={`p-3 rounded-full bg-black/50 border border-[#333] text-white transition-all ${currentIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[var(--color-yave-gold)] hover:text-black hover:border-[var(--color-yave-gold)]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                        </div>
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">
                            <button
                                onClick={goToNext}
                                disabled={currentIndex === totalRecipes - 1}
                                className={`p-3 rounded-full bg-black/50 border border-[#333] text-white transition-all ${currentIndex === totalRecipes - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[var(--color-yave-gold)] hover:text-black hover:border-[var(--color-yave-gold)]'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>

                        {/* Card Content */}
                        <div className="relative z-0 px-6 md:px-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 key={currentIndex}">

                            {/* Header Row: Date & ID/Delete */}
                            <div className="flex items-center justify-between gap-4 mb-8 relative border-b border-[#333] pb-4">
                                {/* Date Left */}
                                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest text-left" suppressHydrationWarning>
                                    {new Date(currentRecipe.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    <span className="mx-2">•</span>
                                    {new Date(currentRecipe.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {/* ID & Delete Right */}
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3 text-xs font-mono">
                                        <span className="text-gray-600 font-bold tracking-wider uppercase">Generated ID</span>
                                        <span className="text-gray-400">{currentRecipe.id.split('-')[0]}</span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRegenerate();
                                        }}
                                        disabled={isRegenerating}
                                        className="p-2 text-gray-600 hover:text-[var(--color-yave-gold)] hover:bg-[var(--color-yave-gold)]/10 rounded-full transition-all disabled:opacity-40"
                                        title="Regenerate this image"
                                    >
                                        {isRegenerating ? (
                                            <span className="block w-4 h-4 border-2 border-[var(--color-yave-gold)]/30 border-t-[var(--color-yave-gold)] rounded-full animate-spin" />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/?remixId=${currentRecipe.id}`);
                                        }}
                                        className="p-2 text-gray-600 hover:text-[var(--color-yave-gold)] hover:bg-[var(--color-yave-gold)]/10 rounded-full transition-all"
                                        title="Remix this scene"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="M17.8 11.8 19 13" /><path d="M15 9h.01" /><path d="M17.8 6.2 19 5" /><path d="m3 21 9-9" /><path d="M12.2 6.2 11 5" /></svg>
                                    </button>

                                    <a
                                        href={`/api/download?path=${currentRecipe.imagePath}&filename=${encodeURIComponent(
                                            `${currentRecipe.recipeName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_')}_${new Date(currentRecipe.timestamp).toISOString().split('T')[0]}_YAVE-${currentRecipe.id.split('-')[0].toUpperCase()}.png`
                                        )}`}
                                        className="p-2 text-gray-600 hover:text-[var(--color-yave-gold)] hover:bg-[var(--color-yave-gold)]/10 rounded-full transition-all"
                                        title="Download image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    </a>

                                    <button
                                        onClick={handleDeleteClick}
                                        disabled={isDeleting}
                                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                        title="Delete this recipe"
                                    >
                                        {isDeleting ? (
                                            <span className="block w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Hero Section: Title & Image */}
                            <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-12">
                                {/* Title Column (Text Right) */}
                                {/* Title Column (Text Right) */}
                                <div className="flex-1 text-right">
                                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight leading-none">
                                        {currentRecipe.recipeName}
                                    </h1>
                                    <div className="text-xl text-[var(--color-yave-gold)] font-medium">
                                        {currentRecipe.mode === 'studio' ? (
                                            <>Studio Mode <span className="text-white opacity-50">• {currentRecipe.productName || 'Product'}</span></>
                                        ) : (
                                            <>with YaVe {currentRecipe.sku} Tequila</>
                                        )}
                                    </div>
                                </div>

                                {/* Image Column */}
                                <div className="shrink-0">
                                    <div className={`relative w-48 h-48 rounded-xl overflow-hidden border-2 border-[#333] shadow-2xl bg-[#050505] ${!currentRecipe.imagePath ? 'flex items-center justify-center' : ''}`}>
                                        {currentRecipe.imagePath ? (
                                            <Image
                                                src={`/api/download?path=${encodeURIComponent(currentRecipe.imagePath)}&t=${new Date(currentRecipe.timestamp).getTime()}`}
                                                alt={currentRecipe.recipeName}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="text-center p-6">
                                                <div className="text-4xl mb-2">📷</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Meta Grid Section */}
                            <div className="relative mb-8 pt-8 border-t border-[#222]">
                                {/* Centered Labels for visual flair */}
                                {/* Centered Labels for visual flair */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-6 rounded-2xl border border-[#222] bg-black/40">
                                    {currentRecipe.mode === 'studio' ? (
                                        <>
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Camera</span>
                                                <span className="text-lg text-white font-medium">{currentRecipe.camera || 'DSLR'}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Lighting</span>
                                                <span className="text-lg text-white font-medium">{currentRecipe.lighting || '-'}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Angle</span>
                                                <span className="text-lg text-white font-medium">{currentRecipe.angle || '-'}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Aspect</span>
                                                <span className="text-lg text-white font-medium">{currentRecipe.aspectRatio || '4:5'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {(currentRecipe.glassware && currentRecipe.glassware !== 'None' && currentRecipe.glassware !== 'N/A') && (
                                                <div className="text-center">
                                                    <span className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Glassware</span>
                                                    <span className="text-lg text-white font-medium">{currentRecipe.glassware}</span>
                                                </div>
                                            )}
                                            {(currentRecipe.ice && currentRecipe.ice !== 'None' && currentRecipe.ice !== 'N/A' && currentRecipe.ice !== 'No Ice') && (
                                                <div className="text-center">
                                                    <span className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Ice</span>
                                                    <span className="text-lg text-white font-medium">{currentRecipe.ice}</span>
                                                </div>
                                            )}
                                            {(!currentRecipe.finalPrompt.includes('Match the camera angle, perspective, and horizon line of the provided background image')) && (
                                                <>
                                                    <div className="text-center">
                                                        <span className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Setting</span>
                                                        <span className="text-lg text-white font-medium">{currentRecipe.background}</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Surface</span>
                                                        <span className="text-lg text-white font-medium">{currentRecipe.countertop}</span>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Garnish Section (Right Aligned) - Tequila Mode Only */}
                            {currentRecipe.mode !== 'studio' && (
                                <div className="flex justify-end mb-12">
                                    <div className="text-right">
                                        <h3 className="text-xs uppercase text-[var(--color-yave-gold)] font-bold tracking-widest mb-3">Garnish Profile</h3>
                                        <div className="flex justify-end gap-2">
                                            {currentRecipe.garnishes.split(';').map((g, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-[#222] text-gray-300 rounded-lg text-sm border border-[#333]">
                                                    {g.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Prompt Footer */}
                            <div className="text-left bg-[#0a0a0a] rounded-lg border border-[#222] overflow-hidden group relative">
                                <div className="flex items-center justify-between p-3 border-b border-[#222] bg-[#111]">
                                    <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">AI Generation Prompt</div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(currentRecipe.finalPrompt);
                                            // Could add a toast here, but simple text change is fine for now
                                            const btn = document.getElementById('copy-btn-' + currentIndex);
                                            if (btn) {
                                                const original = btn.innerHTML;
                                                btn.innerHTML = '<span class="text-green-500">Copied!</span>';
                                                setTimeout(() => btn.innerHTML = original, 2000);
                                            }
                                        }}
                                        id={`copy-btn-${currentIndex}`}
                                        className="text-[10px] uppercase text-[var(--color-yave-gold)] font-bold tracking-wider hover:text-white transition-colors"
                                    >
                                        Copy Prompt
                                    </button>
                                </div>
                                <div className="p-4 h-32 md:h-48 overflow-y-auto custom-scrollbar">
                                    <p className="text-xs text-gray-400 font-mono leading-relaxed break-words select-text">
                                        {currentRecipe.finalPrompt}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
