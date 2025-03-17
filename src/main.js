// main.js
// Punto di ingresso principale dell'applicazione Mermaid-to-3D-World

import { JsonGenerator } from './parser/json-generator.js';
import { initSceneBuilder } from './scene/scene-builder.js';
import { initUI } from './ui/ui-manager.js';

// Classe principale dell'applicazione
class MermaidTo3DWorld {
  constructor() {
    console.log('Inizializzazione applicazione Mermaid-to-3D-World...');
    
    // Riferimenti agli elementi UI
    this.loadingIndicator = document.getElementById('loadingIndicator');
    this.statusMessage = document.getElementById('statusMessage');
    this.canvas = document.getElementById('renderCanvas');
    
    // Inizializza il generatore JSON
    this.jsonGenerator = new JsonGenerator();
    
    // Inizializza il builder della scena
    this.sceneBuilder = null;
  }

  /**
   * Inizializza l'applicazione
   */
  init() {
    console.log("Inizializzazione applicazione...");
    
    // Verifica che il canvas esista
    if (!this.canvas) {
      console.error('Canvas element not found!');
      this.showStatus('Errore: Canvas non trovato.', true);
      return;
    }
    
    // Verifica che Babylon.js sia caricato
    if (typeof BABYLON === 'undefined') {
      console.error('Babylon.js non caricato!');
      this.showStatus('Errore: Babylon.js non caricato. Riprova a ricaricare la pagina.', true);
      return;
    }
    
    // Inizializza l'interfaccia utente
    console.log("Inizializzazione UI...");
    initUI({
      onFileLoaded: this.handleFileUpload.bind(this),
      onExampleSelected: this.handleExampleSelection.bind(this)
    });
    
    // Inizializza il builder della scena
    console.log("Inizializzazione SceneBuilder...");
    this.sceneBuilder = initSceneBuilder(this.canvas);
    
    // Mostra messaggio di inizializzazione completata
    this.showStatus('Applicazione inizializzata. Carica un diagramma Mermaid per iniziare.');
  }

  /**
   * Gestisce il caricamento di un file Mermaid
   * @param {File} file Il file caricato
   */
  async handleFileUpload(file) {
    try {
      console.log("Inizio elaborazione file:", file.name);
      this.showLoading('Parsing del file Mermaid...');
      
      // Genera JSON dal file Mermaid
      console.log("Chiamata a generateFromFile...");
      const jsonData = await this.jsonGenerator.generateFromFile(file);
      console.log("JSON generato:", jsonData);
      
      // Verifica se il JSON è valido
      if (!jsonData.nodes || jsonData.nodes.length === 0) {
        throw new Error('Nessun nodo trovato nel diagramma.');
      }
      
      // Costruisci la scena 3D dal JSON
      this.showLoading('Costruzione della scena 3D...');
      console.log("Costruzione scena 3D...");
      await this.sceneBuilder.buildFromJSON(jsonData);
      console.log("Scena 3D costruita");
      
      this.hideLoading();
      this.showStatus(`Mondo 3D creato con successo. ${jsonData.nodes.length} nodi e ${jsonData.edges.length} collegamenti.`);
    } catch (error) {
      console.error('Errore dettagliato durante l\'elaborazione del file:', error);
      console.error('Stack trace:', error.stack);
      this.hideLoading();
      this.showStatus(`Errore: ${error.message}`, true);
    }
  }

  /**
   * Gestisce la selezione di un esempio
   * @param {string} exampleName Nome dell'esempio selezionato
   */
  async handleExampleSelection(exampleName) {
    try {
      console.log("Caricamento esempio:", exampleName);
      this.showLoading('Caricamento esempio...');
      
      // Carica il file di esempio
      console.log("Fetch del file:", `data/sample-${exampleName}.mmd`);
      const response = await fetch(`data/sample-${exampleName}.mmd`);
      if (!response.ok) {
        throw new Error(`Impossibile caricare l'esempio (${response.status}): ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log("Contenuto esempio:", content.substring(0, 100) + "...");
      
      // Genera JSON dal contenuto Mermaid
      console.log("Generazione JSON...");
      const jsonData = this.jsonGenerator.generateFromString(content);
      console.log("JSON generato:", jsonData);
      
      // Verifica se il JSON è valido
      if (!jsonData.nodes || jsonData.nodes.length === 0) {
        throw new Error('Nessun nodo trovato nel diagramma di esempio.');
      }
      
      // Costruisci la scena 3D dal JSON
      this.showLoading('Costruzione della scena 3D...');
      console.log("Costruzione scena 3D...");
      await this.sceneBuilder.buildFromJSON(jsonData);
      console.log("Scena 3D costruita");
      
      this.hideLoading();
      this.showStatus(`Esempio caricato con successo. ${jsonData.nodes.length} nodi e ${jsonData.edges.length} collegamenti.`);
    } catch (error) {
      console.error('Errore dettagliato durante il caricamento dell\'esempio:', error);
      console.error('Stack trace:', error.stack);
      this.hideLoading();
      this.showStatus(`Errore: ${error.message}`, true);
    }
  }

  /**
   * Mostra un messaggio di stato
   * @param {string} message Messaggio da mostrare
   * @param {boolean} isError Se true, mostra come errore
   */
  showStatus(message, isError = false) {
    if (this.statusMessage) {
      this.statusMessage.textContent = message;
      this.statusMessage.className = isError ? 'error' : 'success';
      this.statusMessage.style.display = 'block';
      
      // Nascondi dopo 5 secondi se non è un errore
      if (!isError) {
        setTimeout(() => {
          this.statusMessage.style.display = 'none';
        }, 5000);
      }
    }
  }

  /**
   * Mostra l'indicatore di caricamento
   * @param {string} message Messaggio di caricamento
   */
  showLoading(message) {
    if (this.loadingIndicator) {
      const messageElement = this.loadingIndicator.querySelector('.message');
      if (messageElement) {
        messageElement.textContent = message;
      }
      this.loadingIndicator.style.display = 'flex';
      
      // Timeout di sicurezza: nasconde il caricamento dopo 10 secondi per evitare stalli
      this.loadingTimeout = setTimeout(() => {
        console.warn('Timeout di caricamento: operazione troppo lunga');
        this.hideLoading();
        this.showStatus('Timeout: operazione interrotta dopo 10 secondi.', true);
      }, 10000);
    }
  }

  /**
   * Nasconde l'indicatore di caricamento
   */
  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
    
    // Cancella il timeout di sicurezza se esiste
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  }
}

// Inizializza l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  const app = new MermaidTo3DWorld();
  app.init();
});

// Esporta la classe principale
export { MermaidTo3DWorld };
