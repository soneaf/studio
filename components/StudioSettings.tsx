'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import {
    getSettings,
    uploadGeneralProduct,
    deleteGeneralProduct,
    updateGeneralProduct,
    uploadProductVariant,
    deleteProductVariant,
    uploadPhotoShootAsset,
    deletePhotoShootAsset,
    type GeneralProduct,
    type AppSettings,
    type PhotoShootAsset,
    type Client,
} from '@/app/settings-actions';
import ConfirmDialog from './ConfirmDialog';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function StudioTab({ viewMode = 'products' }: { viewMode?: 'products' | 'assets' }) {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<GeneralProduct | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    const load = () => {
        setLoading(true);
        getSettings().then(s => {
            setSettings(s);
            setLoading(false);
            setEditingProduct(null);
        });
    };

    const refresh = () => {
        getSettings().then(s => {
            setSettings(s);
            if (editingProduct && s.generalProducts) {
                const updated = s.generalProducts.find(p => p.id === editingProduct.id);
                if (updated) setEditingProduct(updated);
            }
        });
    }

    useEffect(() => { load(); }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        await deleteGeneralProduct(itemToDelete);
        setItemToDelete(null);
        load();
    };

    if (loading || !settings) return <div className="text-gray-500">Loading studio assets...</div>;

    const filteredProducts = settings.generalProducts?.filter(p => (p.clientId || '') === selectedClientId) || [];
    const filteredAssets = settings.photoShootAssets?.filter(a => (a.clientId || '') === selectedClientId) || [];

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

            {viewMode === 'products' && (
                <div>
                    <h3 className="text-white text-lg font-bold mb-2">
                        {selectedClientId ? (settings.clients?.find(c => c.id === selectedClientId)?.name || 'Client') : 'Global'} Products
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">Upload generic products (cans, boxes, devices) for Studio Mode.</p>

                    {filteredProducts.length === 0 && (
                        <p className="text-gray-500 text-sm mb-6 bg-[#111] p-4 rounded border border-[#333] border-dashed text-center">
                            No products found in this collection. Add your first {selectedClientId ? 'client' : 'global'} product below.
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {filteredProducts.map(prod => (
                            <div key={prod.id} className="bg-[#0f0f0f] border border-[#333] rounded-xl p-4 flex gap-4 items-start relative group">
                                <div className="w-20 h-20 bg-[#1a1a1a] rounded flex items-center justify-center border border-[#222] p-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={`/api/download?path=${encodeURIComponent(prod.imagePath)}`} alt={prod.name} className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold text-sm truncate">{prod.name}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prod.description}</p>
                                    {prod.variants && prod.variants.length > 0 && (
                                        <span className="inline-block mt-2 text-[9px] bg-[#222] text-gray-400 px-1.5 py-0.5 rounded border border-[#333]">
                                            +{prod.variants.length} Variants
                                        </span>
                                    )}
                                    <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingProduct(prod)}
                                            className="text-[10px] uppercase font-bold text-blue-400 border border-blue-900/50 px-2 py-1 rounded hover:bg-blue-900/20"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setItemToDelete(prod.id)}
                                            className="text-[10px] uppercase font-bold text-red-400 border border-red-900/50 px-2 py-1 rounded hover:bg-red-900/20"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`p-4 rounded border transition-colors ${editingProduct ? 'bg-[#1a1a1a] border-[var(--color-yave-gold)]' : 'bg-[#111] border-[#333]'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className={`font-bold text-sm ${editingProduct ? 'text-[var(--color-yave-gold)]' : 'text-white'}`}>
                                {editingProduct ? `Edit Product: ${editingProduct.name}` : `Add New ${selectedClientId ? 'Client' : 'Global'} Product`}
                            </h4>
                            {editingProduct && (
                                <button onClick={() => setEditingProduct(null)} className="text-xs text-gray-400 hover:text-white uppercase font-bold">Cancel</button>
                            )}
                        </div>
                        <ProductForm
                            initialData={editingProduct}
                            onSuccess={load}
                            onRefresh={refresh}
                            onCancel={() => setEditingProduct(null)}
                            clientId={selectedClientId}
                        />
                    </div>
                </div>
            )}

            {viewMode === 'assets' && (
                <PhotoShootAssetsManager
                    assets={filteredAssets}
                    onRefresh={refresh}
                    clientId={selectedClientId}
                    clientName={selectedClientId ? (settings.clients?.find(c => c.id === selectedClientId)?.name) : 'Global'}
                />
            )}

            <ConfirmDialog
                isOpen={!!itemToDelete}
                title="Delete Product"
                message="Are you sure? This cannot be undone."
                confirmText="Delete"
                isDanger={true}
                onConfirm={confirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    );
}

function PhotoShootAssetsManager({ assets, onRefresh, clientId, clientName }: { assets: PhotoShootAsset[], onRefresh: () => void, clientId?: string, clientName?: string }) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

    const validateFile = (f: File | null) => {
        if (f && f.size > MAX_FILE_SIZE) {
            toast(`File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_FILE_SIZE_MB}MB.`);
            return false;
        }
        return true;
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !file) return;
        if (!validateFile(file)) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', file);
        if (clientId) formData.append('clientId', clientId);

        const res = await uploadPhotoShootAsset(formData);
        setUploading(false);

        if (res.success) {
            setName('');
            setFile(null);
            onRefresh();
        } else {
            toast("Error: " + res.error);
        }
    };

    const confirmDeleteAsset = async () => {
        if (!assetToDelete) return;
        const res = await deletePhotoShootAsset(assetToDelete);
        if (res.success) {
            onRefresh();
        } else {
            toast("Error: " + res.error);
        }
        setAssetToDelete(null);
    };

    return (
        <div>
            <h3 className="text-white text-lg font-bold mb-2">Photo Shoot Assets</h3>
            <p className="text-xs text-gray-500 mb-6">Upload real photo shoot backgrounds. The AI will place products into these scenes with strict adherence to perspective, lighting, and detail.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {assets.map(asset => (
                    <div key={asset.id} className="bg-[#0f0f0f] border border-[#333] rounded p-2 group relative">
                        <div className="aspect-[4/5] bg-[#1a1a1a] rounded mb-2 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/api/download?path=${encodeURIComponent(asset.imagePath)}`} alt={asset.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-gray-300 truncate">{asset.name}</span>
                            <button onClick={() => setAssetToDelete(asset.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleUpload} className="bg-[#111] p-4 rounded border border-[#333] flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/3">
                    <label className="block text-[10px] uppercase text-gray-500 mb-1">Asset Name</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-[#222] border border-[#444] text-white p-2 rounded text-xs outline-none focus:border-[var(--color-yave-gold)]"
                        placeholder="e.g. Luxury Kitchen Counter"
                        value={name} onChange={e => setName(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-1/3">
                    <label className="block text-[10px] uppercase text-gray-500 mb-1">Image File</label>
                    <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-[#333] file:text-white cursor-pointer"
                    />
                </div>
                <button
                    type="submit"
                    disabled={uploading}
                    className="w-full md:w-auto bg-[var(--color-yave-gold)] text-black font-bold uppercase text-xs px-6 py-2 rounded hover:brightness-110 disabled:opacity-50 h-[34px]"
                >
                    {uploading ? 'Uploading...' : 'Add Asset'}
                </button>
            </form>

            <ConfirmDialog
                isOpen={!!assetToDelete}
                title="Delete Asset"
                message="Are you sure you want to delete this background asset? This cannot be undone."
                confirmText="Delete"
                isDanger={true}
                onConfirm={confirmDeleteAsset}
                onCancel={() => setAssetToDelete(null)}
            />
        </div>
    );
}

function ProductForm({ initialData, onSuccess, onRefresh, onCancel, clientId }: { initialData?: GeneralProduct | null, onSuccess: () => void, onRefresh?: () => void, onCancel: () => void, clientId?: string }) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [removeBg, setRemoveBg] = useState(false);
    const [processingBg, setProcessingBg] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDesc(initialData.description);
            setFile(null);
        } else {
            setName('');
            setDesc('');
            setFile(null);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', desc);
        if (fileToUpload) formData.append('file', fileToUpload);
        if (initialData) formData.append('id', initialData.id);
        if (!initialData && clientId) formData.append('clientId', clientId); // Only set clientId on creation

        const res = initialData
            ? await updateGeneralProduct(formData)
            : await uploadGeneralProduct(formData);

        setLoading(false);
        if (res.success) {
            if (!initialData) {
                setName(''); setDesc(''); setFile(null); // Reset if add
                onSuccess();
            } else {
                onSuccess(); // Reload list
            }
        } else {
            toast("Error: " + res.error);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Product Name</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-[#222] border border-[#444] text-white p-2 rounded text-sm outline-none focus:border-[var(--color-yave-gold)]"
                        placeholder="e.g. Energy Drink Can"
                        value={name} onChange={e => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Description (Material/Texture)</label>
                    <textarea
                        required
                        className="w-full bg-[#222] border border-[#444] text-white p-2 rounded text-sm h-20 outline-none focus:border-[var(--color-yave-gold)]"
                        placeholder="e.g. Matte black aluminum can with refreshing water droplets..."
                        value={desc} onChange={e => setDesc(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Product Image {initialData && '(Optional update)'}</label>
                    <input
                        type="file"
                        accept="image/*"
                        required={!initialData}
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[#333] file:text-[var(--color-yave-gold)] hover:file:bg-[#444] hover:file:text-white file:transition-colors cursor-pointer"
                    />
                    <div className="mt-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remove-bg-studio"
                            checked={removeBg}
                            onChange={e => setRemoveBg(e.target.checked)}
                            className="accent-[var(--color-yave-gold)]"
                        />
                        <label htmlFor="remove-bg-studio" className="text-xs text-gray-400 select-none cursor-pointer">Remove Background (AI)</label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    {initialData && (
                        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white text-xs font-bold uppercase">Back</button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[var(--color-yave-gold)] text-black font-bold uppercase text-xs px-6 py-2 rounded hover:brightness-110 disabled:opacity-50"
                    >
                        {loading ? (processingBg ? 'Removing Background...' : 'Saving...') : (initialData ? 'Update Product' : 'Add Product')}
                    </button>
                </div>
            </form>

            {/* VARIANTS MANAGER (Only show when editing) */}
            {initialData && (
                <VariantsManager product={initialData} onUpdate={onRefresh || onSuccess} />
            )}
        </div>
    );
}

function VariantsManager({ product, onUpdate }: { product: GeneralProduct, onUpdate: () => void }) {
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
        formData.append('parentId', product.id);
        formData.append('name', name);
        formData.append('file', file);

        const res = await uploadProductVariant(formData);
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
        const res = await deleteProductVariant(product.id, variantToDelete);
        if (res.success) {
            onUpdate();
        } else {
            toast("Error: " + res.error);
        }
        setVariantToDelete(null);
    };

    return (
        <div className="border-t border-[#333] pt-6 mt-6">
            <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Product Variants (Angles)</h5>
            <p className="text-xs text-gray-500 mb-4">Add alternate views (Back, Side, Top) to be used when requested.</p>

            {/* Existing Variants Grid */}
            {product.variants && product.variants.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {product.variants.map(v => (
                        <div key={v.id} className="bg-[#0f0f0f] border border-[#333] rounded p-2 relative group">
                            <div className="aspect-square bg-[#1a1a1a] rounded flex items-center justify-center mb-2 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={`/api/download?path=${encodeURIComponent(v.imagePath)}`} alt={v.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-300 font-bold truncate">{v.name}</span>
                                <button
                                    onClick={() => setVariantToDelete(v.id)}
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
            <form onSubmit={handleUpload} className="bg-[#1a1a1a] p-3 rounded border border-[#333] flex items-end gap-3">
                <div className="flex-1">
                    <label className="block text-[10px] uppercase text-gray-500 mb-1">Variant Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Back View"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-[#222] border border-[#444] text-white p-1.5 rounded text-xs outline-none focus:border-[var(--color-yave-gold)]"
                        required
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] uppercase text-gray-500 mb-1">Image File</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="w-full text-[10px] text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-[#333] file:text-white cursor-pointer"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={uploading}
                    className="bg-[#222] text-white border border-[#444] px-3 py-1.5 rounded text-xs font-bold uppercase hover:bg-[#333] hover:border-gray-500 disabled:opacity-50 h-[30px]"
                >
                    {uploading ? '...' : 'Add'}
                </button>
            </form>

            <ConfirmDialog
                isOpen={!!variantToDelete}
                title="Delete Variant"
                message="Are you sure you want to delete this variant image? This cannot be undone."
                confirmText="Delete"
                isDanger={true}
                onConfirm={confirmDeleteVariant}
                onCancel={() => setVariantToDelete(null)}
            />
        </div>
    );
}
