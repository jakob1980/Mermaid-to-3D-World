// uiManager.js
// Gestisce l'interfaccia utente dell'applicazione

import { handleEvents } from './event-handler.js';

// Classe per gestire l'interfaccia utente
class UIManager {
  /**
   * Costruttore
   * @param {Object} callbacks Funzioni di callback
   * @param {Function} callbacks.onFileLoaded Callback per il caricamento di un file
   * @param {Function} callbacks.onExampleSelected Callback per la selezione di un esempio
   */
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.elements = {};
    
    // Inizializza l'UI
    this.initializeUI();
  }

  /**
   * Inizializza gli elementi dell'interfaccia utente
   */
  initializeUI() {
    // Trova e memorizza i riferimenti agli elementi UI
    this.elements = {
      fileInput: document.getElementById('fileInput'),
      uploadButton: document.getElementById('uploadButton'),
      exampleSelect: document.getElementById('exampleSelect'),
      loadExampleButton: document.getElementById('loadExampleButton'),
      resetButton: document.getElementById('resetButton'),
      helpButton: document.getElementById('helpButton'),
      fullscreenButton: document.getElementById('fullscreenButton'),
      statusMessage: document.getElementById('statusMessage'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      canvas: document.getElementById('renderCanvas'),
      helpPanel: document.getElementById('helpPanel'),
      closeHelpButton: document.getElementById('closeHelpButton')
    };
    
    // Verifica che gli elementi esistano e crea quelli mancanti
    this.createMissingElements();
    
    // Collega gli eventi
    this.setupEventListeners();
  }

  /**
   * Crea gli elementi UI mancanti
   */
  createMissingElements() {
    // Controlla e crea il file input se non esiste
    if (!this.elements.fileInput) {
      this.elements.fileInput = document.createElement('input');
      this.elements.fileInput.type = 'file';
      this.elements.fileInput.id = 'fileInput';
      this.elements.fileInput.accept = '.mmd, .txt';
      this.elements.fileInput.style.display = 'none';
      document.body.appendChild(this.elements.fileInput);
    }
    
    // Controlla e crea il pannello principale se non esiste
    const controlPanel = document.getElementById('controlPanel');
    if (!controlPanel) {
      const panel = this.createControlPanel();
      document.body.insertBefore(panel, this.elements.canvas);
    }
    
    // Controlla e crea l'indicatore di caricamento se non esiste
    if (!this.elements.loadingIndicator) {
      this.elements.loadingIndicator = this.createLoadingIndicator();
      document.body.appendChild(this.elements.loadingIndicator);
    }
    
    // Controlla e crea il messaggio di stato se non esiste
    if (!this.elements.statusMessage) {
      this.elements.statusMessage = this.createStatusMessage();
      document.body.appendChild(this.elements.statusMessage);
    }
    
    // Controlla e crea il pannello di aiuto se non esiste
    if (!this.elements.helpPanel) {
      this.elements.helpPanel = this.createHelpPanel();
      document.body.appendChild(this.elements.helpPanel);
    }
    
    // Aggiorna i riferimenti agli elementi creati
    this.elements = {
      ...this.elements,
      fileInput: document.getElementById('fileInput'),
      uploadButton: document.getElementById('uploadButton'),
      exampleSelect: document.getElementById('exampleSelect'),
      loadExampleButton: document.getElementById('loadExampleButton'),
      resetButton: document.getElementById('resetButton'),
      helpButton: document.getElementById('helpButton'),
      fullscreenButton: document.getElementById('fullscreenButton'),
      statusMessage: document.getElementById('statusMessage'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      helpPanel: document.getElementById('helpPanel'),
      closeHelpButton: document.getElementById('closeHelpButton')
    };
  }

  /**
   * Crea il pannello di controllo
   * @returns {HTMLElement} Il pannello di controllo
   */
  createControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'controlPanel';
    panel.className = 'control-panel';
    
    // Sezione caricamento file
    const fileSection = document.createElement('div');
    fileSection.className = 'control-section';
    
    const uploadButton = document.createElement('button');
    uploadButton.id = 'uploadButton';
    uploadButton.className = 'control-button';
    uploadButton.textContent = 'Carica Diagramma';
    fileSection.appendChild(uploadButton);
    
    // Sezione esempi
    const exampleSection = document.createElement('div');
    exampleSection.className = 'control-section';
    
    const exampleSelect = document.createElement('select');
    exampleSelect.id = 'exampleSelect';
    exampleSelect.className = 'control-select';
    
    // Aggiungi opzioni di esempio
    const examples = [
      { value: 'simple', text: 'Esempio Semplice' },
      { value: 'flowchart', text: 'Diagramma di Flusso' },
      { value: 'sequence', text: 'Diagramma di Sequenza' },
      { value: 'class', text: 'Diagramma di Classe' }
    ];
    
    examples.forEach(example => {
      const option = document.createElement('option');
      option.value = example.value;
      option.textContent = example.text;
      exampleSelect.appendChild(option);
    });
    
    exampleSection.appendChild(exampleSelect);
    
    const loadExampleButton = document.createElement('button');
    loadExampleButton.id = 'loadExampleButton';
    loadExampleButton.className = 'control-button';
    loadExampleButton.textContent = 'Carica Esempio';
    exampleSection.appendChild(loadExampleButton);
    
    // Sezione controlli
    const controlsSection = document.createElement('div');
    controlsSection.className = 'control-section';
    
    const resetButton = document.createElement('button');
    resetButton.id = 'resetButton';
    resetButton.className = 'control-button';
    resetButton.textContent = 'Reimposta Vista';
    controlsSection.appendChild(resetButton);
    
    const helpButton = document.createElement('button');
    helpButton.id = 'helpButton';
    helpButton.className = 'control-button';
    helpButton.textContent = 'Aiuto';
    controlsSection.appendChild(helpButton);
    
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'fullscreenButton';
    fullscreenButton.className = 'control-button';
    fullscreenButton.textContent = 'Schermo Intero';
    controlsSection.appendChild(fullscreenButton);
    
    // Aggiungi le sezioni al pannello
    panel.appendChild(fileSection);
    panel.appendChild(exampleSection);
    panel.appendChild(controlsSection);
    
    return panel;
  }

  /**
   * Crea l'indicatore di caricamento
   * @returns {HTMLElement} L'indicatore di caricamento
   */
  createLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loadingIndicator';
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.display = 'none';
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    loadingIndicator.appendChild(spinner);
    
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = 'Caricamento in corso...';
    loadingIndicator.appendChild(message);
    
    return loadingIndicator;
  }

  /**
   * Crea il messaggio di stato
   * @returns {HTMLElement} Il messaggio di stato
   */
  createStatusMessage() {
    const statusMessage = document.createElement('div');
    statusMessage.id = 'statusMessage';
    statusMessage.className = 'status-message';
    statusMessage.style.display = 'none';
    
    return statusMessage;
  }

  /**
   * Crea il pannello di aiuto
   * @returns {HTMLElement} Il pannello di aiuto
   */
  createHelpPanel() {
    const helpPanel = document.createElement('div');
    helpPanel.id = 'helpPanel';
    helpPanel.className = 'help-panel';
    helpPanel.style.display = 'none';
    
    const helpHeader = document.createElement('div');
    helpHeader.className = 'help-header';
    
    const helpTitle = document.createElement('h2');
    helpTitle.textContent = 'Guida all\'Uso';
    helpHeader.appendChild(helpTitle);
    
    const closeButton = document.createElement('button');
    closeButton.id = 'closeHelpButton';
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    helpHeader.appendChild(closeButton);
    
    helpPanel.appendChild(helpHeader);
    
    const helpContent = document.createElement('div');
    helpContent.className = 'help-content';
    
    // Contenuto della guida
    helpContent.innerHTML = `
      <h3>Mermaid-to-3D-World</h3>
      <p>Questa applicazione trasforma i diagrammi Mermaid in mondi 3D esplorabili.</p>
      
      <h4>Come Usare:</h4>
      <ol>
        <li><strong>Carica un File:</strong> Carica un file di testo in formato Mermaid (.mmd o .txt).</li>
        <li><strong>Carica un Esempio:</strong> Seleziona un esempio predefinito dal menu a tendina.</li>
        <li><strong>Esplora il Mondo 3D:</strong> Usa il mouse per navigare nel mondo 3D.</li>
      </ol>
      
      <h4>Controlli di Navigazione:</h4>
      <ul>
        <li><strong>Rotazione Camera:</strong> Tasto sinistro + trascina</li>
        <li><strong>Zoom:</strong> Rotella del mouse</li>
        <li><strong>Spostamento:</strong> Tasto destro + trascina</li>
        <li><strong>Seleziona Nodo:</strong> Click su un nodo</li>
        <li><strong>Segui Collegamento:</strong> Click su un collegamento</li>
        <li><strong>Centra Camera:</strong> Doppio click su un nodo</li>
        <li><strong>Reimposta Vista:</strong> Pulsante "Reimposta Vista" o tasto ESC</li>
      </ul>
    `;
    
    helpPanel.appendChild(helpContent);
    
    return helpPanel;
  }

  /**
   * Collega gli eventi agli elementi dell'interfaccia
   */
  setupEventListeners() {
    // Collega gli eventi usando il modulo eventHandler
    handleEvents(this.elements, this.callbacks);
  }
  
  /**
   * Mostra un messaggio di stato
   * @param {string} message Messaggio da mostrare
   * @param {boolean} isError Se true, mostra il messaggio come errore
   * @param {number} duration Durata in millisecondi (0 per non nascondere)
   */
  showStatus(message, isError = false, duration = 5000) {
    if (!this.elements.statusMessage) return;
    
    this.elements.statusMessage.textContent = message;
    this.elements.statusMessage.className = isError ? 
      'status-message error' : 'status-message success';
    this.elements.statusMessage.style.display = 'block';
    
    // Nascondi dopo la durata specificata (se non è 0)
    if (duration > 0) {
      setTimeout(() => {
        this.elements.statusMessage.style.display = 'none';
      }, duration);
    }
  }
  
  /**
   * Mostra l'indicatore di caricamento
   * @param {string} message Messaggio di caricamento
   */
  showLoading(message = 'Caricamento in corso...') {
    if (!this.elements.loadingIndicator) return;
    
    const messageElement = this.elements.loadingIndicator.querySelector('.message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    
    this.elements.loadingIndicator.style.display = 'flex';
  }
  
  /**
   * Nasconde l'indicatore di caricamento
   */
  hideLoading() {
    if (!this.elements.loadingIndicator) return;
    
    this.elements.loadingIndicator.style.display = 'none';
  }
  
  /**
   * Attiva/disattiva la modalità a schermo intero
   */
  toggleFullscreen() {
    const container = document.documentElement;
    
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }
}

/**
 * Inizializza e restituisce un'istanza del gestore dell'interfaccia
 * @param {Object} callbacks Funzioni di callback
 * @returns {UIManager} Istanza del gestore dell'interfaccia
 */
export function initUI(callbacks) {
  const uiManager = new UIManager(callbacks);
  return uiManager;
}

// Esporta funzioni e classi
export { UIManager };
