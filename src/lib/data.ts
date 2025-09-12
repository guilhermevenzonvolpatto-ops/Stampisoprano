
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  increment,
  runTransaction,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, app } from './firebase';
import type { Mold, Component, MoldEvent, User, ProductionLog, StampingDataHistoryEntry, StampingData, Machine, Attachment } from './types';
import { v4 as uuidv4 } from 'uuid';


const usersCol = collection(db, 'users');
const moldsCol = collection(db, 'molds');
const componentsCol = collection(db, 'components');
const eventsCol = collection(db, 'events');
const productionLogsCol = collection(db, 'productionLogs');
const stampingHistoryCol = collection(db, 'stampingHistory');
const machinesCol = collection(db, 'machines');
const storage = getStorage(app);


const docToUser = (doc: any): User => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
    } as User;
}

const docToMold = (doc: any): Mold => {
    const data = doc.data();
    const creationDate = data.data;
    return {
        id: doc.id,
        ...data,
        data: creationDate && typeof creationDate.toDate === 'function'
            ? (creationDate as Timestamp).toDate().toISOString().split('T')[0]
            : creationDate || new Date().toISOString().split('T')[0]
    } as Mold;
}

const docToComponent = (doc: any): Component => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
    } as Component;
}

const docToMachine = (doc: any): Machine => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
    } as Machine;
}

const docToEvent = (doc: any): MoldEvent => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
    } as MoldEvent;
}

const docToProductionLog = (doc: any): ProductionLog => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
    } as ProductionLog;
}

const docToStampingDataHistoryEntry = (doc: any): StampingDataHistoryEntry => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
    } as StampingDataHistoryEntry;
}

export const createMold = async (data: Omit<Mold, 'id' | 'data' | 'stato' | 'isDeleted'>): Promise<Mold | { error: string }> => {
    const docRef = doc(moldsCol, data.codice);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { error: 'Mold with this code already exists.' };
    }
    const newMold = {
        ...data,
        data: new Date().toISOString().split('T')[0],
        stato: 'Operativo' as Mold['stato'],
        isDeleted: false,
    };
    await setDoc(docRef, newMold);
    return { id: docRef.id, ...newMold } as Mold;
};

export const createComponent = async (data: Omit<Component, 'id' | 'stato' | 'cicliTotali' | 'isDeleted'>): Promise<Component | { error: string }> => {
    const docRef = doc(componentsCol, data.codice);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { error: 'Component with this code already exists.' };
    }
    const newComponent = {
        ...data,
        stato: 'Attivo' as Component['stato'],
        cicliTotali: 0,
        isDeleted: false,
    };
    await setDoc(docRef, newComponent);
    return { id: docRef.id, ...newComponent } as Component;
};

export const getMolds = async (): Promise<Mold[]> => {
    const q = query(moldsCol, where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    const moldList = snapshot.docs.map(docToMold);
    const moldMap = new Map(moldList.map(m => [m.id, {...m, children: [] as Mold[]}]));
    const topLevelMolds: Mold[] = [];

    moldMap.forEach(mold => {
        if (mold.padre && moldMap.has(mold.padre)) {
            moldMap.get(mold.padre)?.children?.push(mold);
        } else {
            topLevelMolds.push(mold);
        }
    });

    return topLevelMolds;
};

export const getMold = async (id: string): Promise<Mold | null> => {
    const docRef = doc(db, 'molds', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().isDeleted) return null;
    return docToMold(docSnap);
}

export const updateMold = async (id: string, updates: Partial<Mold>): Promise<Mold | null> => {
    const docRef = doc(db, 'molds', id);
    await updateDoc(docRef, updates);
    return getMold(id);
};

export const deleteMold = async (id: string): Promise<void> => {
    const docRef = doc(db, 'molds', id);
    await updateDoc(docRef, { isDeleted: true });
}

export const getComponents = async (): Promise<Component[]> => {
    const q = query(componentsCol, where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToComponent);
}

export const getComponent = async (id: string): Promise<Component | null> => {
    const docRef = doc(db, 'components', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().isDeleted) return null;
    return docToComponent(docSnap);
}

export const deleteComponent = async (id: string): Promise<void> => {
    const docRef = doc(db, 'components', id);
    await updateDoc(docRef, { isDeleted: true });
}

export const getMachines = async (): Promise<Machine[]> => {
    const snapshot = await getDocs(machinesCol);
    return snapshot.docs.map(docToMachine);
}

export const getMachine = async (id: string): Promise<Machine | null> => {
    const docRef = doc(db, 'machines', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToMachine(docSnap) : null;
}

export const updateComponent = async (id: string, updates: Partial<Component>): Promise<Component | null> => {
    const docRef = doc(db, 'components', id);
    await updateDoc(docRef, updates);
    return getComponent(id);
};

export const createStampingHistoryEntry = async (componentId: string, userId: string, changedData: Partial<StampingData>) => {
    await addDoc(stampingHistoryCol, {
        componentId,
        timestamp: serverTimestamp(),
        user: userId,
        changedData: changedData,
    });
};

export const logProduction = async (input: {
    componentId: string;
    good: number;
    scrapped: number;
    scrapReason: string;
    user: string;
}) => {
    await runTransaction(db, async (transaction) => {
        const componentDocRef = doc(db, 'components', input.componentId);
        const componentDoc = await transaction.get(componentDocRef);

        if (!componentDoc.exists()) {
            throw "Component not found!";
        }
        
        const productionLogRef = doc(collection(db, 'productionLogs'));
        transaction.set(productionLogRef, {
            ...input,
            timestamp: serverTimestamp(),
        });
        
        const totalCycles = input.good + input.scrapped;
        transaction.update(componentDocRef, {
            cicliTotali: increment(totalCycles),
        });
    });

    return { success: true };
}

export const getStats = async () => {
    try {
        const snapshot = await getDocs(query(moldsCol, where('isDeleted', '==', false)));
        const allMolds = snapshot.docs.map(docToMold);
        return {
            totalMolds: allMolds.length,
            maintenanceMolds: allMolds.filter(m => m.stato === 'In Manutenzione').length,
            externalMolds: allMolds.filter(m => m.posizione.type === 'esterna').length,
        }
    } catch(e) {
        console.error("Error getting stats:", e);
        return { totalMolds: 0, maintenanceMolds: 0, externalMolds: 0 };
    }
}

export const getStatusDistribution = async () => {
    try {
        const snapshot = await getDocs(query(moldsCol, where('isDeleted', '==', false)));
        const allMolds = snapshot.docs.map(docToMold);
        const dist = allMolds.reduce((acc, mold) => {
            acc[mold.stato] = (acc[mold.stato] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(dist).map(([status, count]) => ({ status, count })) as any;
    } catch(e) {
        console.error("Error getting status distribution:", e);
        return [];
    }
}

export const getSupplierDistribution = async () => {
    try {
        const q = query(moldsCol, where('posizione.type', '==', 'esterna'));
        const snapshot = await getDocs(q);
        const externalMolds = snapshot.docs.map(docToMold).filter(m => !m.isDeleted);
        const dist = externalMolds.reduce((acc, mold) => {
            const supplier = mold.posizione.value || 'Unknown';
            acc[supplier] = (acc[supplier] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(dist).map(([supplier, count]) => ({ supplier, count }));
    } catch(e) {
        console.error("Error getting supplier distribution:", e);
        return [];
    }
}

export const getScrapRate = async (periodInDays: number) => {
    try {
        const allComponents = await getComponents();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - periodInDays);

        const logsQuery = query(productionLogsCol, where('timestamp', '>=', cutoffDate));
        const logsSnapshot = await getDocs(logsQuery);
        const allLogs = logsSnapshot.docs.map(docToProductionLog);

        const rates = allComponents.map(c => {
            const relevantLogs = allLogs.filter(log => log.componentId === c.id);
            const totalGood = relevantLogs.reduce((sum, log) => sum + log.good, 0);
            const totalScrapped = relevantLogs.reduce((sum, log) => sum + log.scrapped, 0);
            const total = totalGood + totalScrapped;
            return {
                componentId: c.id,
                componentCode: c.codice,
                scrapRate: total > 0 ? parseFloat(((totalScrapped / total) * 100).toFixed(1)) : 0
            };
        });

        return rates.filter(r => r.scrapRate > 0).sort((a,b) => b.scrapRate - a.scrapRate).slice(0, 10);
    } catch(e) {
        console.error("Error getting scrap rate:", e);
        return [];
    }
}

export const getUpcomingEvents = async (): Promise<MoldEvent[]> => {
    try {
        const q = query(eventsCol, where('status', '==', 'Aperto'), orderBy('estimatedEndDate', 'asc'));
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(docToEvent);
        return events;
    } catch(e) {
        console.error("Error getting upcoming events:", e);
        return [];
    }
}

export const getEventsForMold = async (sourceId: string): Promise<MoldEvent[]> => {
    try {
        const q = query(eventsCol, where('sourceId', '==', sourceId), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToEvent);
    } catch(e) {
        console.error(`Error getting events for mold ${sourceId}:`, e);
        return [];
    }
}

export const getComponentsForMold = async (moldId: string): Promise<Component[]> => {
    try {
        const q = query(componentsCol, where('associatedMolds', 'array-contains', moldId), where('isDeleted', '==', false));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToComponent);
    } catch(e) {
        console.error(`Error getting components for mold ${moldId}:`, e);
        return [];
    }
}

export const getProductionLog = async (logId: string): Promise<ProductionLog | null> => {
    const docRef = doc(db, 'productionLogs', logId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToProductionLog(docSnap) : null;
}

export const getProductionLogsForComponent = async (componentId: string): Promise<ProductionLog[]> => {
    try {
        const q = query(productionLogsCol, where('componentId', '==', componentId), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToProductionLog);
    } catch(e) {
        console.error(`Error getting production logs for component ${componentId}:`, e);
        return [];
    }
}

export const getStampingHistoryForComponent = async (componentId: string): Promise<StampingDataHistoryEntry[]> => {
    const q = query(stampingHistoryCol, where('componentId', '==', componentId), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(docToStampingDataHistoryEntry);
    return entries;
};

export const updateProductionLog = async (id: string, updates: Partial<ProductionLog>): Promise<ProductionLog | null> => {
    await runTransaction(db, async (transaction) => {
        const logDocRef = doc(db, 'productionLogs', id);
        const logDoc = await transaction.get(logDocRef);

        if (!logDoc.exists()) {
            throw "Log not found";
        }
        const originalLog = docToProductionLog(logDoc);
        
        transaction.update(logDocRef, updates);

        const originalTotal = (originalLog.good || 0) + (originalLog.scrapped || 0);
        const newTotal = (updates.good ?? originalLog.good) + (updates.scrapped ?? originalLog.scrapped);
        const cycleDifference = newTotal - originalTotal;
        
        if (cycleDifference !== 0) {
            const componentDocRef = doc(db, 'components', originalLog.componentId);
            transaction.update(componentDocRef, { cicliTotali: increment(cycleDifference) });
        }
    });
    return getProductionLog(id);
}

export const deleteProductionLog = async (id: string): Promise<void> => {
    await runTransaction(db, async (transaction) => {
        const logDocRef = doc(db, 'productionLogs', id);
        const logDoc = await transaction.get(logDocRef);

        if (!logDoc.exists()) {
            throw "Log not found";
        }
        const logToDelete = docToProductionLog(logDoc);
        transaction.delete(logDocRef);

        const totalCyclesToDecrement = (logToDelete.good || 0) + (logToDelete.scrapped || 0);
        if (totalCyclesToDecrement > 0) {
            const componentDocRef = doc(db, 'components', logToDelete.componentId);
            transaction.update(componentDocRef, { cicliTotali: increment(-totalCyclesToDecrement) });
        }
    });
}


export const getUser = async (id: string): Promise<User | null> => {
    if (!id) return null;
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToUser(docSnap) : null;
}

export const getUsers = async (): Promise<User[]> => {
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(docToUser);
}

export const createUser = async (user: Omit<User, 'id'>, id: string): Promise<User | { error: string }> => {
    if (!id) {
        return { error: 'User ID is required.'};
    }
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { error: 'User with this code already exists.' };
    }
    await setDoc(docRef, user);
    return { id, ...user };
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, updates);
    return getUser(id);
}

export const updateEvent = async (id: string, updates: Partial<MoldEvent>): Promise<MoldEvent | null> => {
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, updates);
    const updatedEvent = await getEvent(id);
    if (updatedEvent && updates.status === 'Chiuso') {
        const mold = await getMold(updatedEvent.sourceId);
        if (mold) {
            const otherEvents = await getEventsForMold(updatedEvent.sourceId);
            const hasOpenEvents = otherEvents.some(e => e.id !== id && e.status === 'Aperto');
            // If this was the last open event, set mold to Operativo
            if (!hasOpenEvents) {
                await updateMold(mold.id, { stato: 'Operativo' });
            }
        }
    }
    return updatedEvent;
};

export const getEvent = async (id: string): Promise<MoldEvent | null> => {
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToEvent(docSnap) : null;
}

export const createEvent = async (eventData: Omit<MoldEvent, 'id' | 'timestamp' | 'status'>): Promise<MoldEvent> => {
    const newEventData = {
        ...eventData,
        timestamp: serverTimestamp(),
        status: 'Aperto',
    };
    const docRef = await addDoc(eventsCol, newEventData);

    let newStatus: Mold['stato'] | null = null;
    if (eventData.type === 'Manutenzione' || eventData.type === 'Riparazione') {
        newStatus = 'In Manutenzione';
    } else if (eventData.type === 'Lavorazione') {
        newStatus = 'Lavorazione';
    }

    if (newStatus) {
         await updateMold(eventData.sourceId, { stato: newStatus });
    }

    return {
        id: docRef.id,
        ...eventData,
        timestamp: new Date(),
        status: 'Aperto'
    };
}


const getFileType = (fileName: string): Attachment['fileType'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return 'Document';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return 'Image';
    if (['pdf'].includes(extension)) return 'PDF';
    if (['step', 'stp', 'iges', 'igs', 'x_t', 'x_b'].includes(extension)) return '3D';
    return 'Document';
}

export async function uploadFileAndCreateAttachment(
    itemId: string,
    itemType: 'mold' | 'component',
    file: File
): Promise<{ success: boolean; error?: string }> {
    try {
        const storagePath = `${itemType}s/${itemId}/${file.name}`;
        const storageRef = ref(storage, storagePath);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const newAttachment: Attachment = {
            id: uuidv4(),
            fileName: file.name,
            fileType: getFileType(file.name),
            url: downloadURL,
            uploadedAt: new Date().toISOString(),
            storagePath: storagePath
        };

        const docRef = doc(db, `${itemType}s`, itemId);
        await updateDoc(docRef, {
            attachments: arrayUnion(newAttachment)
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error uploading file:", error);
        return { success: false, error: error.message };
    }
}


export async function deleteAttachment(
    itemId: string,
    itemType: 'mold' | 'component',
    attachment: Attachment
): Promise<{ success: boolean; error?: string }> {
     try {
        if (attachment.storagePath) {
            const storageRef = ref(storage, attachment.storagePath);
            await deleteObject(storageRef);
        }

        const docRef = doc(db, `${itemType}s`, itemId);
        await updateDoc(docRef, {
            attachments: arrayRemove(attachment)
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting file:", error);
        return { success: false, error: error.message };
    }
}

    