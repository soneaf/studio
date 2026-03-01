import React from 'react';

type ConfirmDialogProps = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    isDanger?: boolean;
};

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Delete',
    isDanger = true
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
            <div className="bg-[#111] border border-[#333] p-6 rounded-xl max-w-sm w-full shadow-2xl scale-100" onClick={(e) => e.stopPropagation()}>
                <h3 id="confirm-dialog-title" className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-6 py-2 rounded border transition-colors font-bold text-sm uppercase tracking-wider ${isDanger
                            ? 'bg-red-900/20 text-red-500 border-red-900/50 hover:bg-red-900/40 hover:border-red-500'
                            : 'bg-[var(--color-yave-gold)] text-black border-[var(--color-yave-gold)] hover:bg-[#b08d26]'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
