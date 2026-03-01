'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteCocktail(id: string) {
    try {
        await prisma.cocktail.delete({
            where: {
                id: id
            }
        });

        // Revalidate the history page to show updated list
        revalidatePath('/history');

        return { success: true };
    } catch (error) {
        console.error('Failed to delete cocktail:', error);
        return { success: false, error: String(error) };
    }
}
