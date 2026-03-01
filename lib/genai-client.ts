import { GoogleGenAI } from '@google/genai';

// Gemini Developer API client (for generateContent fallback)
let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return null;
    if (!geminiClient) {
        geminiClient = new GoogleGenAI({ apiKey });
    }
    return geminiClient;
}

// Vertex AI client (for editImage with SubjectReferenceImage)
let vertexClient: GoogleGenAI | null = null;

export function getVertexClient(): GoogleGenAI | null {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const apiKey = process.env.VERTEX_API_KEY;
    if (!project || !apiKey) return null;
    if (!vertexClient) {
        vertexClient = new GoogleGenAI({
            vertexai: true,
            project,
            location,
            apiKey,
        });
    }
    return vertexClient;
}

// Check if SubjectReferenceImage is available (Vertex AI configured)
export function isSubjectReferenceAvailable(): boolean {
    return !!(process.env.GOOGLE_CLOUD_PROJECT && process.env.VERTEX_API_KEY);
}

// Model constants
export const GEMINI_IMAGE_MODEL = 'gemini-3-pro-image-preview';
export const IMAGEN_EDIT_MODEL = 'imagen-3.0-capability-001';
