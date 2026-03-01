/**
 * Sanitize a string for use as a filename.
 * Replaces non-alphanumeric characters with hyphens.
 */
export function sanitizeFilename(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Extract a Buffer from a File object (FormData upload).
 */
export async function getFileBuffer(file: File): Promise<Buffer> {
    const bytes = await file.arrayBuffer();
    return Buffer.from(bytes);
}
