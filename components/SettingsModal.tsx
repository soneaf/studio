'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/Toast';
import { TEQUILA_SKUS, type TequilaSku } from '@/lib/data';
import {
    getSettings,
    saveSettings,
    getHistoryItems,
    bulkDeleteHistory,
    uploadBottleAsset,
    uploadCustomBottle,
    updateCustomBottle,
    deleteCustomBottle,
    type AppSettings,
    uploadGeneralProduct,
    deleteGeneralProduct,
    updateGeneralProduct,
    type GeneralProduct,
    uploadBottleVariant,
    deleteBottleVariant,
    type Client,
    addClient,
    deleteClient,
    resetAppData,
} from '@/app/settings-actions';
import ConfirmDialog from './ConfirmDialog';
import StudioTab from './StudioSettings';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

// Tabs
type Tab = 'preferences' | 'history' | 'assets' | 'studio' | 'photo_assets' | 'file_naming' | 'clients';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<Tab>('preferences');

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" role="dialog" aria-modal="true" aria-label="Settings">
            <div className="bg-[#111] border border-[#333] w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">

                {/* Header */}
                <div className="px-6 py-4 border-b border-[#333] flex justify-between items-center bg-[#0a0a0a]">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-yave-gold)]"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        <h2 className="text-white text-lg font-bold uppercase tracking-wider">Settings</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 bg-[#0f0f0f] border-r border-[#222] p-4 space-y-2">
                        <TabButton id="preferences" label="General" active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} />
                        <TabButton id="clients" label="Clients" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
                        <TabButton id="file_naming" label="File Naming" active={activeTab === 'file_naming'} onClick={() => setActiveTab('file_naming')} />
                        <TabButton id="history" label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                        <TabButton id="assets" label="Bottle Assets" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
                        <TabButton id="studio" label="Studio Products" active={activeTab === 'studio'} onClick={() => setActiveTab('studio')} />
                        <TabButton id="photo_assets" label="Photo Shoot Assets" active={activeTab === 'photo_assets'} onClick={() => setActiveTab('photo_assets')} />
                    </div>

                    {/* Panel */}
                    <div className="flex-1 p-8 overflow-y-auto bg-[#080808]">
                        {activeTab === 'preferences' && <PreferencesTab />}
                        {activeTab === 'clients' && <ClientsTab />}
                        {activeTab === 'file_naming' && <FileNamingTab />}
                        {activeTab === 'history' && <HistoryTab />}
                        {activeTab === 'assets' && <AssetsTab />}
                        {activeTab === 'studio' && <StudioTab viewMode="products" />}
                        {activeTab === 'photo_assets' && <StudioTab viewMode="assets" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabButton({ id, label, active, onClick }: { id: string, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${active
                ? 'bg-[var(--color-yave-gold)] text-black'
                : 'text-gray-400 hover:bg-[#222] hover:text-white'
                }`}
        >
            {label}
        </button>
    );
}

// --- TABS ---

function FileNamingTab() {
    const [builder, setBuilder] = useState<{ type: string, value: string }[]>(Array(6).fill({ type: 'Nothing', value: '' }));
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        getSettings().then(s => {
            if (s.fileNameBuilder && s.fileNameBuilder.length > 0) {
                const filled = [...s.fileNameBuilder];
                while (filled.length < 6) filled.push({ type: 'Nothing', value: '' });
                setBuilder(filled.slice(0, 6));
            }
        });
    }, []);

    const handleChange = (index: number, field: 'type' | 'value', val: string) => {
        const newBuilder = [...builder];
        const currentItem = { ...newBuilder[index] };

        if (field === 'type') {
            currentItem.type = val;
            if (val === 'Dash') currentItem.value = '-';
            else if (val === 'Underscore') currentItem.value = '_';
            else if (val === 'Space') currentItem.value = ' ';
            else if (val === 'Increment') currentItem.value = 'INC';
            else if (val === 'Product Name') currentItem.value = 'PRODUCT_NAME';
            else if (val === 'Nothing') currentItem.value = '';
            else if (val === 'Date') currentItem.value = 'DATE';
            else if (val === 'Custom Text') currentItem.value = currentItem.value === '-' || currentItem.value === '_' || currentItem.value === ' ' || currentItem.value === 'PRODUCT_NAME' || currentItem.value === 'DATE' ? '' : currentItem.value;
        } else {
            currentItem.value = val;
        }

        newBuilder[index] = currentItem;
        setBuilder(newBuilder);
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        const settings = await getSettings();
        await saveSettings({ ...settings, fileNameBuilder: builder });
        setSaving(false);
        setStatus('Saved!');
        setTimeout(() => setStatus(null), 2000);
    };

    const preview = builder
        .filter(b => b.type !== 'Nothing')
        .map(b => {
            if (b.type === 'Increment') return '001';
            if (b.type === 'Custom Increment') return '001';
            if (b.type === 'Product Name') return 'Mango_Tequila_Blanco';
            if (b.type === 'Date') return new Date().toISOString().split('T')[0];
            return b.value;
        })
        .join('');

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div>
                <h3 className="text-2xl font-bold text-[var(--color-yave-gold)] mb-2">Assign Dataset Names</h3>
                <p className="text-gray-400 text-sm">Configure how generated images are named.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {builder.map((field, i) => (
                    <div key={i} className="space-y-2 bg-[#111] p-4 rounded-lg border border-[#222]">
                        <label className="text-xs text-gray-500 font-bold uppercase">Field {i + 1}</label>
                        <select
                            value={field.type}
                            onChange={(e) => handleChange(i, 'type', e.target.value)}
                            className="w-full bg-[#222] border border-[#333] text-white rounded px-3 py-2 text-sm focus:border-[var(--color-yave-gold)] outline-none"
                        >
                            <option value="Custom Text">Custom Text</option>
                            <option value="Product Name">Product Name</option>
                            <option value="Date">Date</option>
                            <option value="Dash">Dash</option>
                            <option value="Underscore">Underscore</option>
                            <option value="Space">Space</option>
                            <option value="Increment">Increment</option>
                            <option value="Custom Increment">Custom Increment</option>
                            <option value="Nothing">Nothing</option>
                        </select>
                        <input
                            type="text"
                            value={field.value === 'PRODUCT_NAME' ? '[Product Name]' : field.value === 'DATE' ? '[Date]' : field.value}
                            onChange={(e) => handleChange(i, 'value', e.target.value)}
                            disabled={['Dash', 'Underscore', 'Space', 'Increment', 'Nothing', 'Product Name', 'Date'].includes(field.type)}
                            className={`w-full bg-[#1a1a1a] border border-[#333] text-white rounded px-3 py-2 text-sm outline-none ${['Dash', 'Underscore', 'Space', 'Increment', 'Nothing', 'Product Name', 'Date'].includes(field.type) ? 'opacity-50 cursor-not-allowed' : 'focus:border-[var(--color-yave-gold)]'}`}
                            placeholder={field.type === 'Nothing' ? '' : 'Value...'}
                        />
                    </div>
                ))}
            </div>

            <div className="bg-[#111] p-4 rounded-lg border border-[#333]">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Preview</p>
                <div className="font-mono text-lg text-white break-all">
                    {preview || <span className="text-gray-600">(Empty)</span>}.png
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-[var(--color-yave-gold)] text-black font-bold uppercase tracking-wider rounded-lg hover:bg-[#d4af37] transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Configuration'}
                </button>
                {status && <span className="text-green-500 font-bold animate-pulse">{status}</span>}
            </div>
        </div>
    );
}

function PreferencesTab() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<AppSettings>({ outputFolder: '', autoSave: false });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        const res = await saveSettings(settings);
        setSaving(false);
        if (res.success) {
            setStatus("Settings saved successfully.");
            setTimeout(() => setStatus(null), 3000);
        } else {
            setStatus("Error: " + res.error);
        }
    };

    return (
        <div className="max-w-xl space-y-8">
            <div>
                <h3 className="text-white text-lg font-bold mb-4">Auto-Save Configuration</h3>
                <p className="text-gray-400 text-sm mb-6">
                    Automatically save generated images to a specific folder on your computer.
                </p>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoSave}
                            onChange={e => setSettings({ ...settings, autoSave: e.target.checked })}
                            className="w-5 h-5 accent-[var(--color-yave-gold)]"
                        />
                        <span className="text-gray-200 text-sm font-bold">Enable Auto-Save</span>
                    </label>

                    <div className="space-y-2">
                        <label className="block text-xs uppercase text-gray-500 font-bold">Output Folder (Absolute Path)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={settings.outputFolder}
                                onChange={e => setSettings({ ...settings, outputFolder: e.target.value })}
                                placeholder="/Users/username/Pictures/Yave"
                                className="flex-1 bg-[#111] border border-[#333] rounded px-4 py-3 text-white text-sm focus:border-[var(--color-yave-gold)] focus:outline-none"
                            />
                        </div>
                        <p className="text-[10px] text-gray-600">
                            Enter the full system path where images should be saved.
                        </p>
                    </div>
                </div>
            </div>



            <div className="pt-4 border-t border-[#222]">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[var(--color-yave-gold)] text-black font-bold uppercase tracking-wider px-6 py-3 rounded hover:opacity-90 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
                {status && <p className={`mt-2 text-sm ${status.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{status}</p>}
            </div>

            <div className="pt-8 border-t border-[#222]">
                <h3 className="text-red-500 text-sm font-bold uppercase mb-2">Danger Zone</h3>
                <p className="text-gray-500 text-xs mb-4">Resetting the app will delete all history, custom bottles, studio products, and photo shoot assets. This cannot be undone.</p>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="bg-red-900/30 border border-red-900 text-red-500 font-bold uppercase tracking-wider px-6 py-3 rounded hover:bg-red-900/50 hover:text-white transition-colors text-xs"
                    >
                        Reset to Default Settings
                    </button>
                    <ConfirmDialog
                        isOpen={showResetConfirm}
                        title="Reset App Data"
                        message="ARE YOU SURE? This will wipe all data and cannot be undone."
                        confirmText="Reset Everything"
                        isDanger={true}
                        onConfirm={async () => {
                            setShowResetConfirm(false);
                            setSaving(true);
                            const res = await resetAppData();
                            setSaving(false);
                            if (res.success) {
                                toast("App has been reset.", 'success');
                                window.location.reload();
                            } else {
                                toast("Error: " + res.error);
                            }
                        }}
                        onCancel={() => setShowResetConfirm(false)}
                    />
                </div>
            </div>
        </div >
    );
}

function HistoryTab() {
    const [items, setItems] = useState<any[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const refresh = () => {
        setLoading(true);
        getHistoryItems().then(data => {
            setItems(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        refresh();
    }, []);

    const toggleSelectAll = () => {
        if (selected.size === items.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(items.map(i => i.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const { toast } = useToast();

    const handleConfirmDelete = async () => {
        setShowDeleteConfirm(false);
        const res = await bulkDeleteHistory(Array.from(selected));
        if (res.success) {
            setSelected(new Set());
            refresh();
        } else {
            toast("Failed to delete: " + res.error);
        }
    };

    if (loading) return <div className="text-gray-500">Loading history...</div>;

    return (
        <div className="text-sm">
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete History"
                message={`Are you sure you want to delete ${selected.size} items? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-lg font-bold">Generation History</h3>
                {selected.size > 0 && (
                    <button
                        onClick={handleDeleteClick}
                        className="bg-red-900/50 text-red-200 px-4 py-2 rounded border border-red-900 hover:bg-red-900 hover:text-white transition-colors uppercase text-xs font-bold"
                    >
                        Delete Selected ({selected.size})
                    </button>
                )}
            </div>

            <div className="border border-[#333] rounded-lg overflow-hidden bg-[#0f0f0f]">
                <table className="w-full text-left">
                    <thead className="bg-[#111] text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="p-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={items.length > 0 && selected.size === items.length}
                                    onChange={toggleSelectAll}
                                    className="accent-[var(--color-yave-gold)]"
                                />
                            </th>
                            <th className="p-4 w-20">Preview</th>
                            <th className="p-4">Recipe</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 w-20 text-center">ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                        {items.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-500">No history found.</td></tr>
                        ) : (
                            items.map(item => (
                                <tr key={item.id} className={`hover:bg-[#1a1a1a] transition-colors ${selected.has(item.id) ? 'bg-[#1a1a1a]' : ''}`}>
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                            className="accent-[var(--color-yave-gold)]"
                                        />
                                    </td>
                                    <td className="p-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.imagePath} alt="Thumbnail" className="w-12 h-12 object-cover rounded border border-[#333]" />
                                    </td>
                                    <td className="p-4 text-white font-medium">{item.recipeName}</td>
                                    <td className="p-4 text-gray-400 text-xs">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-gray-600 font-mono text-xs text-center">
                                        {item.id.slice(0, 4).toUpperCase()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


function AssetsTab() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingSku, setEditingSku] = useState<TequilaSku | null>(null);
    const [bottleToDelete, setBottleToDelete] = useState<string | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    const load = () => {
        setLoading(true);
        getSettings().then(s => {
            setSettings(s);
            setLoading(false);
            // If we were editing, finding the updated version would be nice, but clearing edit mode is safer
            setEditingSku(null);
        });
    };

    const refresh = () => {
        getSettings().then(s => {
            setSettings(s);
            if (editingSku && s.customBottles) {
                const updated = s.customBottles.find(b => b.id === editingSku.id);
                if (updated) setEditingSku(updated);
            }
        });
    }

    useEffect(() => {
        load();
    }, []);

    const handleDeleteClick = (id: string) => {
        setBottleToDelete(id);
    }

    const confirmDelete = async () => {
        if (!bottleToDelete) return;
        setEditingSku(null); // Clear edit mode if deleting
        await deleteCustomBottle(bottleToDelete);
        setBottleToDelete(null);
        load();
    };

    if (loading || !settings) return <div className="text-gray-500">Loading assets...</div>;

    const startEdit = (sku: TequilaSku) => {
        setEditingSku(sku);
        // Optional: Scroll to form
        const form = document.getElementById('custom-bottle-form');
        if (form) form.scrollIntoView({ behavior: 'smooth' });
    };

    const filteredBottles = settings.customBottles?.filter(b => (b.clientId || '') === selectedClientId) || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-[#111] p-3 rounded border border-[#333]">
                <span className="text-xs text-gray-500 font-bold uppercase">Managing Collection:</span>
                <select
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value)}
                    className="bg-[#222] text-white border border-[#444] rounded px-3 py-1.5 text-xs outline-none focus:border-[var(--color-yave-gold)] min-w-[200px]"
                >
                    <option value="">Global / Standard Library</option>
                    {settings.clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* OFFICIAL SKUS */}
            <div>
                <h3 className="text-white text-lg font-bold mb-2">Official YaVe Collection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TEQUILA_SKUS.map(sku => (
                        <AssetCard key={sku.id} sku={sku} />
                    ))}
                </div>
            </div>

            {/* CUSTOM BOTTLES */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white text-lg font-bold">Custom Brand Collection</h3>
                </div>

                {(!settings.customBottles || settings.customBottles.length === 0) && (
                    <p className="text-gray-500 text-sm mb-4">No custom bottles added yet.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {filteredBottles.length === 0 && (
                        <p className="col-span-2 text-gray-500 text-sm mb-4">No custom bottles found for this scope.</p>
                    )}
                    {filteredBottles.map(sku => (
                        <AssetCard
                            key={sku.id}
                            sku={sku}
                            isCustom={true}
                            onDelete={() => handleDeleteClick(sku.id)}
                            onEdit={() => startEdit(sku)}
                        />
                    ))}
                </div>

                <div id="custom-bottle-form" className={`p-4 rounded border transition-colors ${editingSku ? 'bg-[#1a1a1a] border-[var(--color-yave-gold)]' : 'bg-[#111] border-[#333]'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className={`font-bold text-sm ${editingSku ? 'text-[var(--color-yave-gold)]' : 'text-white'}`}>
                            {editingSku ? `Edit Custom Bottle: ${editingSku.name}` : `Add Custom Bottle (${selectedClientId ? 'Client' : 'Global'})`}
                        </h4>
                        {editingSku && (
                            <button onClick={() => setEditingSku(null)} className="text-xs text-gray-400 hover:text-white uppercase font-bold">Cancel Edit</button>
                        )}
                    </div>
                    <CustomBottleForm
                        onUploaded={load}
                        onRefresh={refresh}
                        initialData={editingSku}
                        onCancel={() => setEditingSku(null)}
                        clientId={selectedClientId}
                    />
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!bottleToDelete}
                title="Delete Custom Bottle"
                message="Are you sure you want to permanently remove this custom bottle from your library? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setBottleToDelete(null)}
                confirmText="Delete Bottle"
                isDanger={true}
            />
        </div>
    );
}

function CustomBottleForm({ onUploaded, onRefresh, initialData, onCancel, clientId }: { onUploaded: () => void, onRefresh?: () => void, initialData?: TequilaSku | null, onCancel?: () => void, clientId?: string }) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [height, setHeight] = useState<'short' | 'standard' | 'tall'>('standard');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [removeBg, setRemoveBg] = useState(false);
    const [processingBg, setProcessingBg] = useState(false);

    // Reset or Populate when initialData changes
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDesc(initialData.customDescription || '');
            setHeight(initialData.heightCategory || 'standard');
            setFile(null); // File input cannot be pre-set, user must re-upload if changing
        } else {
            setName('');
            setDesc('');
            setHeight('standard');
            setFile(null);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!initialData && (!file || !name)) { toast("Name and Image are required."); return; }
        if (initialData && !name) { toast("Name is required."); return; }
        if (file && file.size > MAX_FILE_SIZE) { toast(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_FILE_SIZE_MB}MB.`); return; }

        setLoading(true);

        let fileToUpload = file;

        if (file && removeBg) {
            setProcessingBg(true);
            try {
                const { removeBackground } = await import('@imgly/background-removal');
                const blob = await removeBackground(file);
                fileToUpload = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_nobg.png", { type: "image/png" });
            } catch (e) {
                console.error(e);
                toast("Background removal failed. Check console.");
                setLoading(false);
                setProcessingBg(false);
                return;
            }
            setProcessingBg(false);
        }

        const fd = new FormData();
        fd.append('name', name);
        fd.append('description', desc);
        fd.append('heightCategory', height);
        if (!initialData && clientId) fd.append('clientId', clientId);

        if (fileToUpload) fd.append('file', fileToUpload);

        let res;
        if (initialData) {
            // Update
            fd.append('id', initialData.id);
            res = await updateCustomBottle(fd);
        } else {
            // Create
            res = await uploadCustomBottle(fd);
        }

        setLoading(false);

        if (res.success) {
            if (!initialData) {
                // Clear form only if adding (edit maintains state or clears via parent)
                setName('');
                setDesc('');
                setHeight('standard');
                setFile(null);
            }
            onUploaded();
        } else {
            toast("Failed: " + res.error);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Brand Name</label>
                    <input
                        className="w-full bg-[#222] border border-[#444] text-white p-2 rounded text-sm outline-none focus:border-[var(--color-yave-gold)] transition-colors"
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Don Julio 1942"
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Visual Description (Label/Glass)</label>
                    <textarea
                        className="w-full bg-[#222] border border-[#444] text-white p-2 rounded text-sm h-20 outline-none focus:border-[var(--color-yave-gold)] transition-colors"
                        value={desc} onChange={e => setDesc(e.target.value)}
                        placeholder="Describe the bottle wording and details for the AI..."
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Bottle Stature (Scale)</label>
                    <select
                        value={height}
                        onChange={(e) => setHeight(e.target.value as 'short' | 'standard' | 'tall')}
                        className="w-full bg-[#222] border border-[#444] text-white p-2 rounded text-sm outline-none focus:border-[var(--color-yave-gold)]"
                    >
                        <option value="short">Short/Stout (e.g. Patron)</option>
                        <option value="standard">Standard (e.g. Casamigos)</option>
                        <option value="tall">Tall/Slender (e.g. 1942)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Upload Image (PNG/JPG)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[#333] file:text-[var(--color-yave-gold)] hover:file:bg-[#444] hover:file:text-white file:transition-colors cursor-pointer"
                    />
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remove-bg-custom"
                            checked={removeBg}
                            onChange={e => setRemoveBg(e.target.checked)}
                            className="accent-[var(--color-yave-gold)]"
                        />
                        <label htmlFor="remove-bg-custom" className="text-xs text-gray-400 select-none cursor-pointer">Remove Background (AI)</label>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-[var(--color-yave-gold)] text-black font-bold uppercase text-xs px-4 py-2 rounded hover:brightness-110 disabled:opacity-50"
                >
                    {loading ? (processingBg ? 'Removing Background...' : (initialData ? 'Saving...' : 'Uploading...')) : (initialData ? 'Save Changes' : 'Add Bottle')}
                </button>
                {initialData && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="ml-3 text-gray-400 font-bold uppercase text-xs hover:text-white"
                    >
                        Cancel
                    </button>
                )}
            </form>

            {/* BOTTLE VARIANTS MANAGER */}
            {initialData && (
                <BottleVariantsManager bottle={initialData} onUpdate={onRefresh || onUploaded} />
            )}
        </div>
    );
}

function AssetCard({ sku, isCustom, onDelete, onEdit }: { sku: TequilaSku, isCustom?: boolean, onDelete?: () => void, onEdit?: () => void }) {
    const { toast } = useToast();
    const [uploading, setUploading] = useState(false);
    // We add a random query param to bust cache after update
    const [cacheBust, setCacheBust] = useState(Date.now());

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        formData.append('skuId', sku.sku); // e.g., 'blanco' (only for official)

        const res = await uploadBottleAsset(formData);

        if (res.success) {
            setCacheBust(Date.now());
        } else {
            toast("Upload failed: " + res.error);
        }
        setUploading(false);
    };

    return (
        <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-4 flex gap-4 items-start">
            <div className="w-16 h-32 relative bg-[#1a1a1a] rounded flex items-center justify-center border border-[#222]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`${sku.bottlePath}?v=${cacheBust}`}
                    alt={sku.name}
                    className="max-w-full max-h-full object-contain"
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-white font-bold">{sku.name}</h4>
                        {isCustom && sku.heightCategory && (
                            <span className="text-[10px] text-gray-500 uppercase font-bold border border-gray-700 rounded px-1 ml-1">{sku.heightCategory}</span>
                        )}
                        {sku.variants && sku.variants.length > 0 && (
                            <span className="text-[9px] bg-[#222] text-gray-400 px-1.5 py-0.5 rounded border border-[#333] ml-2 inline-block">
                                +{sku.variants.length} Variants
                            </span>
                        )}
                    </div>
                    {isCustom && (
                        <div className="flex gap-2">
                            {onEdit && (
                                <button onClick={onEdit} className="text-blue-500 hover:text-blue-300 text-[10px] uppercase font-bold border border-blue-900/50 px-2 py-1 rounded bg-blue-900/20">
                                    EDIT
                                </button>
                            )}
                            {onDelete && (
                                <button onClick={onDelete} className="text-red-500 hover:text-red-300 text-[10px] uppercase font-bold border border-red-900/50 px-2 py-1 rounded bg-red-900/20">
                                    REMOVE
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <p className="text-gray-500 text-xs mb-3">{sku.colorDescription}</p>

                {!isCustom && (
                    <>
                        <input
                            type="file"
                            id={`upload-${sku.id}`}
                            className="hidden"
                            accept="image/png"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        <label
                            htmlFor={`upload-${sku.id}`}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider cursor-pointer border transition-colors ${uploading
                                ? 'bg-gray-800 text-gray-500 border-gray-800 cursor-wait'
                                : 'bg-[#222] text-white border-[#333] hover:border-[var(--color-yave-gold)] hover:text-[var(--color-yave-gold)]'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            {uploading ? 'Uploading...' : 'Replace Image'}
                        </label>
                    </>
                )}

                {isCustom && sku.customDescription && (
                    <div className="mt-2 text-xs text-gray-400 italic bg-[#1a1a1a] p-2 rounded border border-[#333]">
                        &quot;{sku.customDescription.slice(0, 100)}...&quot;
                    </div>
                )}
            </div>
        </div>
    );
}

function BottleVariantsManager({ bottle, onUpdate }: { bottle: TequilaSku, onUpdate: () => void }) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [variantToDelete, setVariantToDelete] = useState<string | null>(null);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('parentId', bottle.id);
        formData.append('name', name);
        formData.append('file', file);

        const res = await uploadBottleVariant(formData);
        setUploading(false);

        if (res.success) {
            setName('');
            setFile(null);
            onUpdate();
        } else {
            toast("Error uploading variant: " + res.error);
        }
    };

    const confirmDeleteVariant = async () => {
        if (!variantToDelete) return;
        const res = await deleteBottleVariant(bottle.id, variantToDelete);
        if (res.success) {
            onUpdate();
        } else {
            toast("Error: " + res.error);
        }
        setVariantToDelete(null);
    };

    return (
        <div className="border-t border-[#333] pt-6 mt-6">
            <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Bottle Variants (Angles)</h5>
            <p className="text-xs text-gray-500 mb-4">Add alternate views (Back, Side, Top) to be used when requested.</p>

            {/* Existing Variants Grid */}
            {bottle.variants && bottle.variants.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {bottle.variants.map(v => (
                        <div key={v.id} className="bg-[#0f0f0f] border border-[#333] rounded p-2 relative group">
                            <div className="aspect-square bg-[#1a1a1a] rounded flex items-center justify-center mb-2 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={v.imagePath} alt={v.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-300 font-bold truncate">{v.name}</span>
                                <button
                                    onClick={() => setVariantToDelete(v.id)}
                                    type="button"
                                    className="text-red-500 hover:text-red-400"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-600 italic mb-4">No variants added yet.</p>
            )}

            {/* Upload Form */}
            <div className="bg-[#1a1a1a] p-3 rounded border border-[#333] flex items-end gap-3">
                <div className="flex-1">
                    <label className="block text-[10px] uppercase text-gray-500 mb-1">Variant Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Back View"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-[#222] border border-[#444] text-white p-1.5 rounded text-xs outline-none focus:border-[var(--color-yave-gold)]"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] uppercase text-gray-500 mb-1">Image File</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="w-full text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-[#333] file:text-white cursor-pointer"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-[#222] text-white border border-[#444] px-3 py-1.5 rounded text-xs font-bold uppercase hover:bg-[#333] hover:border-gray-500 disabled:opacity-50 h-[30px]"
                >
                    {uploading ? '...' : 'Add'}
                </button>
            </div>

            <ConfirmDialog
                isOpen={!!variantToDelete}
                title="Remove Variant"
                message="Are you sure you want to remove this variant?"
                confirmText="Remove"
                isDanger={true}
                onConfirm={confirmDeleteVariant}
                onCancel={() => setVariantToDelete(null)}
            />
        </div>
    );
}

function ClientsTab() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const load = () => getSettings().then(setSettings);
    useEffect(() => { load(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setStatus(null);
        const res = await addClient(name);
        setLoading(false);
        if (res.success) {
            setName('');
            load();
        } else {
            setStatus("Error: " + res.error);
        }
    };

    const handleConfirmDeleteClient = async () => {
        if (!clientToDelete) return;
        await deleteClient(clientToDelete.id);
        setClientToDelete(null);
        load();
    };

    if (!settings) return <div className="text-gray-500">Loading clients...</div>;

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h3 className="text-white text-lg font-bold mb-2">Client Management</h3>
                <p className="text-gray-400 text-sm">Manage client profiles. Switch to a client profile in the main app to manage their specific assets.</p>
            </div>

            <div className="bg-[#111] p-4 rounded border border-[#333]">
                <h4 className="text-white text-sm font-bold uppercase mb-4">Add New Client</h4>
                <form onSubmit={handleAdd} className="flex gap-2">
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Client Name (e.g. Pop Soda)"
                        className="flex-1 bg-[#222] border border-[#444] text-white p-2 rounded text-sm outline-none focus:border-[var(--color-yave-gold)]"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[var(--color-yave-gold)] text-black font-bold uppercase text-xs px-6 py-2 rounded hover:brightness-110 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Client'}
                    </button>
                </form>
                {status && <p className="text-red-400 text-xs mt-2">{status}</p>}
            </div>

            <div className="space-y-4">
                <h4 className="text-white text-sm font-bold uppercase">Active Clients</h4>
                {(!settings.clients || settings.clients.length === 0) && (
                    <p className="text-gray-500 text-sm italic">No clients added.</p>
                )}
                <div className="grid grid-cols-1 gap-2">
                    {settings.clients?.map(client => (
                        <div key={client.id} className="bg-[#0f0f0f] border border-[#333] p-3 rounded flex justify-between items-center group hover:border-[#444] transition-colors">
                            <span className="text-white font-bold">{client.name}</span>
                            <button
                                onClick={() => setClientToDelete(client)}
                                className="text-red-500 text-xs uppercase font-bold border border-red-900/30 px-2 py-1 rounded bg-red-900/10 hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmDialog
                isOpen={!!clientToDelete}
                title="Delete Client"
                message={`Are you sure you want to delete client "${clientToDelete?.name}"? Items associated with this client will be hidden.`}
                confirmText="Delete Client"
                isDanger={true}
                onConfirm={handleConfirmDeleteClient}
                onCancel={() => setClientToDelete(null)}
            />
        </div>
    );
}
