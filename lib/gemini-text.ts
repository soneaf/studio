import { getGeminiClient } from './genai-client';

const GEMINI_TEXT_MODEL = 'gemini-2.0-flash';

/**
 * Send a text-only prompt to Gemini Flash and return the text response.
 * Uses the @google/genai SDK for consistency with the rest of the codebase.
 */
export async function callGeminiText(prompt: string): Promise<{ success: boolean; text?: string; error?: string }> {
    const client = getGeminiClient();
    if (!client) {
        return { success: false, error: "Configuration Error: GOOGLE_API_KEY is missing." };
    }

    try {
        const response = await client.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const candidate = response.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (!text) {
            return { success: false, error: "No text returned from Gemini." };
        }

        return { success: true, text: text.trim() };
    } catch (error) {
        const msg = (error as Error)?.message || String(error);
        return { success: false, error: `Gemini API Error: ${msg}` };
    }
}
