'use client';

import Image from 'next/image';

interface VariationsGalleryProps {
    imagePaths: string[];
    onSelect: (path: string) => void;
    onClose: () => void;
}

export default function VariationsGallery({ imagePaths, onSelect, onClose }: VariationsGalleryProps) {
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
            role="dialog" aria-modal="true" aria-label="Image Variations"
            onClick={onClose}
        >
            <div
                className="relative max-w-6xl w-full bg-[#0a0a0a] border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-[#222] flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-[var(--color-yave-gold)]">Director Mode</span>
                            <span className="text-gray-600">/</span>
                            Variations
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Select the best shot to finalize and save.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#222] rounded-full transition-colors text-gray-500 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {/* Grid */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {imagePaths.map((path, index) => (
                            <div
                                key={index}
                                className="group relative aspect-[4/5] w-full bg-[#111] rounded-xl overflow-hidden border border-[#333] hover:border-[var(--color-yave-gold)] transition-all cursor-pointer"
                                onClick={() => onSelect(path)}
                            >
                                <Image
                                    src={path}
                                    alt={`Variation ${index + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <button className="bg-[var(--color-yave-gold)] text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-lg hover:bg-white">
                                        Select This Shot
                                    </button>
                                </div>

                                {/* Index Badge */}
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white border border-white/10">
                                    VAR_0{index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
