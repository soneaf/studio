'use client';

import { useState } from 'react';
import { CAMERA_TYPES, LENSES, APERTURES, ISOS, SHUTTERS, CameraOption } from '@/lib/data';
import { useBuilder } from '@/lib/builder-context';
import { Info, X } from 'lucide-react';

const TooltipLabel = ({ label, text }: { label: string, text: string }) => (
    <div className="flex items-center gap-1.5 mb-2 group relative w-fit">
        <label className="text-[10px] text-[var(--color-yave-gold)] uppercase tracking-wider font-bold cursor-help">
            {label}
        </label>
        <Info className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors cursor-help" />

        {/* Tooltip */}
        <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-[#0a0a0a] border border-[#333] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
            <p className="text-xs text-gray-300 leading-relaxed font-medium normal-case tracking-normal">
                {text}
            </p>
            {/* Arrow */}
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#0a0a0a] border-r border-b border-[#333] rotate-45" />
        </div>
    </div>
);

export default function CameraSelector() {
    const { state, setCamera, setCameraSettings } = useBuilder();
    const { camera, cameraSettings } = state;
    const [previewCamera, setPreviewCamera] = useState<CameraOption | null>(null);

    const handleCardClick = (cam: CameraOption) => {
        setCamera(cam);
        setPreviewCamera(cam);
    };

    const closePreview = () => {
        setPreviewCamera(null);
    };

    return (
        <div className="w-full">
            {/* Preview Modal */}
            {previewCamera && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closePreview}
                >
                    <div
                        className="relative max-w-2xl w-full mx-4 bg-[#111] rounded-2xl border border-[#333] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closePreview}
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-[#444] hover:border-[#666] transition-all group"
                        >
                            <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </button>

                        {/* Preview Image */}
                        {previewCamera.previewImage && (
                            <div className="aspect-[4/3] w-full bg-black">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewCamera.previewImage}
                                    alt={previewCamera.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Details */}
                        <div className="p-6 border-t border-[#222]">
                            <h3 className="text-2xl font-bold text-[var(--color-yave-gold)] mb-2">
                                {previewCamera.name}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {previewCamera.description}
                            </p>
                            {previewCamera.group && (
                                <div className="mt-3 inline-block px-3 py-1 bg-[#1a1a1a] rounded-full text-xs text-gray-500 uppercase tracking-wider">
                                    {previewCamera.group}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {CAMERA_TYPES.map((cam) => {
                    const isSelected = camera.id === cam.id;

                    return (
                        <button
                            key={cam.id}
                            onClick={() => handleCardClick(cam)}
                            className={`
                                relative aspect-[4/3] rounded-xl border-2 text-left flex flex-col justify-end p-6 overflow-hidden group transition-all
                                ${isSelected
                                    ? 'border-[var(--color-yave-gold)] shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                                    : 'border-[#333] hover:border-gray-500 bg-[#111]'
                                }
                            `}
                        >
                            {/* Background Preview Image (Fades in) */}
                            {cam.previewImage && (
                                <div className="absolute inset-0 z-0 bg-black">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={cam.previewImage}
                                        alt={cam.name}
                                        className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${isSelected ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}`}
                                    />
                                    {/* Gradient overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                </div>
                            )}

                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)] z-20" />
                            )}

                            {/* Content */}
                            <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                                <div className={`text-xl font-bold mb-1 ${isSelected ? 'text-[var(--color-yave-gold)]' : 'text-white'}`}>
                                    {cam.name}
                                </div>
                                <div className="text-xs text-gray-400 font-medium tracking-wide">
                                    {cam.description}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Advanced Settings Toggle */}
            <div className="pt-6 border-t border-[#333]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <label className="text-sm uppercase tracking-widest text-[#888] font-bold">
                            Advanced Camera Settings
                        </label>
                        <span className="text-xs text-gray-500 mt-1">Override auto-settings with manual lens and exposure controls</span>
                    </div>

                    <button
                        onClick={() => setCameraSettings({ enabled: !cameraSettings.enabled })}
                        className={`
                            relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none border border-[#444]
                            ${cameraSettings.enabled ? 'bg-[var(--color-yave-gold)] border-[var(--color-yave-gold)]' : 'bg-[#111]'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                                ${cameraSettings.enabled ? 'translate-x-7' : 'translate-x-1'}
                            `}
                        />
                    </button>
                </div>

                {cameraSettings.enabled && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#111] p-6 rounded-xl border border-[#333] animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Lens */}
                        <div>
                            <TooltipLabel
                                label="Focal Length"
                                text="Controls how 'zoomed in' the photo looks. Lower numbers (Wide) see more of the room. Higher numbers (Portrait) zoom in on the subject."
                            />
                            <select
                                value={cameraSettings.lens}
                                onChange={(e) => setCameraSettings({ lens: e.target.value })}
                                className="w-full bg-[#1a1a1a] text-white text-xs border border-[#333] rounded-lg px-3 py-2.5 focus:border-[var(--color-yave-gold)] focus:outline-none appearance-none cursor-pointer hover:border-[#555] transition-colors"
                            >
                                {LENSES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        {/* Aperture */}
                        <div>
                            <TooltipLabel
                                label="Aperture"
                                text="Controls background blur. Lower numbers (like f/1.8) make the background blurry and dreamy. Higher numbers (like f/11) keep everything in focus."
                            />
                            <select
                                value={cameraSettings.aperture}
                                onChange={(e) => setCameraSettings({ aperture: e.target.value })}
                                className="w-full bg-[#1a1a1a] text-white text-xs border border-[#333] rounded-lg px-3 py-2.5 focus:border-[var(--color-yave-gold)] focus:outline-none appearance-none cursor-pointer hover:border-[#555] transition-colors"
                            >
                                {APERTURES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        {/* Shutter */}
                        <div>
                            <TooltipLabel
                                label="Shutter Speed"
                                text="Controls motion. Fast speeds (1/1000s) freeze action like splashes. Slow speeds (1/30s) make moving things look blurry."
                            />
                            <select
                                value={cameraSettings.shutter}
                                onChange={(e) => setCameraSettings({ shutter: e.target.value })}
                                className="w-full bg-[#1a1a1a] text-white text-xs border border-[#333] rounded-lg px-3 py-2.5 focus:border-[var(--color-yave-gold)] focus:outline-none appearance-none cursor-pointer hover:border-[#555] transition-colors"
                            >
                                {SHUTTERS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        {/* ISO */}
                        <div>
                            <TooltipLabel
                                label="ISO Sensitivity"
                                text="Controls image brightness and quality. Low ISO (100) is crisp and clean. High ISO (3200) is brighter but adds a grainy, vintage look."
                            />
                            <select
                                value={cameraSettings.iso}
                                onChange={(e) => setCameraSettings({ iso: e.target.value })}
                                className="w-full bg-[#1a1a1a] text-white text-xs border border-[#333] rounded-lg px-3 py-2.5 focus:border-[var(--color-yave-gold)] focus:outline-none appearance-none cursor-pointer hover:border-[#555] transition-colors"
                            >
                                {ISOS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
