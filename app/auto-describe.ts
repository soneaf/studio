'use server';

import { callGeminiText } from '@/lib/gemini-text';

export async function generateVisualDescription(recipeName: string): Promise<{ success: boolean; description?: string; error?: string }> {
    const result = await callGeminiText(
        `Describe strictly the visual properties of the LIQUID ITSELF for a cocktail named "${recipeName}" in 15 words or less. Focus ONLY on color, texture, consistency, and viscosity. DO NOT describe garnish, ice, glass, or any external elements. Return NOTHING else. Example: "Cloudy pink liquid with a frothy texture and slight effervescence."`
    );

    if (!result.success) return { success: false, error: result.error };
    return { success: true, description: result.text };
}
