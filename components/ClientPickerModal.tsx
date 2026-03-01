import { type Client } from '@/app/settings-actions';

interface ClientPickerProps {
    clients: Client[];
    activeClientId: string | null;
    onSelect: (id: string | null) => void;
    onClose: () => void;
}

export default function ClientPickerModal({ clients, activeClientId, onSelect, onClose }: ClientPickerProps) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-[#111] border border-[#333] w-full max-w-md rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#0a0a0a]">
                    <h2 className="text-xl font-black text-white italic tracking-tighter uppercase relative z-10">
                        Select Client
                        <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-[var(--color-yave-gold)] opacity-50"></span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-[#222] rounded-lg p-2 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    <button
                        onClick={() => { onSelect(null); onClose(); }}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between group mb-1 ${activeClientId === null
                            ? 'bg-[var(--color-yave-gold)] border-[var(--color-yave-gold)] text-black'
                            : 'bg-transparent border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                            }`}
                    >
                        <span className="font-bold uppercase tracking-wide text-sm">Global Library</span>
                        {activeClientId === null && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                    </button>

                    <div className="h-px bg-[#222] my-2 mx-2"></div>

                    {clients.length === 0 ? (
                        <p className="text-center text-gray-600 text-xs italic py-4">No clients added yet.</p>
                    ) : (
                        clients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => { onSelect(client.id); onClose(); }}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between group mb-1 ${activeClientId === client.id
                                    ? 'bg-[var(--color-yave-gold)] border-[var(--color-yave-gold)] text-black'
                                    : 'bg-transparent border-transparent text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                                    }`}
                            >
                                <span className="font-bold text-sm">{client.name}</span>
                                {activeClientId === client.id && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                )}
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 bg-[#0a0a0a] border-t border-[#222] text-xs text-gray-500 text-center">
                    Manage clients in Settings &gt; Clients
                </div>
            </div>
        </div>
    );
}
