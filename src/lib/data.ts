
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
} from 'firebase/firestore';
import { db } from './firebase';
import type { Mold, Component, MoldEvent, User, ProductionLog, StampingDataHistoryEntry, StampingData, Machine } from './types';


const usersCol = collection(db, 'users');
const moldsCol = collection(db, 'molds');
const componentsCol = collection(db, 'components');
const eventsCol = collection(db, 'events');
const productionLogsCol = collection(db, 'productionLogs');
const machinesCol = collection(db, 'machines');


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
        stato: 'Operativo',
        isDeleted: false,
    };
    await setDoc(docRef, newMold);
    return { id: docRef.id, ...newMold };
};

export const createComponent = async (data: Omit<Component, 'id' | 'stato' | 'cicliTotali'>): Promise<Component | { error: string }> => {
    const docRef = doc(componentsCol, data.codice);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { error: 'Component with this code already exists.' };
    }
    const newComponent = {
        ...data,
        stato: 'Attivo',
        cicliTotali: 0,
    };
    await setDoc(docRef, newComponent);
    return { id: docRef.id, ...newComponent };
};

export const getMolds = async (): Promise<Mold[]> => {
    const q = query(moldsCol, where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    const moldList = snapshot.docs.map(docToMold);
    moldList.forEach(m => {
        m.children = moldList.filter(child => child.padre === m.id);
    });
    return moldList;
};

export const getMold = async (id: string): Promise<Mold | null> => {
    const docRef = doc(db, 'molds', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToMold(docSnap) : null;
}

export const updateMold = async (id: string, updates: Partial<Mold>): Promise<Mold | null> => {
    const docRef = doc(db, 'molds', id);
    await updateDoc(docRef, updates);
    return getMold(id);
};

export const getComponents = async (): Promise<Component[]> => {
    const snapshot = await getDocs(componentsCol);
    return snapshot.docs.map(docToComponent);
}

export const getComponent = async (id: string): Promise<Component | null> => {
    const docRef = doc(db, 'components', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToComponent(docSnap) : null;
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
    const historyCol = collection(db, 'components', componentId, 'stampingHistory');
    await addDoc(historyCol, {
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
    const productionLogsCol = collection(db, 'productionLogs');
    await addDoc(productionLogsCol, {
        ...input,
        timestamp: serverTimestamp(),
    });

    const componentDocRef = doc(db, 'components', input.componentId);
    const totalCycles = input.good + input.scrapped;
    await updateDoc(componentDocRef, {
        cicliTotali: increment(totalCycles),
    });

    return { success: true };
}

export const getStats = async () => {
    const allMolds = await getMolds();
    return {
        totalMolds: allMolds.length,
        maintenanceMolds: allMolds.filter(m => m.stato === 'In Manutenzione').length,
        externalMolds: allMolds.filter(m => m.posizione.type === 'esterna').length,
    }
}

export const getStatusDistribution = async () => {
    const allMolds = await getMolds();
    const dist = allMolds.reduce((acc, mold) => {
        acc[mold.stato] = (acc[mold.stato] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(dist).map(([status, count]) => ({ status, count })) as any;
}

export const getSupplierDistribution = async () => {
    const allMolds = await getMolds();
    const externalMolds = allMolds.filter(m => m.posizione.type === 'esterna');
    const dist = externalMolds.reduce((acc, mold) => {
        const supplier = mold.posizione.value || 'Unknown';
        acc[supplier] = (acc[supplier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    return Object.entries(dist).map(([supplier, count]) => ({ supplier, count }));
}

export const getScrapRate = async (periodInDays: number) => {
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
            componentId: c.codice,
            scrapRate: total > 0 ? parseFloat(((totalScrapped / total) * 100).toFixed(1)) : 0
        };
    });

    return rates.filter(r => r.scrapRate > 0).sort((a,b) => b.scrapRate - a.scrapRate).slice(0, 10);
}

export const getUpcomingEvents = async (): Promise<MoldEvent[]> => {
    const q = query(eventsCol, where('status', '==', 'Aperto'));
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(docToEvent);
    // client-side sort
    return events.sort((a, b) => new Date(a.estimatedEndDate).getTime() - new Date(b.estimatedEndDate).getTime());
}

export const getEventsForMold = async (sourceId: string): Promise<MoldEvent[]> => {
    const q = query(eventsCol, where('sourceId', '==', sourceId));
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(docToEvent);
    // client-side sort
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const getComponentsForMold = async (moldId: string): Promise<Component[]> => {
    const q = query(componentsCol, where('associatedMolds', 'array-contains', moldId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToComponent);
}

export const getProductionLog = async (logId: string): Promise<ProductionLog | null> => {
    const docRef = doc(db, 'productionLogs', logId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToProductionLog(docSnap) : null;
}

export const getProductionLogsForComponent = async (componentId: string): Promise<ProductionLog[]> => {
    const q = query(productionLogsCol, where('componentId', '==', componentId));
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(docToProductionLog);
    // client-side sort to avoid needing a composite index
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const getStampingHistoryForComponent = async (componentId: string): Promise<StampingDataHistoryEntry[]> => {
    const historyCol = collection(db, 'components', componentId, 'stampingHistory');
    const q = query(historyCol, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToStampingDataHistoryEntry);
};

export const updateProductionLog = async (id: string, updates: Partial<ProductionLog>): Promise<ProductionLog | null> => {
    const originalLog = await getProductionLog(id);
    if (!originalLog) {
        throw new Error("Log not found");
    }
    const docRef = doc(db, 'productionLogs', id);
    await updateDoc(docRef, updates);

    // Adjust component's total cycles
    const originalTotal = (originalLog.good || 0) + (originalLog.scrapped || 0);
    const newTotal = (updates.good || 0) + (updates.scrapped || 0);
    const cycleDifference = newTotal - originalTotal;
    
    if (cycleDifference !== 0) {
        const componentDocRef = doc(db, 'components', originalLog.componentId);
        await updateDoc(componentDocRef, {
            cicliTotali: increment(cycleDifference),
        });
    }

    return getProductionLog(id);
}

export const deleteProductionLog = async (id: string): Promise<void> => {
    const logToDelete = await getProductionLog(id);
    if (!logToDelete) {
        throw new Error("Log not found");
    }
    const docRef = doc(db, 'productionLogs', id);
    await deleteDoc(docRef);
     // Decrement component's total cycles
    const totalCyclesToDecrement = (logToDelete.good || 0) + (logToDelete.scrapped || 0);
    if (totalCyclesToDecrement > 0) {
        const componentDocRef = doc(db, 'components', logToDelete.componentId);
        await updateDoc(componentDocRef, {
            cicliTotali: increment(-totalCyclesToDecrement),
        });
    }

}

export const getUser = async (id: string): Promise<User | null> => {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToUser(docSnap) : null;
}

export const getUsers = async (): Promise<User[]> => {
    const snapshot = await getDocs(usersCol);
    return snapshot.docs.map(docToUser);
}

export const createUser = async (user: User): Promise<User | { error: string }> => {
    if (!user.id) {
        return { error: 'User ID is required.'};
    }
    const docRef = doc(db, 'users', user.id);
    const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
        return { error: 'User with this code already exists.' };
    }
    await setDoc(docRef, user);
    return user as User;
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
    if (updatedEvent) {
      if (updates.status === 'Chiuso') {
        const allEvents = await getEventsForMold(updatedEvent.sourceId);
        const hasOpenEvents = allEvents.some(e => e.status === 'Aperto');
        if (!hasOpenEvents) {
          const mold = await getMold(updatedEvent.sourceId);
          if (mold) {
            await updateMold(mold.id, { stato: 'Operativo' });
          }
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

    const mold = await getMold(eventData.sourceId);
    let newStatus: Mold['stato'] | null = null;

    if (eventData.type === 'Manutenzione' || eventData.type === 'Riparazione') {
        newStatus = 'In Manutenzione';
    } else if (eventData.type === 'Lavorazione') {
        newStatus = 'Lavorazione';
    }

    if (newStatus && mold) {
         await updateMold(mold.id, { stato: newStatus as Mold['stato'] });
    }

    return {
        id: docRef.id,
        ...eventData,
        timestamp: new Date(),
        status: 'Aperto'
    };
}
