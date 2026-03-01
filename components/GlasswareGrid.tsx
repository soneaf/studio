'use client';

import Image from 'next/image';
import { GLASSWARE } from '@/lib/data';
import { useBuilder } from '@/lib/builder-context';

export default function GlasswareGrid() {
    const { state, updateDrink, setRocksGlassType, setCustomGlasswareDetail } = useBuilder();

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {GLASSWARE.map((glass) => {
                // Find all drinks that use this glassware
                const assignedDrinks = state.drinks.filter(d => d.glassware.id === glass.id);
                const isActive = assignedDrinks.length > 0;

                // Handle assigning a drink to this glass via dropdown
                const handleDrinkAssignment = (drinkId: string) => {
                    const drinkIndex = state.drinks.findIndex(d => d.id === drinkId);
                    if (drinkIndex !== -1) {
                        updateDrink(drinkIndex, { glassware: glass });
                    }
                };

                return (
                    <div
                        key={glass.id}
                        className={`group relative bg-[#111] border rounded-xl overflow-hidden transition-all duration-300 ${isActive
                            ? 'border-[var(--color-yave-gold)] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[var(--color-yave-gold)]'
                            : 'border-[#222] hover:border-[#444]'
                            }`}
                    >
                        <div className="relative aspect-square w-full bg-[#080808] p-8 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                <Image
                                    src={glass.imagePath}
                                    alt={glass.name}
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                            {/* Overlay Gradient for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>

                        <div className="p-4 border-t border-[#222] bg-[#111] relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`text-lg font-bold transition-colors ${isActive ? 'text-[var(--color-yave-gold)]' : 'text-[var(--color-yave-white)]'}`}>
                                    {glass.name}
                                </h3>
                                {/* Visual Badge for assigned drinks */}
                                {assignedDrinks.length > 0 && (
                                    <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                                        {assignedDrinks.map(d => (
                                            <span key={d.id} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-yave-gold)] text-black font-bold truncate max-w-full">
                                                {d.customRecipe || `Drink ${state.drinks.indexOf(d) + 1}`}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                {glass.description}
                            </p>

                            {/* Dropdown for Assignment */}
                            <div className="mb-4">
                                <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Assign to Drink</label>
                                <select
                                    className="w-full bg-[#000] border border-[#333] text-gray-300 text-xs rounded-lg px-2 py-2 focus:border-[var(--color-yave-gold)] focus:outline-none"
                                    onChange={(e) => handleDrinkAssignment(e.target.value)}
                                    value="" // Always reset to allow re-selecting same drink if needed (though logic makes it weird). Better: "Assign..." placeholder.
                                >
                                    <option value="" disabled>Select a drink...</option>
                                    {state.drinks.map((drink, idx) => {
                                        const isAssigned = drink.glassware.id === glass.id;
                                        return (
                                            <option key={drink.id} value={drink.id} disabled={isAssigned}>
                                                {drink.customRecipe || `Drink ${idx + 1}`} {isAssigned ? '(Selected)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>



                            {/* Custom Details Input - Show if any drink is assigned */}
                            {assignedDrinks.length > 0 && (
                                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        // Show detail from first drink, or empty if mixed
                                        value={assignedDrinks[0].customGlasswareDetail || ''}
                                        onChange={(e) => {
                                            assignedDrinks.forEach(d => {
                                                const dIndex = state.drinks.findIndex(x => x.id === d.id);
                                                updateDrink(dIndex, { customGlasswareDetail: e.target.value });
                                            });
                                        }}
                                        className="w-full bg-[#000] border border-[#333] text-white px-3 py-2 rounded-lg text-[10px] focus:border-[var(--color-yave-gold)] focus:outline-none transition-all placeholder:text-gray-600"
                                        placeholder="Customize glass (e.g. 'Gold rim', 'Etched detail')..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
