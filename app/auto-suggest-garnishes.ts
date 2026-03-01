'use server';

import { GARNISHES } from '@/lib/data';
import { callGeminiText } from '@/lib/gemini-text';

// Build a compact list of garnish IDs and names for the AI prompt
const GARNISH_LIST = GARNISHES.map(g => `${g.id}: ${g.name}`).join(', ');

export async function suggestGarnishes(recipeName: string): Promise<{
    success: boolean;
    garnishIds?: string[];
    error?: string
}> {
    if (!recipeName || recipeName.trim().length === 0) {
        return { success: false, error: "Recipe name is required." };
    }

    const prompt = `You are a professional bartender and cocktail stylist. Given the cocktail name "${recipeName}", suggest 2-4 appropriate garnishes that would complement this drink visually and flavor-wise.

IMPORTANT: You MUST only choose from this exact list of valid garnish IDs:
${GARNISH_LIST}

Return ONLY a comma-separated list of garnish IDs (no names, no explanations, no extra text).
Example response: mint-sprig, lime-wedge, cocktail-cherry

Respond with the garnish IDs only:`;

    const result = await callGeminiText(prompt);

    if (!result.success) return { success: false, error: result.error };

    const text = result.text!;

    // Parse the response - extract valid garnish IDs
    const validGarnishIds = new Set(GARNISHES.map(g => g.id));
    const suggestedIds = text
        .split(',')
        .map((id: string) => id.trim().toLowerCase())
        .filter((id: string) => validGarnishIds.has(id));

    if (suggestedIds.length === 0) {
        // Try to parse if AI returned names instead of IDs
        const words = text.toLowerCase();
        const fallbackIds = GARNISHES
            .filter(g => words.includes(g.id) || words.includes(g.name.toLowerCase()))
            .slice(0, 4)
            .map(g => g.id);

        if (fallbackIds.length > 0) {
            return { success: true, garnishIds: fallbackIds };
        }

        return { success: false, error: "Could not parse garnish suggestions." };
    }

    return { success: true, garnishIds: suggestedIds.slice(0, 4) };
}
