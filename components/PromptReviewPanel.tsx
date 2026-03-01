'use client';

import { useBuilder } from '@/lib/builder-context';
import { generateCocktailPrompt } from '@/lib/prompt-generator';
import { useState, useEffect } from 'react';

export default function PromptReviewPanel() {
    const { state } = useBuilder();
    const [prompt, setPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Auto-update prompt when state changes, unless user is editing
    useEffect(() => {
        if (!isEditing) {
            const newPrompt = generateCocktailPrompt({
                ...state,
                angleLabel: state.angle.label,
                drinks: state.drinks
            });
            setPrompt(newPrompt);
        }
    }, [state, isEditing]);

    return (
        <div className="mt-8 bg-[#111] border border-[#333] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#222] flex items-center justify-between bg-[#0f0f0f]">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-yave-gold)] shadow-[0_0_8px_var(--color-yave-gold)]" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Scene Prompt
                    </h3>
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-gray-500 font-mono">Props: {state.props?.length || 0}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Actions: {state.sceneActions?.length || 0}</span>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`text-xs px-3 py-1 rounded border transition-colors ${isEditing
                            ? 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] font-bold'
                            : 'text-gray-400 border-[#333] hover:text-white'
                            }`}
                    >
                        {isEditing ? 'Unlock Auto-Gen' : 'Edit Prompt'}
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => {
                            setPrompt(e.target.value);
                            if (!isEditing) setIsEditing(true);
                        }}
                        className="w-full h-64 bg-[#080808] border border-[#333] rounded-lg p-4 text-sm text-gray-300 font-mono leading-relaxed focus:outline-none focus:border-[var(--color-yave-gold)] focus:ring-1 focus:ring-[var(--color-yave-gold)] resize-none"
                    />
                    {!isEditing && (
                        <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-mono pointer-events-none">
                            AUTO-GENERATED
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleCopy}
                        className={`bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded text-xs font-mono border border-[#333] transition-colors ${copied ? 'text-green-400 border-green-900' : ''}`}
                    >
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                </div>
            </div>
        </div>
    );
}
