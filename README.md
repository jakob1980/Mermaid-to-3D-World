# Mermaid-to-3D-World

Un'applicazione web che trasforma diagrammi [Mermaid](https://mermaid.js.org/) in mondi 3D esplorabili. 

## 🚀 Caratteristiche

- Carica file Mermaid (`.mmd` o `.txt`) e visualizzali in un ambiente 3D
- Esplora il mondo 3D usando la telecamera interattiva
- Segui collegamenti tra nodi con un semplice click
- Supporto per diagrammi di flusso, sequenza e classe
- Esempi predefiniti per un utilizzo immediato
- Interfaccia intuitiva con guida integrata

## 📋 Requisiti

- Browser web moderno con supporto WebGL (Chrome, Firefox, Edge, Safari recenti)
- Nessuna installazione richiesta, funziona direttamente nel browser

## 🔧 Installazione

1. Clona questo repository:
   ```
   git clone https://github.com/tuouser/mermaid-to-3d-world.git
   ```

2. Naviga nella directory del progetto:
   ```
   cd mermaid-to-3d-world
   ```

3. Avvia un server web locale:
   ```
   # Con Python 3
   python -m http.server
   
   # Con Node.js
   npx serve
   ```

4. Apri il browser e naviga a `http://localhost:8000` (o la porta indicata dal tuo server)

## 📊 Utilizzo

1. **Carica un diagramma Mermaid:**
   - Clicca su "Carica Diagramma" e seleziona un file `.mmd` o `.txt`
   - Oppure trascina il file direttamente nell'applicazione

2. **Prova un esempio:**
   - Seleziona uno degli esempi dal menu a tendina
   - Clicca su "Carica Esempio"

3. **Esplora il mondo 3D:**
   - Usa il tasto sinistro del mouse + trascinamento per ruotare la vista
   - Usa la rotella del mouse per lo zoom
   - Usa il tasto destro del mouse + trascinamento per spostare la vista
   - Clicca su un nodo per selezionarlo
   - Clicca su un collegamento per seguirlo
   - Usa il pulsante "Reimposta Vista" o premi ESC per tornare alla vista iniziale

## 📂 Struttura del progetto

```
/project-root
├── /src
│   ├── /parser
│   │   ├── mermaidParser.js          # Logica per parsare il file Mermaid in JSON
│   │   └── jsonGenerator.js          # Genera il JSON dal parsing
│   │
│   ├── /scene
│   │   ├── sceneBuilder.js           # Crea la scena 3D con Babylon.js
│   │   ├── nodeRenderer.js           # Crea i nodi (strutture 3D)
│   │   ├── pathRenderer.js           # Crea i sentieri (collegamenti)
│   │   └── cameraController.js       # Gestisce telecamera e navigazione
│   │
│   ├── /ui
│   │   ├── uiManager.js              # Gestisce l'interfaccia utente
│   │   └── eventHandler.js           # Gestisce gli eventi utente
│   │
│   └── main.js                       # Punto di ingresso dell'applicazione
│
├── /assets
│   ├── /models                       # Modelli 3D personalizzati
│   ├── /textures                     # Texture per nodi o terreno
│   └── /sounds                       # Suoni (opzionale)
│
├── /lib
│   └── babylon.js                    # Libreria Babylon.js
│
├── /styles
│   └── main.css                      # Stili per l'interfaccia
│
├── /data
│   ├── simple.mmd                    # Esempio semplice
│   ├── flowchart.mmd                 # Esempio di diagramma di flusso
│   ├── sequence.mmd                  # Esempio di diagramma di sequenza
│   └── class.mmd                     # Esempio di diagramma di classe
│
├── index.html                        # File HTML principale
└── README.md                         # Documentazione del progetto
```

## 🔍 Diagrammi Mermaid supportati

L'applicazione supporta i seguenti tipi di diagrammi Mermaid:

1. **Diagrammi di flusso (`flowchart` o `graph`):**
   ```
   graph TD
   A[Start] --> B[Process]
   B --> C[End]
   ```

2. **Diagrammi di sequenza (`sequenceDiagram`):**
   ```
   sequenceDiagram
   Alice->>John: Hello John, how are you?
   John-->>Alice: Great!
   ```

3. **Diagrammi di classe (`classDiagram`):**
   ```
   classDiagram
   Class01 <|-- AveryLongClass
   Class03 *-- Class04
   ```

## 🔄 Come funziona

L'applicazione segue questo processo:

1. L'utente carica un file Mermaid
2. Il parser JavaScript analizza il diagramma ed estrae nodi e collegamenti
3. Il generatore JSON converte i dati in un formato strutturato
4. Il builder della scena crea un mondo 3D usando Babylon.js:
   - Ogni nodo diventa una struttura 3D con etichetta
   - Ogni collegamento diventa un sentiero tra strutture
5. L'utente può esplorare il mondo 3D e interagire con esso

## 🛠️ Personalizzazione

Per personalizzare l'aspetto del mondo 3D:

1. Modifica i materiali e le forme nei file:
   - `nodeRenderer.js` per cambiare l'aspetto dei nodi
   - `pathRenderer.js` per modificare l'aspetto dei collegamenti

2. Aggiungi texture e modelli 3D personalizzati nella cartella `/assets`

3. Modifica il layout dei nodi in `sceneBuilder.js` per cambiare la disposizione spaziale

## ⚙️ Avanzato: Integrazione con altri sistemi

È possibile integrare questa applicazione con altri sistemi:

1. **Generazione automatica di diagrammi:**
   - Genera diagrammi Mermaid dal tuo codice o database
   - Caricali nell'applicazione per visualizzazioni 3D automatiche

2. **Embed in altre applicazioni:**
   - Puoi integrare questa visualizzazione in altre applicazioni web
   - Usa `<iframe>` o importa i moduli JavaScript direttamente

## 📝 Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.

## 👏 Riconoscimenti

- [Babylon.js](https://www.babylonjs.com/) per il motore 3D
- [Mermaid](https://mermaid.js.org/) per la sintassi dei diagrammi
