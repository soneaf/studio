import { AppSettings } from "@/app/settings-actions";

export function buildFileName(settings: AppSettings, productName: string, date: Date = new Date()): string {
    const builder = settings.fileNameBuilder && settings.fileNameBuilder.length > 0
        ? settings.fileNameBuilder
        : [{ type: 'Product Name', value: '' }];

    let baseName = '';
    // Sanitize product name
    const safeName = productName.replace(/[\/\\:]/g, '_');

    for (const field of builder) {
        if (field.type === 'Nothing') continue;
        if (field.type === 'Increment' || field.type === 'Custom Increment') {
            baseName += '{INC}';
        } else if (field.type === 'Product Name') {
            baseName += safeName;
        } else if (field.type === 'Date') {
            baseName += date.toISOString().split('T')[0];
        } else {
            baseName += field.value;
        }
    }

    if (baseName.trim() === '') baseName = safeName;

    return baseName;
}
