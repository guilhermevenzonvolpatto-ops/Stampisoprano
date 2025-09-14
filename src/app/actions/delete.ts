
'use server';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export async function deleteItem(itemType: 'mold' | 'component' | 'machine', itemId: string): Promise<{ success: boolean, error?: string }> {
    try {
        const docRef = doc(db, `${itemType}s`, itemId);
        await updateDoc(docRef, { isDeleted: true });
        
        revalidatePath(`/${itemType}s`);
        revalidatePath(`/${itemType}s/${itemId}`);
        
        return { success: true };
    } catch (error: any) {
        console.error(`Error archiving ${itemType}:`, error);
        return { success: false, error: `Could not archive the ${itemType}.` };
    }
}
