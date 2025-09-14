
'use server';

import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { put, del } from '@vercel/blob';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { getFileType } from '@/lib/data';
import type { Attachment } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

type ItemType = 'mold' | 'component' | 'machine' | 'event';

export async function uploadFileAndCreateAttachment(
    formData: FormData,
): Promise<{ success: boolean; error?: string }> {
    const file = formData.get('file') as File;
    const itemId = formData.get('itemId') as string;
    const itemType = formData.get('itemType') as ItemType;

    if (!file || !itemId || !itemType) {
        return { success: false, error: 'Missing file, item ID, or item type.' };
    }
    
    const collectionName = itemType === 'event' ? 'events' : `${itemType}s`;


    try {
        const pathname = `${collectionName}/${itemId}/${file.name}`;
        const blob = await put(pathname, file, { 
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        const newAttachment: Attachment = {
            id: uuidv4(),
            fileName: file.name,
            fileType: getFileType(file.name),
            url: blob.url,
            uploadedAt: new Date().toISOString(),
            storagePath: blob.pathname
        };

        const docRef = doc(db, collectionName, itemId);
        await updateDoc(docRef, {
            attachments: arrayUnion(newAttachment)
        });

        revalidatePath(`/${collectionName}/${itemId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error uploading file:", error);
        return { success: false, error: error.message };
    }
}


export async function deleteAttachment(
    itemId: string,
    itemType: ItemType,
    attachment: Attachment
): Promise<{ success: boolean; error?: string }> {
    const collectionName = itemType === 'event' ? 'events' : `${itemType}s`;
     try {
        if (attachment.url) {
            await del(attachment.url, {
                token: process.env.BLOB_READ_WRITE_TOKEN
            });
        }

        const docRef = doc(db, collectionName, itemId);
        await updateDoc(docRef, {
            attachments: arrayRemove(attachment)
        });

        revalidatePath(`/${collectionName}/${itemId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting file from Vercel Blob:", error);
        return { success: false, error: error.message };
    }
}
