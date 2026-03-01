'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'error' | 'success' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'error') => {
        const id = nextId++;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 6000);
    }, []);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto max-w-sm px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right duration-300 flex items-start gap-3 ${
                            t.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-200' :
                            t.type === 'success' ? 'bg-green-950/90 border-green-800 text-green-200' :
                            'bg-[#1a1a1a]/90 border-[#333] text-gray-200'
                        }`}
                    >
                        <span className="text-lg flex-shrink-0">
                            {t.type === 'error' ? '\u26A0' : t.type === 'success' ? '\u2713' : '\u24D8'}
                        </span>
                        <p className="text-sm flex-1">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="text-gray-500 hover:text-white flex-shrink-0"
                            aria-label="Dismiss"
                        >
                            \u2715
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
