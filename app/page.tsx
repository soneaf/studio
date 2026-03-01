
'use client';

import CocktailBuilderControls from '@/components/CocktailBuilderControls';
import StudioBuilderControls from '@/components/StudioBuilderControls';
import GeneratedResult from '@/components/GeneratedResult';
import { BuilderProvider, useBuilder } from '@/lib/builder-context';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CAMERA_TYPES,
  LIGHTING_MOODS,
  ANGLES,
  BACKGROUNDS,
  COUNTERTOPS,
  TEQUILA_SKUS,
  GLASSWARE,
  ICE_OPTIONS
} from '@/lib/data';
import { generateCocktailPrompt } from '@/lib/prompt-generator';
import { generateCocktailImage } from '@/app/actions'; // Import server action
import { getSettings, saveToCustomFolder, type AppSettings, type PhotoShootAsset } from '@/app/settings-actions';
import { saveCocktailToCsv } from '@/app/save-csv';
import { buildFileName } from '@/lib/filename-utils';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';
import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load heavy modals — only parsed when actually shown
const SettingsModal = dynamic(() => import('@/components/SettingsModal'), { ssr: false });
const VariationsGallery = dynamic(() => import('@/components/VariationsGallery'), { ssr: false });
const WizardOverlay = dynamic(() => import('@/components/WizardOverlay'), { ssr: false });
const ClientPickerModal = dynamic(() => import('@/components/ClientPickerModal'), { ssr: false });

// Extract image path from a SKU or product (handles both TequilaSku.bottlePath and GeneralProduct.imagePath)
function getItemImagePath(item: Record<string, unknown>): string | undefined {
  return (item.bottlePath as string | undefined) || (item.imagePath as string | undefined);
}

function GenerationOverlay() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-[var(--color-yave-gold)] border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-4 border-4 border-white/20 border-t-[var(--color-yave-gold)] rounded-full animate-spin reverse-spin duration-1000" />
      </div>
      <p className="mt-12 text-[var(--color-yave-gold)] font-mono text-sm uppercase tracking-[0.2em] animate-pulse font-bold">
        Generating Scene...
      </p>
      <p className="mt-3 text-gray-500 font-mono text-xs tabular-nums">
        {mins > 0 ? `${mins}m ` : ''}{secs.toString().padStart(2, '0')}s
      </p>
    </div>
  );
}

function AppContent() {
  const { toast } = useToast();
  // We need to access state to generate the prompt on click
  const { state, setState, resetState, setMode, activeClientId, setClientId } = useBuilder();
  const searchParams = useSearchParams();
  const router = useRouter();
  const remixId = searchParams.get('remixId');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [variationPaths, setVariationPaths] = useState<string[]>([]);
  const [savedData, setSavedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [showClientPicker, setShowClientPicker] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (remixId) {
      loadRemix(remixId);
    }
  }, [remixId]);

  const loadRemix = async (id: string) => {
    try {
      const { getCocktailById } = await import('@/app/read-csv');
      const record = await getCocktailById(id);
      if (!record) return;

      // 1. Map Primitives (Find objects by name/label match)
      const foundMode = (record.mode === 'studio' || record.mode === 'tequila') ? record.mode : 'tequila';

      const camera = CAMERA_TYPES.find(c => c.name === record.camera) || CAMERA_TYPES[0];
      const lighting = LIGHTING_MOODS.find(l => l.label === record.lighting) || LIGHTING_MOODS[0];
      const angle = ANGLES.find(a => a.label === record.angle) || ANGLES[0];
      const background = BACKGROUNDS.find(b => b.name === record.background) || BACKGROUNDS[0];
      const countertop = COUNTERTOPS.find(c => c.name === record.countertop) || COUNTERTOPS[0];

      // 2. Reconstruct Drink
      // Need to parse garnishes string: "Lime Wheel (Side); Salt (Rim)"
      const parsedGarnishes: any[] = [];
      if (record.garnishes && record.garnishes !== 'None') {
        record.garnishes.split(';').forEach(gStr => {
          const match = gStr.trim().match(/^(.*) \((.*)\)$/);
          if (match) {
            const [_, name, placement] = match;
            parsedGarnishes.push({ id: `g-${Date.now()}-${Math.random()}`, name, placement: placement.toLowerCase(), quantity: 1 });
          } else {
            // Fallback for simple names
            parsedGarnishes.push({ id: `g-${Date.now()}-${Math.random()}`, name: gStr.trim(), placement: 'rim', quantity: 1 });
          }
        });
      }

      // SKU
      const sku = TEQUILA_SKUS.find(s => s.name === record.sku) || TEQUILA_SKUS[0];

      // 3. Set State
      setState({
        ...state,
        mode: foundMode,
        camera,
        lighting,
        angle,
        background,
        countertop,
        showBottle: record.showBottle === 'Yes',
        aspectRatio: record.aspectRatio || '4:5',
        selectedAspectRatios: [record.aspectRatio || '4:5'],
        drinks: [{
          id: 'drink-remix',
          customRecipe: record.recipeName,
          selectedSku: sku,
          glassware: GLASSWARE.find(g => g.name === record.glassware) || GLASSWARE[0],
          ice: ICE_OPTIONS.find(i => i.name === record.ice) || ICE_OPTIONS[0],
          iceQuantity: 'Many',
          rocksGlassType: 'Plain',
          garnishes: parsedGarnishes,
          visualDescription: 'Remixed from history', // Or leave empty / auto-fill
          customGlasswareDetail: ''
        }],
        activeDrinkIndex: 0,
        standaloneBottleSku: sku, // Just in case
        // Reset others
        activeProducts: [],
        props: []
      });

      // 4. Open Wizard
      setShowWizard(true);

      // 5. Clean URL (Optional but nice)
      router.replace('/', { scroll: false });

    } catch (e) {
      console.error("Failed to load remix:", e);
    }
  };

  const handleGenerate = async (templatePrompt?: string, templateReferenceImages?: string[]) => {
    setIsGenerating(true);
    setGenerationCount(prev => prev + 1);
    setSavedData(null);
    setError(null);

    // FETCH SETTINGS for filenames and assets
    let settings: AppSettings | null = null;
    let activeAsset: PhotoShootAsset | null = null;

    try {
      settings = await getSettings();
      if (state.activePhotoShootAssetId && settings?.photoShootAssets) {
        activeAsset = settings.photoShootAssets.find(a => a.id === state.activePhotoShootAssetId) || null;
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }

    try {
      // 1. Determine Ratios
      const selectedRatios = state.selectedAspectRatios && state.selectedAspectRatios.length > 0
        ? state.selectedAspectRatios
        : [state.aspectRatio || '4:5'];

      // Identify Master
      const primaryRatio = selectedRatios.includes(state.aspectRatio) ? state.aspectRatio : selectedRatios[0];
      const secondaryRatios = selectedRatios.filter(r => r !== primaryRatio);

      const primaryCleanName = state.drinks.length > 0
        ? (state.drinks[0].customRecipe || 'Cocktail')
        : `Bottle_${state.standaloneBottleSku?.name || 'Shot'}`;

      let baseName = buildFileName(settings || { fileNameBuilder: [], autoSave: false, outputFolder: '' }, primaryCleanName);
      const timeTag = Date.now();

      // Replace increment placeholder with timestamp for uniqueness during generation
      baseName = baseName.replace('{INC}', String(timeTag));

      // --- PHASE 1: Generate Master ---
      console.log(`Generating Master Image (${primaryRatio})...`);

      // Check for JSON Template Override (use direct param first, then fall back to state)
      let masterPrompt: string;
      if (templatePrompt) {
        console.log('📋 Using JSON Template Override Prompt (direct)');
        masterPrompt = templatePrompt;
      } else if (state.templateOverridePrompt) {
        console.log('📋 Using JSON Template Override Prompt (from state)');
        masterPrompt = state.templateOverridePrompt;
      } else {
        // Prepare Prompt Args
        const promptArgs = {
          ...state,
          aspectRatio: primaryRatio,
          angleLabel: state.angle.label,
          photoShootAsset: activeAsset
        };
        masterPrompt = generateCocktailPrompt(promptArgs);
      }

      const masterFilename = `${baseName} - ${primaryRatio.replace(':', '-')}-${timeTag}.png`;

      // Collect Bottle Paths (Inputs)
      let bottlePaths: string[] = [];

      // Check if we're using JSON template mode
      const isUsingTemplate = !!(templatePrompt || state.templateOverridePrompt);

      // Add template reference images (use direct param first, then fall back to state)
      if (templateReferenceImages && templateReferenceImages.length > 0) {
        console.log('📷 Adding template reference images (direct):', templateReferenceImages.length);
        bottlePaths.push(...templateReferenceImages);
      } else if (state.templateReferenceImages && state.templateReferenceImages.length > 0) {
        console.log('📷 Adding template reference images (from state):', state.templateReferenceImages.length);
        bottlePaths.push(...state.templateReferenceImages);
      }

      // Skip mode-based bottle collection if using JSON template
      // 1. Studio Mode Products
      if (!isUsingTemplate && state.mode === 'studio' && state.activeProducts) {
        console.log('🎨 [Studio Mode] Collecting bottle paths from activeProducts:', state.activeProducts.length);
        state.activeProducts.forEach(p => {
          // Main Product (Always include main image if selected, though variant logic might refine)
          // Logic: If 'main' is in variantIds, include root imagePath.
          const vIds = p.variantIds || ['main'];
          if (vIds.includes('main') && p.product.imagePath) {
            console.log('  ✅ Adding Studio product main image:', p.product.imagePath);
            bottlePaths.push(p.product.imagePath);
          }

          // Variants
          if (p.product.variants) {
            vIds.forEach(vid => {
              if (vid !== 'main') {
                const v = p.product.variants!.find(vari => vari.id === vid);
                if (v?.imagePath) {
                  console.log('  ✅ Adding Studio variant image:', v.imagePath);
                  bottlePaths.push(v.imagePath);
                }
              }
            });
          }
        });
      }

      // 2. Tequila Mode: Prioritize Active Bottles (User Selection), Fallback to Drink Default
      else if (!isUsingTemplate && state.mode === 'tequila') {
        // A. Explicit User Selection (via Add Bottles) - PRIORITY
        if (state.activeBottles && state.activeBottles.length > 0) {
          const names = state.activeBottles.map(b => b.name).join(', ');
          console.log(`🍹 [Tequila Mode] Using activeBottles (User Override): ${state.activeBottles.length} bottles selected: [${names}]`);

          state.activeBottles.forEach(b => {
            const path = getItemImagePath(b as Record<string, unknown>);
            if (path) {
              console.log(`  ✅ Adding override bottle (${b.name}):`, path);
              bottlePaths.push(path);
            }
          });
        }
        // B. Default Drink Bottle (only if no override)
        else if (state.drinks.length > 0) {
          console.log('🍹 [Tequila Mode] Using drink default (No override):', state.drinks.length);
          state.drinks.forEach((drink, idx) => {
            const sku = drink.selectedSku;
            if (sku) {
              const path = getItemImagePath(sku as Record<string, unknown>);
              if (path) {
                console.log(`  ✅ Adding drink ${idx + 1} bottle:`, path);
                bottlePaths.push(path);
              }
            }
          });
        }
        // C. Standalone Bottle SKU (bottle-only mode with no drinks)
        else if (state.standaloneBottleSku) {
          const path = getItemImagePath(state.standaloneBottleSku as Record<string, unknown>);
          if (path) {
            console.log(`  ✅ Adding standaloneBottleSku (${state.standaloneBottleSku.name}):`, path);
            bottlePaths.push(path);
          }
        }
      }

      // 3. Fallback: Active Bottles (Legacy/Other Modes)
      else if (!isUsingTemplate && state.activeBottles && state.activeBottles.length > 0) {
        console.log('🍾 [Fallback] Collecting from activeBottles array:', state.activeBottles.length);
        state.activeBottles.forEach(b => {
          const path = getItemImagePath(b as Record<string, unknown>);
          if (path) {
            console.log('  ✅ Adding activeBottle:', path);
            bottlePaths.push(path);
          }
        });
      }

      console.log('📦 Total bottle paths BEFORE deduplication:', bottlePaths.length, bottlePaths);
      // Dedupe
      bottlePaths = [...new Set(bottlePaths)];
      console.log('📦 Total bottle paths AFTER deduplication:', bottlePaths.length, bottlePaths);

      const initialReference = activeAsset?.imagePath || state.referenceImage || undefined;

      const masterResult = await generateCocktailImage(masterPrompt, bottlePaths, initialReference, masterFilename);

      if (!masterResult.success) {
        throw new Error(masterResult.error || 'Failed to generate master image');
      }

      // Save Master
      const drinksSummary = state.drinks.length > 0 ? state.drinks[0].garnishes.map(g => g.name).join(', ') : 'None';

      // Common fields for saving cocktail records
      const baseRecordFields = {
        recipeName: state.drinks.length > 0 ? state.drinks[0].customRecipe || 'Cocktail' : 'Bottle Shot',
        sku: state.drinks.length > 0 ? state.drinks[0].selectedSku.name : (state.standaloneBottleSku?.name || 'Multiple'),
        glassware: state.drinks.length > 0 ? state.drinks[0].glassware.name : 'None',
        ice: state.drinks.length > 0 ? state.drinks[0].ice?.name || 'None' : 'None',
        garnishes: drinksSummary,
        background: activeAsset ? activeAsset.name : (state.customBackground || state.background.name),
        countertop: activeAsset ? 'From Photo Asset' : (state.customCountertop || state.countertop.name),
        showBottle: state.showBottle ? 'Yes' : 'No',
        mode: state.mode,
        productName: state.mode === 'studio' ? state.activeProducts.map(p => p.product.name).join(', ') : undefined,
        lighting: state.customLighting || state.lighting?.label,
        camera: state.camera?.name,
        angle: state.customAngle || state.angle.label,
      };

      const masterRecord = await saveCocktailToCsv({
        ...baseRecordFields,
        timestamp: new Date().toISOString(),
        finalPrompt: masterPrompt,
        aspectRatio: primaryRatio,
        sourceFilename: masterFilename
      });

      const allResults = [{
        ratio: primaryRatio,
        path: masterResult.path,
        savedData: masterRecord
      }];

      // --- PHASE 2: Derivatives ---
      if (secondaryRatios.length > 0) {
        const derivativePromises = secondaryRatios.map(async (ratio) => {
          const dArgs = {
            ...state,
            aspectRatio: ratio,
            angleLabel: state.angle.label,
            photoShootAsset: activeAsset
          };
          const dPrompt = generateCocktailPrompt(dArgs);
          const dFilename = `${baseName} - ${ratio.replace(':', '-')}-${timeTag}.png`;

          const res = await generateCocktailImage(dPrompt, bottlePaths, initialReference, dFilename);
          if (!res.success) return null;

          const rec = await saveCocktailToCsv({
            ...baseRecordFields,
            timestamp: new Date().toISOString(),
            finalPrompt: dPrompt,
            aspectRatio: ratio,
            sourceFilename: dFilename
          });

          return {
            ratio: ratio,
            path: res.path,
            savedData: rec
          };
        });

        const dResults = await Promise.all(derivativePromises);
        dResults.forEach(r => { if (r) allResults.push(r); });
      }

      setSavedData({
        batch: true,
        results: allResults,
        ...allResults[0].savedData
      });

      setShowResult(true);
      setShowWizard(false);

    } catch (e) {
      console.error(e);
      const msg = "Generation failed. " + String(e);
      setError(msg);
      toast(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWizardComplete = (templatePrompt?: string, templateReferenceImages?: string[]) => {
    setShowWizard(false);
    handleGenerate(templatePrompt, templateReferenceImages);
  }

  const handleVariations = async () => {
    setIsGenerating(true); // Re-use main loader for now or create distinct state
    setError(null);

    let activeAsset: PhotoShootAsset | null | undefined = null;
    if (state.activePhotoShootAssetId && settings?.photoShootAssets) {
      activeAsset = settings.photoShootAssets.find(a => a.id === state.activePhotoShootAssetId);
    }

    const prompt = generateCocktailPrompt({
      ...state,
      countertop: state.countertop,
      angleLabel: state.angle.label,
      showBottle: state.showBottle,
      drinks: state.drinks,
      referenceImage: state.referenceImage,
      photoShootAsset: activeAsset
    });

    try {
      let inputImagePaths: string[] = [];
      if (activeAsset) inputImagePaths.push(activeAsset.imagePath);

      if (state.mode === 'studio') {
        if (state.activeProducts) {
          state.activeProducts.forEach(p => {
            const variantIds = p.variantIds || ['main'];
            variantIds.forEach(vid => {
              if (vid === 'main') inputImagePaths.push(p.product.imagePath);
              else if (p.product.variants) {
                const v = p.product.variants.find(va => va.id === vid);
                if (v) inputImagePaths.push(v.imagePath);
              }
            })
          })
        }
      } else {
        if (state.activeBottles && state.activeBottles.length > 0) {
          inputImagePaths = [...inputImagePaths, ...state.activeBottles.map(b => b.bottlePath)];
        } else {
          const path = state.drinks.length > 0 ? (state.showBottle ? state.drinks[0].selectedSku.bottlePath : undefined) : state.standaloneBottleSku.bottlePath;
          if (path) inputImagePaths.push(path);
        }
      }

      // Import this function dynamically or ensure it is imported at top
      const { generateCocktailVariations } = await import('@/app/actions');
      const result = await generateCocktailVariations(prompt, inputImagePaths, state.referenceImage || undefined, 4);

      if (result.success && result.paths) {
        setVariationPaths(result.paths);
        setShowVariations(true);
      } else {
        console.error(result.error);
        toast("Failed to generate variations: " + result.error);
      }

    } catch (e) {
      console.error(e);
      toast("Error generating variations");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariationSelect = async (path: string) => {
    // 1. Promote to Main
    const { promoteVariationToMain } = await import('@/app/actions');
    const promoResult = await promoteVariationToMain(path);

    if (!promoResult.success) {
      toast("Failed to select variation: " + promoResult.error);
      return;
    }

    setShowVariations(false);

    // 2. Save Data & Show Result (Use same logic as handleGenerate)
    // Re-calculate prompt/activeAsset for saving metadata context
    let activeAsset: PhotoShootAsset | null | undefined = null;
    if (state.activePhotoShootAssetId && settings?.photoShootAssets) {
      activeAsset = settings.photoShootAssets.find(a => a.id === state.activePhotoShootAssetId);
    }
    const prompt = generateCocktailPrompt({
      ...state,
      countertop: state.countertop,
      angleLabel: state.angle.label,
      showBottle: state.showBottle,
      drinks: state.drinks,
      referenceImage: state.referenceImage,
      photoShootAsset: activeAsset
    });

    const drinksSummary = state.drinks.length > 0
      ? state.drinks.map((d, i) => {
        const garnishStr = d.garnishes.map(g => `${g.name} (${g.placement})`).join('; ');
        return `[Drink ${i + 1}: ${d.customRecipe} | Glass: ${d.glassware.name} | Ice: ${d.ice.name} | Garnish: ${garnishStr}]`;
      }).join('; ')
      : `[Standalone Bottle Mode: ${state.standaloneBottleSku?.name || 'Bottle'}]`;

    let finalRecipeName = 'Untitled';
    if (state.mode === 'studio') {
      finalRecipeName = state.activeProducts.map(p => p.product.name).join(' + ') || 'Untitled Product';
    } else {
      finalRecipeName = state.drinks.map(d => d.customRecipe).join(' + ') ||
        (state.drinks.length === 0 ? `Bottle: ${state.standaloneBottleSku?.name} ` : 'Untitled Group');
    }

    const saveRes = await saveCocktailToCsv({
      timestamp: new Date().toISOString(),
      recipeName: finalRecipeName,
      sku: state.drinks.length > 0 ? state.drinks.map(d => d.selectedSku.name).join(', ') : (state.standaloneBottleSku?.name || 'Unknown'),
      glassware: state.drinks.length > 0 ? state.drinks.map(d => d.glassware.name).join(', ') : 'None (Bottle Shot)',
      ice: state.drinks.length > 0 ? state.drinks.map(d => d.ice.name).join(', ') : 'N/A',
      garnishes: drinksSummary,
      background: activeAsset ? activeAsset.name : (state.customBackground || state.background.name),
      countertop: activeAsset ? 'From Photo Asset' : (state.customCountertop || state.countertop.name),
      showBottle: state.showBottle ? 'Yes' : 'No',
      finalPrompt: prompt,
      mode: state.mode,
      productName: state.mode === 'studio' ? state.activeProducts.map(p => p.product.name).join(', ') : undefined,
      lighting: state.customLighting || state.lighting?.label,
      camera: state.camera?.name,
      angle: state.customAngle || state.angle.label,
      aspectRatio: state.aspectRatio
    });

    setSavedData(saveRes);
    setShowResult(true);

    const currentSettings = await getSettings(); // fresh fetch
    if (currentSettings.autoSave && currentSettings.outputFolder) {
      const { saveToCustomFolder } = await import('@/app/settings-actions');
      await saveToCustomFolder(finalRecipeName);
    }
  };

  return (
    <>
      {showClientPicker && (
        <ClientPickerModal
          clients={settings?.clients || []}
          activeClientId={activeClientId || null}
          onSelect={(id) => setClientId(id)}
          onClose={() => setShowClientPicker(false)}
        />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showResult && <GeneratedResult savedData={savedData} onClose={() => setShowResult(false)} onRegenerate={handleGenerate} onVariations={handleVariations} />}
      {showVariations && <VariationsGallery imagePaths={variationPaths} onClose={() => setShowVariations(false)} onSelect={handleVariationSelect} />}


      <main className="min-h-screen bg-[var(--background)] selection:bg-[var(--color-yave-gold)] selection:text-black">

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Header */}
          {/* Static Logo Header */}


          {/* Navigation Header */}
          {/* Navigation Header */}
          <nav className="sticky top-0 z-50 bg-black h-20 px-8 flex justify-center transition-all">
            <div className="flex gap-4 h-full">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="h-full px-6 flex items-center justify-center text-gray-400 hover:text-[var(--color-yave-gold)] active:scale-95 transition-all text-sm font-bold uppercase tracking-widest"
              >
                New Image
              </button>

              <a
                href="/history"
                className="h-full px-6 flex items-center justify-center text-gray-400 hover:text-[var(--color-yave-gold)] active:scale-95 transition-all text-sm font-bold uppercase tracking-widest"
              >
                History
              </a>

              <button
                onClick={() => setShowClientPicker(true)}
                className="h-full px-6 flex items-center justify-center text-gray-400 hover:text-[var(--color-yave-gold)] active:scale-95 transition-all text-sm font-bold uppercase tracking-widest"
              >
                Clients
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="h-full px-6 flex items-center justify-center text-gray-400 hover:text-[var(--color-yave-gold)] active:scale-95 transition-all text-sm font-bold uppercase tracking-widest"
              >
                Settings
              </button>
            </div>
          </nav>

          {/* Controls Section */}

          {/* Wizard Section */}
          <section className="mb-12">
            <WizardOverlay
              key={wizardKey}
              onClose={() => { }}
              onComplete={handleWizardComplete}
              inline={true}
            />
          </section>


        </div>

        {/* Persistent Error Banner */}
        {error && !isGenerating && (
          <div className="fixed bottom-0 left-0 right-0 z-[90] bg-red-950/95 border-t border-red-800 px-6 py-3 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
            <p className="text-red-200 text-sm flex items-center gap-2">
              <span className="text-lg">&#x26A0;</span>
              {error}
            </p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white text-sm font-bold uppercase tracking-wider ml-4 flex-shrink-0">
              Dismiss
            </button>
          </div>
        )}

        {/* Full Screen Loading Overlay */}
        {isGenerating && <GenerationOverlay />}
        <ConfirmDialog
          isOpen={showResetConfirm}
          title="Reset Everything?"
          message="Are you sure you want to reset all fields and start over?"
          confirmText="Yes, Reset"
          onConfirm={() => {
            resetState();
            setShowResetConfirm(false);
            setWizardKey(prev => prev + 1);
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      </main>
    </>
  );
}



export default function Home() {
  return (
    <BuilderProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[var(--color-yave-gold)]">Loading Studio...</div>}>
        <AppContent />
      </Suspense>
    </BuilderProvider>
  );
}
