# Documentazione dell'App Sopranostampi

Questo documento fornisce una panoramica completa delle caratteristiche e delle funzionalità dell'applicazione Sopranostampi. Questa app è progettata per essere un potente strumento per la gestione di stampi, componenti, macchine e dati operativi correlati.

## 1. Ruoli Utente e Accesso

L'applicazione dispone di un sistema di controllo degli accessi basato sui ruoli con due tipi principali di utenti:

*   **Amministratore (`Admin`)**: Gli amministratori hanno accesso completo a tutti i dati e le funzionalità. Possono creare, modificare ed eliminare tutti gli elementi (stampi, componenti, macchine), gestire gli account utente e le autorizzazioni, visualizzare tutte le analisi e approvare le richieste di manutenzione. I codici utente di default per gli amministratori sono `admin` e `guilhermevolp93`.
*   **Utente Standard (`User`)**: Gli utenti standard hanno un accesso limitato. Possono visualizzare solo gli elementi (stampi, componenti, macchine) per cui è stata concessa loro esplicitamente l'autorizzazione. La loro visuale è personalizzata in base alle loro specifiche responsabilità. L'utente standard di default è `user01`.

Per accedere, inserisci semplicemente il tuo codice utente assegnato nella pagina principale.

### Sistema di Permessi

Il sistema di permessi per gli Utenti Standard è progettato per essere intelligente ed efficiente:
- Se a un utente viene concesso l'accesso a uno **stampo**, ottiene automaticamente l'accesso in visualizzazione a tutti i **componenti** associati a quello stampo e alla **macchina** a cui lo stampo è assegnato.
- Se a un utente viene concesso l'accesso a un **componente**, ottiene automaticamente l'accesso in visualizzazione a tutti gli **stampi** che possono produrre quel componente.

Questo assicura che gli utenti abbiano accesso al contesto completo degli articoli di cui sono responsabili, senza la necessità di assegnare i permessi uno per uno.

## 2. Sezioni Principali

### Dashboard
La Dashboard è la pagina principale dopo aver effettuato l'accesso. Fornisce una panoramica di alto livello delle metriche chiave e un accesso rapido alle attività comuni.
- **Schede Statistiche**: Mostra indicatori di performance chiave (KPI) come il numero totale di stampi, gli stampi attualmente in manutenzione e gli stampi presso fornitori esterni (visibile agli amministratori).
- **Eventi Imminenti**: Mostra un elenco di eventi futuri programmati, come manutenzioni o riparazioni, con gli eventi scaduti evidenziati.
- **Ricerca Stampi Associati**: Un'utilità per trovare rapidamente quali stampi sono necessari per produrre un componente specifico.
- **Log Produzione Rapido**: Un modulo per registrare rapidamente le produzioni (pezzi buoni e scarti) per qualsiasi componente, cercandolo tramite il suo codice.

### Stampi
Questa sezione è dedicata alla gestione dell'inventario degli stampi.
- **Vista Elenco**: Mostra tutti gli stampi, incluse le relazioni padre-figlio (ad esempio, un sotto-stampo elencato sotto il suo stampo principale). È possibile cercare e filtrare per stato. Gli amministratori possono anche importare/esportare dati tramite CSV.
- **Vista Dettaglio**: Cliccando su uno stampo si visualizzano tutti i suoi dettagli, tra cui:
    - Informazioni di base, posizione (interna/esterna) e dati tecnici/gestionali.
    - **Allegati**: Carica e gestisci disegni tecnici, file 3D (STEP, IGES) e altri documenti.
    - **Componenti Associati**: Visualizza un elenco di tutti i componenti che possono essere prodotti da questo stampo.
    - **Storico Eventi**: Una cronologia di tutti gli eventi (manutenzione, riparazioni, costi) relativi a questo stampo. Gli amministratori possono aggiungere, modificare o completare eventi da qui.

### Componenti
Questa sezione gestisce l'inventario di tutti i componenti prodotti.
- **Vista Elenco**: Una tabella ricercabile e filtrabile di tutti i componenti. Gli amministratori possono importare/esportare dati tramite CSV.
- **Vista Dettaglio**: Fornisce una visione completa di un componente, tra cui:
    - Informazioni di base, materiale, peso e cicli totali di produzione.
    - **Dati di Stampaggio**: Un elenco dettagliato dei parametri del processo di iniezione (es. tempo ciclo, temperature, pressioni). Questi dati possono essere modificati da qualsiasi utente con accesso.
    - **Storico Dati di Stampaggio**: Un registro di controllo che traccia tutte le modifiche apportate ai parametri di stampaggio, indicando chi ha effettuato la modifica e quando.
    - **Storico Produzione**: Un registro di tutte le singole produzioni, che mostra le parti buone rispetto a quelle di scarto.
    - **Allegati e Checklist**: Gestisci i file specifici del componente e le checklist di controllo qualità.

### Macchine
Questa sezione, visibile agli amministratori, è per la gestione dei macchinari di produzione.
- **Vista Elenco**: Una tabella ricercabile e filtrabile di tutte le macchine.
- **Vista Dettaglio**: Mostra i dettagli della macchina (tipo, numero di serie, costo) e il suo storico completo degli eventi (manutenzione, riparazioni).

### Calendario
La sezione Calendario (visibile solo agli amministratori) offre una visione d'insieme di tutti gli eventi programmati per l'intero parco asset (stampi e macchine).
- **Vista Mensile**: Una vista mensile tradizionale in cui i giorni con eventi programmati sono contrassegnati da un indicatore visivo.
- **Dettagli Evento su Click**: Cliccando su un giorno specifico, un pop-up mostrerà un elenco dettagliato di tutti gli eventi la cui data di fine prevista corrisponde a quel giorno.
- **Accesso Rapido**: Dall'elenco nel pop-up, è possibile cliccare su un singolo evento per aprire una barra laterale che permette di visualizzarne o modificarne i dettagli, esattamente come dalla pagina di dettaglio dell'asset.

## 3. Flussi di Lavoro e Funzionalità

### Gestione Eventi
Gli eventi tracciano il ciclo di vita di stampi e macchine.
- **Creazione Eventi**: Gli amministratori possono aggiungere eventi direttamente dalla pagina di dettaglio di un articolo, specificando il tipo (Manutenzione, Riparazione, ecc.), la descrizione e la data di fine prevista.
- **Aggiornamento Eventi**: Gli eventi aperti possono essere modificati. È anche possibile contrassegnare un evento come "Completato", il che imposta automaticamente lo stato dell'articolo su "Operativo" se non ci sono altri eventi aperti.

### Richieste di Manutenzione
Questa sezione, solo per amministratori, semplifica il processo di richiesta di interventi sugli asset.
- **Invio di una Richiesta**: Qualsiasi utente può inviare una richiesta di manutenzione tramite la pagina "Nuova Richiesta", specificando l'articolo e il motivo.
- **Flusso di Approvazione**: Gli amministratori possono esaminare le richieste in sospeso. L'approvazione di una richiesta crea automaticamente un nuovo evento di "Manutenzione" per l'articolo specificato e lo imposta sullo stato "In Manutenzione".

### Analisi
La Dashboard di Analisi (solo per amministratori) fornisce approfondimenti visivi sulle metriche aziendali chiave:
- **Distribuzione Stato Stampi**: Un grafico a torta che mostra lo stato attuale di tutti gli stampi.
- **Stampi per Fornitore**: Un grafico a barre che mostra quanti stampi si trovano presso ciascun fornitore esterno.
- **Tasso di Scarto dei Componenti**: Un grafico a barre che evidenzia quali componenti hanno la più alta percentuale di parti scartate, aiutando a identificare problemi di qualità.
- **Aderenza alla Pianificazione degli Eventi**: Un grafico che confronta le date di completamento stimate con quelle effettive per gli eventi, mostrando il ritardo medio per diversi tipi di evento.
- **Costi di Manutenzione nel Tempo**: Un grafico a linee che traccia i costi totali di manutenzione e riparazione per mese.

### Localizzazione
L'interfaccia utente può essere commutata tra **Inglese** e **Italiano** utilizzando il selettore di lingua nell'intestazione.
