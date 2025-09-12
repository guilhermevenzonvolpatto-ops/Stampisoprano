
// This script is for seeding your local Firestore database for development.
// It is not required for Vercel deployment.
// To run this script:
// 1. Download your Firebase service account key and save it as 'serviceAccountKey.json' in the root.
// 2. Run `npm install firebase-admin`
// 3. Run `node seed.js`
const admin = require('firebase-admin');

// IMPORTANT: Make sure you have downloaded your service account key and
// placed it in the root of your project folder as 'serviceAccountKey.json'
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('Firebase Admin Initialized.');

const users = {
    'guilhermevolp93': { id: 'guilhermevolp93', name: 'Guilherme Volpato', isAdmin: true, allowedCodes: [], allowedMachines: [] },
    'user01': { id: 'user01', name: 'Normal User', isAdmin: false, allowedCodes: ['ST-001', 'COMP-A1'], allowedMachines: ['MAC-01'] },
    'admin': { id: 'admin', name: 'Admin User', isAdmin: true, allowedCodes: [], allowedMachines: [] },
};

const molds = {
  'ST-001': {
    id: 'ST-001', codice: 'ST-001', descrizione: 'Stampo Principale A', data: '2023-10-15', padre: null, stato: 'Operativo', isDeleted: false,
    posizione: { type: 'interna', value: 'Reparto 1' },
    datiTecnici: { impronte: 4, materialeCostruzione: 'Acciaio 1.2343', dimensioniPeso: '80x60x50cm - 800kg' },
    datiGestionali: { costoAcquisto: 55000, vitaUtileStimata: 1000000 },
    macchinaAssociata: 'MAC-01',
    customFields: { 'Codice Progetto': 'PRJ-2024-44', 'Centro di Costo': 'CC-0123' },
    attachments: [
        { id: 'ATT001', fileName: 'Disegno_Tecnico_Rev2.pdf', fileType: 'PDF', url: '#', uploadedAt: '2024-03-15' },
        { id: 'ATT002', fileName: 'Modello_3D_v1.step', fileType: '3D', url: '#', uploadedAt: '2024-03-18' },
    ]
  },
  'ST-001-A': {
    id: 'ST-001-A', codice: 'ST-001-A', descrizione: 'Tassello Mobile per ST-001', data: '2023-12-01', padre: 'ST-001', stato: 'Operativo', isDeleted: false,
    posizione: { type: 'interna', value: 'Magazzino' }
  },
  'ST-002': {
    id: 'ST-002', codice: 'ST-002', descrizione: 'Stampo Fornitore B', data: '2023-05-20', padre: null, stato: 'In Manutenzione', isDeleted: false,
    posizione: { type: 'esterna', value: 'Rossi & Figli S.p.A.' }
  },
  'ST-003': {
    id: 'ST-003', codice: 'ST-003', descrizione: 'Stampo Prova C', data: '2023-08-01', padre: null, stato: 'Lavorazione', isDeleted: false,
    posizione: { type: 'interna', value: 'Area Test' }
  },
   'ST-004': {
    id: 'ST-004', codice: 'ST-004', descrizione: 'Stampo Fermo D', data: '2022-01-10', padre: null, stato: 'Fermo', isDeleted: false,
    posizione: { type: 'esterna', value: 'Bianchi Srl' }
  },
};

const components = {
    'COMP-A1': { id: 'COMP-A1', codice: 'COMP-A1', descrizione: 'Coperchio Superiore', materiale: 'ABS', peso: 120.5, stato: 'Attivo', cicliTotali: 12500, associatedMolds: ['ST-001'], customFields: { 'Finitura': 'Lucida', 'Colore RAL': '9010' } },
    'COMP-B2': { id: 'COMP-B2', codice: 'COMP-B2', descrizione: 'Base Inferiore', materiale: 'PC-ABS', peso: 250.0, stato: 'Attivo', cicliTotali: 8760, associatedMolds: ['ST-001', 'ST-003'] },
    'COMP-C3': { id: 'COMP-C3', codice: 'COMP-C3', descrizione: 'Guarnizione', materiale: 'TPE', peso: 15.2, stato: 'Obsoleto', cicliTotali: 50000, associatedMolds: ['ST-002'] },
};

const machines = {
    'MAC-01': { id: 'MAC-01', codice: 'MAC-01', descrizione: 'Pressa Arburg 200T', tipo: 'Iniezione', stato: 'Operativo', customFields: { 'Numero Serie': 'SN-582294', 'Data Installazione': '2021-03-15' } },
    'MAC-02': { id: 'MAC-02', codice: 'MAC-02', descrizione: 'Pressa Engel 300T', tipo: 'Iniezione', stato: 'In Manutenzione' },
};

const eventsData = [
    { id: 'EVT001', sourceId: 'ST-002', type: 'Manutenzione', descrizione: 'Sostituzione inserto danneggiato', costo: 1200, timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-05-10')), estimatedEndDate: '2024-07-25', status: 'Aperto' },
    { id: 'EVT002', sourceId: 'ST-003', type: 'Lavorazione', descrizione: 'Produzione lotto #5543', costo: null, timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-05-01')), estimatedEndDate: '2024-08-01', status: 'Aperto' },
    { id: 'EVT003', sourceId: 'ST-001', type: 'Costo', descrizione: 'Manutenzione ordinaria', costo: 350, timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-04-15')), estimatedEndDate: '2024-04-15', actualEndDate: '2024-04-15', status: 'Chiuso'},
    { id: 'EVT004', sourceId: 'MAC-02', type: 'Riparazione', descrizione: 'Sostituzione scheda elettronica', costo: 850, timestamp: admin.firestore.Timestamp.fromDate(new Date('2024-06-20')), estimatedEndDate: '2024-07-15', status: 'Aperto'},
];

async function seedCollection(collectionName, data) {
    console.log(`\nSeeding collection: ${collectionName}...`);
    const collectionRef = db.collection(collectionName);
    const batch = db.batch();

    for (const [docId, docData] of Object.entries(data)) {
        // For most collections, the document ID is the key from the object
        const docRef = collectionRef.doc(docId);
        batch.set(docRef, docData);
        console.log(`  - Staged write for ${collectionName}/${docId}`);
    }

    await batch.commit();
    console.log(`Seeding for ${collectionName} complete.`);
}

async function seedEvents() {
    console.log(`\nSeeding collection: events...`);
    const collectionRef = db.collection('events');
    const batch = db.batch();

    eventsData.forEach(event => {
        // For events, we use the ID from the object itself
        const docRef = collectionRef.doc(event.id);
        batch.set(docRef, event);
        console.log(`  - Staged write for events/${event.id}`);
    });

    await batch.commit();
    console.log(`Seeding for events complete.`);
}


async function main() {
  try {
    await seedCollection('users', users);
    await seedCollection('molds', molds);
    await seedCollection('components', components);
    await seedCollection('machines', machines);
    await seedEvents();
    console.log('\nDatabase seeding finished successfully!');
  } catch (error) {
    console.error('\nError seeding database:', error);
    process.exit(1);
  }
}

main();
