

import { FieldValue } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
  allowedCodes: string[];
  language?: 'en' | 'it';
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: '3D' | 'PDF' | 'Image' | 'Document';
  url: string;
  uploadedAt: string;
  storagePath: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface Mold {
  id:string;
  codice: string;
  descrizione: string;
  data: string;
  padre: string | null;
  stato: 'Operativo' | 'In Manutenzione' | 'Lavorazione' | 'Fermo';
  isDeleted: boolean;
  posizione: {
    type: 'interna' | 'esterna';
    value: string;
  };
  datiTecnici?: {
    impronte?: number;
    materialeCostruzione?: string;
    dimensioniPeso?: string;
  };
  datiGestionali?: {
    costoAcquisto?: number;
    vitaUtileStimata?: number;
  };
  macchinaAssociata?: string | null;
  customFields?: Record<string, any>;
  attachments?: Attachment[];
  children?: Mold[];
  availableAt?: string;
}

export interface StampingData {
  programName?: string;
  cycleTime?: number;
  injectionTime?: number;
  holdingPressure?: number;
  meltTemperature?: number;
  moldTemperature?: number;
  clampForce?: number;
  injectionPressure?: number;
  postPressure?: number;
  maintenanceTime?: number;
  coolingTime?: number;
  counterPressure?: number;
  injectionSpeed?: number;
}

export interface StampingDataHistoryEntry {
  id: string;
  componentId: string;
  timestamp: Date;
  user: string;
  changedData: Partial<StampingData>;
}

export interface Component {
  id: string;
  codice: string;
  descrizione: string;
  materiale: string;
  peso: number;
  stato: 'Attivo' | 'In modifica' | 'Obsoleto';
  cicliTotali: number;
  isDeleted: boolean;
  associatedMolds: string[];
  checklist?: ChecklistItem[];
  datiMateriaPrima?: {
    codiceMaterialeSpecifico?: string;
  };
  stampingData?: StampingData;
  customFields?: Record<string, any>;
  attachments?: Attachment[];
  dataRilascio?: string;
  isAesthetic?: boolean;
  isFoodContact?: boolean;
}

export interface Machine {
  id: string;
  codice: string;
  descrizione: string;
  tipo: string;
  stato: 'Operativo' | 'In Manutenzione' | 'Fermo';
  isDeleted: boolean;
  purchaseCost?: number;
  manufacturingYear?: number;
  serialNumber?: string;
  customFields?: Record<string, any>;
  attachments?: Attachment[];
  availableAt?: string;
}

export interface MoldEvent {
  id: string;
  sourceId: string;
  type: 'Manutenzione' | 'Lavorazione' | 'Riparazione' | 'Costo' | 'Altro' | 'Fine Manutenzione';
  descrizione: string;
  costo: number | null;
  timestamp: Date;
  estimatedEndDate: string;
  actualEndDate?: string;
  status: 'Aperto' | 'Chiuso';
  customFields?: Record<string, any>;
  attachments?: Attachment[];
}

export interface MaintenanceRequest {
  id: string;
  sourceId: string; // Mold or Machine ID
  sourceCodice: string;
  sourceType: 'mold' | 'machine';
  description: string;
  requesterId: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface ProductionLog {
    id: string;
    componentId: string;
    good: number;
    scrapped: number;
    scrapReason: string;
    timestamp: Date;
    user: string;
    previousState?: {
      good: number;
      scrapped: number;
    };
}


// Data types for charts
export type MoldStatusDistribution = {
  status: 'Operativo' | 'In Manutenzione' | 'Lavorazione' | 'Fermo';
  count: number;
}[];

export type MoldSupplierDistribution = {
  supplier: string;
  count: number;
}[];

export type ComponentScrapRate = {
    componentId: string;
    componentCode: string;
    scrapRate: number;
}
