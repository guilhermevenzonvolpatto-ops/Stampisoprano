

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
  writeBatch,
  FieldValue,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Mold, Component, MoldEvent, User, ProductionLog, StampingDataHistoryEntry, StampingData, Machine, Attachment, MaintenanceRequest, MoldStatusDistribution, MoldSupplierDistribution, ComponentScrapRate } from './types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';


const usersCol = collection(db, 'users');
const moldsCol = collection(db, 'molds');
const componentsCol = collection(db, 'components');
const eventsCol = collection(db, 'events');
const productionLogsCol = collection(db, 'productionLogs');
const stampingHistoryCol = collection(db, 'stampingHistory');
const machinesCol = collection(db, 'machines');
const maintenanceRequestsCol = collection(db, 'maintenanceRequests');


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

const docToMaintenanceRequest = (doc: any): MaintenanceRequest => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    } as MaintenanceRequest;
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
    const q = query(moldsCol, where('isDeleted', '==', false), orderBy('codice'));
    const snapshot = await getDocs(q);
    const moldList = snapshot.docs.map(docToMold);
    const moldMap = new Map(moldList.map(m => [m.id, {...m, children: [] as Mold[]}]));
    const topLevelMolds: Mold[] = [];

    moldMap.forEach(mold => {
        if (mold.padre && moldMap.has(mold.padre)) {
            const parent = moldMap.get(mold.padre);
            // This check is to prevent adding children to a parent that is itself a child of another mold
            // which would result in duplicate rendering in a flat list.
            if(parent) {
                parent.children.push(mold);
            }
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

export const getMachines = async (): Promise<Machine[]> => {
    const q = query(machinesCol, where('isDeleted', '==', false), orderBy('codice'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToMachine);
}

export const getMachine = async (id: string): Promise<Machine | null> => {
    const docRef = doc(db, 'machines', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().isDeleted) return null;
    return docToMachine(docSnap);
}

export const createMachine = async (data: Omit<Machine, 'id' | 'stato' | 'isDeleted'>): Promise<Machine | { error: string }> => {
    const docRef = doc(machinesCol, data.codice);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { error: 'Machine with this code already exists.' };
    }
    const newMachine = {
        ...data,
        stato: 'Operativo' as Machine['stato'],
        isDeleted: false,
    };
    await setDoc(docRef, newMachine);
    return { id: docRef.id, ...newMachine } as Machine;
};

export const updateMachine = async (id: string, updates: Partial<Machine>): Promise<Machine | null> => {
    const docRef = doc(db, 'machines', id);
    await updateDoc(docRef, updates);
    return getMachine(id);
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

export const getAllEvents = async (): Promise<MoldEvent[]> => {
    try {
        const q = query(eventsCol, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToEvent);
    } catch(e) {
        console.error("Error getting all events:", e);
        return [];
    }
}

export const getEventsForSource = async (sourceId: string): Promise<MoldEvent[]> => {
    try {
        const q = query(eventsCol, where('sourceId', '==', sourceId), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToEvent);
    } catch(e) {
        console.error(`Error getting events for ${sourceId}:`, e);
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

export const createUser = async (id: string, name: string): Promise<User | { error: string }> => {
    if (!id || !name) {
        return { error: 'User ID and Name are required.'};
    }
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { error: 'User with this code already exists.' };
    }
    
    const newUser: Omit<User, 'id'> = {
        name,
        isAdmin: false,
        allowedCodes: [],
    };

    await setDoc(docRef, newUser);
    return { id, ...newUser};
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, updates);
    return getUser(id);
}

export const createEvent = async (eventData: Omit<MoldEvent, 'id' | 'timestamp' | 'status'>): Promise<MoldEvent> => {
    const newEventData = {
        ...eventData,
        timestamp: serverTimestamp(),
        status: 'Aperto' as 'Aperto',
        attachments: [],
    };
    const docRef = await addDoc(eventsCol, newEventData);

    let newStatus: Mold['stato'] | Machine['stato'] | null = null;
    if (eventData.type === 'Manutenzione' || eventData.type === 'Riparazione') {
        newStatus = 'In Manutenzione';
    } else if (eventData.type === 'Lavorazione') {
        newStatus = 'Lavorazione';
    }
    
    if (newStatus) {
        let itemRef: any;
        if (eventData.sourceId.startsWith('ST-')) {
            itemRef = doc(moldsCol, eventData.sourceId);
        } else if (eventData.sourceId.startsWith('MAC-')) {
            itemRef = doc(machinesCol, eventData.sourceId);
        }

        if(itemRef) {
            const itemDoc = await getDoc(itemRef);
            if (itemDoc.exists()) {
                await updateDoc(itemRef, { stato: newStatus });
            }
        }
    }

    return {
        id: docRef.id,
        ...newEventData,
        timestamp: new Date(),
    };
};

export const getEvent = async (id: string): Promise<MoldEvent | null> => {
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToEvent(docSnap) : null;
}

export const updateEvent = async (id: string, updates: Partial<MoldEvent>): Promise<MoldEvent | null> => {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, updates);

    const updatedEvent = await getEvent(id);
    if (updatedEvent && updates.status === 'Chiuso') {
        const otherOpenEvents = await getDocs(query(
            eventsCol, 
            where('sourceId', '==', updatedEvent.sourceId), 
            where('status', '==', 'Aperto')
        ));

        if (otherOpenEvents.empty) {
            let itemRef: any;
             if (updatedEvent.sourceId.startsWith('ST-')) {
                itemRef = doc(moldsCol, updatedEvent.sourceId);
            } else if (updatedEvent.sourceId.startsWith('MAC-')) {
                itemRef = doc(machinesCol, updatedEvent.sourceId);
            }

            if(itemRef) {
                const itemDoc = await getDoc(itemRef);
                if (itemDoc.exists()) {
                    await updateDoc(itemRef, { stato: 'Operativo' });
                }
            }
        }
    }
    return updatedEvent;
};

export const getFileType = (fileName: string): Attachment['fileType'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return 'Document';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return 'Image';
    if (['pdf'].includes(extension)) return 'PDF';
    if (['step', 'stp', 'iges', 'igs', 'x_t', 'x_b'].includes(extension)) return '3D';
    return 'Document';
}


export async function associateComponentsToMold(moldId: string, componentIds: string[]): Promise<{ success: boolean; error?: string }> {
  if (!componentIds || componentIds.length === 0) {
    return { success: false, error: "No component IDs provided." };
  }
  
  const batch = writeBatch(db);

  componentIds.forEach(componentId => {
    const componentRef = doc(db, 'components', componentId);
    batch.update(componentRef, {
      associatedMolds: arrayUnion(moldId)
    });
  });

  try {
    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error("Error associating components to mold:", error);
    return { success: false, error: "An error occurred while saving the association." };
  }
}

export async function createMaintenanceRequest(
  data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>
): Promise<MaintenanceRequest | { error: string }> {
  try {
    const newRequest: Omit<MaintenanceRequest, 'id' | 'createdAt'> & { createdAt: FieldValue } = {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(maintenanceRequestsCol, newRequest);
    return { id: docRef.id, ...data, status: 'pending', createdAt: new Date() };
  } catch (error: any) {
    console.error("Error creating maintenance request:", error);
    return { error: "Failed to create maintenance request." };
  }
}

export async function getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    const q = query(maintenanceRequestsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToMaintenanceRequest);
}

export async function updateMaintenanceRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
    const requestRef = doc(db, 'maintenanceRequests', requestId);
    try {
        await runTransaction(db, async (transaction) => {
            const requestDoc = await transaction.get(requestRef);
            if (!requestDoc.exists()) {
                throw new Error("Request not found");
            }

            transaction.update(requestRef, { status });

            if (status === 'approved') {
                const requestData = requestDoc.data() as MaintenanceRequest;
                const newEvent: Omit<MoldEvent, 'id' | 'timestamp' | 'status'> = {
                    sourceId: requestData.sourceId,
                    type: 'Manutenzione',
                    descrizione: `(From Request) ${requestData.description}`,
                    costo: null,
                    // Default to 2 weeks from now
                    estimatedEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
                };
                
                // This will call the existing createEvent logic, which handles status changes on the source item
                await createEvent(newEvent);
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error updating maintenance request:", error);
        return { success: false, error: error.message };
    }
}

// Analytics Functions
export async function getMoldStatusDistribution(): Promise<MoldStatusDistribution> {
  const q = query(moldsCol, where('isDeleted', '==', false));
  const snapshot = await getDocs(q);
  const molds = snapshot.docs.map(docToMold);

  const statusCounts = molds.reduce((acc, mold) => {
    acc[mold.stato] = (acc[mold.stato] || 0) + 1;
    return acc;
  }, {} as Record<Mold['stato'], number>);

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status as Mold['stato'],
    count,
  }));
}

export async function getMoldSupplierDistribution(): Promise<MoldSupplierDistribution> {
  const q = query(moldsCol, where('isDeleted', '==', false), where('posizione.type', '==', 'esterna'));
  const snapshot = await getDocs(q);
  const molds = snapshot.docs.map(docToMold);

  const supplierCounts = molds.reduce((acc, mold) => {
    const supplier = mold.posizione.value;
    acc[supplier] = (acc[supplier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(supplierCounts).map(([supplier, count]) => ({
    supplier,
    count,
  }));
}

export async function getMaintenanceCostsOverTime(): Promise<{ month: string; totalCost: number }[]> {
  const q = query(
    eventsCol,
    where('type', 'in', ['Manutenzione', 'Riparazione']),
    orderBy('timestamp', 'asc')
  );
  const snapshot = await getDocs(q);
  const events = snapshot.docs.map(docToEvent);

  const costsByMonth = events.reduce((acc, event) => {
    if (event.costo && event.costo > 0) {
      const month = format(event.timestamp, 'yyyy-MM');
      acc[month] = (acc[month] || 0) + (event.costo || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(costsByMonth).map(([month, totalCost]) => ({
    month,
    totalCost,
  }));
}
