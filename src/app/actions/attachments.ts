
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

        revalidatePath(`/(molds|components|machines)/${itemId}`);
        revalidatePath(`/calendar`);


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
        if (attachment.storagePath) {
            await del(attachment.url, {
                token: process.env.BLOB_READ_WRITE_TOKEN
            });
        }

        const docRef = doc(db, collectionName, itemId);
        await updateDoc(docRef, {
            attachments: arrayRemove(attachment)
        });

        revalidatePath(`/(molds|components|machines)/${itemId}`);
        revalidatePath(`/calendar`);
        
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting file:", error);
        return { success: false, error: error.message };
    }
}

export async function createAttachmentFromUrl(
  itemId: string,
  itemType: ItemType,
  url: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  if (!itemId || !itemType || !url) {
    return { success: false, error: 'Missing required fields.' };
  }

  const collectionName = itemType === 'event' ? 'events' : `${itemType}s`;

  try {
    const newAttachment: Attachment = {
      id: uuidv4(),
      fileName: name || url,
      fileType: 'URL',
      url: url,
      uploadedAt: new Date().toISOString(),
      storagePath: null, // Indicate that this is an external link
    };

    const docRef = doc(db, collectionName, itemId);
    await updateDoc(docRef, {
      attachments: arrayUnion(newAttachment),
    });

    revalidatePath(`/(molds|components|machines)/${itemId}`);
    revalidatePath('/calendar');

    return { success: true };
  } catch (error: any) {
    console.error('Error creating attachment from URL:', error);
    return { success: false, error: error.message };
  }
}
