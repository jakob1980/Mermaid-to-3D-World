// jsonGenerator.js
// Genera il JSON dal parsing dei diagrammi Mermaid

import { MermaidParser, GraphData } from './mermaid-parser.js';

/**
 * Classe JsonGenerator per convertire i dati del parser in JSON
 */
class JsonGenerator {
  constructor() {
    this.parser = new MermaidParser();
  }

  /**
   * Genera JSON da una stringa Mermaid
   * @param {string} mermaidContent - Contenuto del diagramma Mermaid
   * @returns {Object} Oggetto JSON con nodi e collegamenti
   */
  generateFromString(mermaidContent) {
    try {
      console.log("JsonGenerator: generateFromString chiamato");
      
      // Utilizza il parser per estrarre nodi e collegamenti
      console.log("JsonGenerator: chiamata a parser.parse");
      const graphData = this.parser.parse(mermaidContent);
      console.log("JsonGenerator: parse completato, risultato:", graphData);
      
      // Converti i dati nel formato JSON richiesto
      console.log("JsonGenerator: conversione in formato JSON");
      const result = this._convertToJsonFormat(graphData);
      console.log("JsonGenerator: conversione completata");
      
      return result;
    } catch (error) {
      console.error(`Errore durante la generazione del JSON: ${error}`);
      console.error('Stack trace:', error.stack);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * Genera JSON da un file Mermaid
   * @param {File} file - File Mermaid
   * @returns {Promise<Object>} Promise con l'oggetto JSON
   */
  async generateFromFile(file) {
    try {
      console.log("JsonGenerator: generateFromFile chiamato per", file.name);
      
      // Leggi il contenuto del file
      console.log("JsonGenerator: lettura contenuto file");
      const content = await this._readFileContent(file);
      console.log("JsonGenerator: lettura completata, lunghezza:", content.length);
      
      // Genera il JSON dalla stringa
      return this.generateFromString(content);
    } catch (error) {
      console.error(`Errore durante la lettura del file: ${error}`);
      console.error('Stack trace:', error.stack);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * Legge il contenuto di un file
   * @param {File} file - File da leggere
   * @returns {Promise<string>} Contenuto del file
   * @private
   */
  _readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  /**
   * Converte i dati del grafico nel formato JSON richiesto
   * @param {GraphData} graphData - Dati del grafico
   * @returns {Object} Oggetto JSON nel formato richiesto
   * @private
   */
  _convertToJsonFormat(graphData) {
    // Crea l'oggetto JSON di base
    const jsonData = {
      nodes: [],
      edges: []
    };
    
    // Aggiungi i nodi al formato JSON richiesto
    for (const node of graphData.nodes) {
      const nodeData = {
        id: node.id,
        label: node.label
      };
      
      // Aggiungi coordinate 3D se presenti
      if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        nodeData.position = {
          x: node.x,
          y: node.y,
          z: node.z
        };
      }
      
      jsonData.nodes.push(nodeData);
    }
    
    // Aggiungi i collegamenti al formato JSON richiesto
    for (const edge of graphData.edges) {
      const edgeData = {
        from: edge.source,  // Rinomina 'source' in 'from'
        to: edge.target     // Rinomina 'target' in 'to'
      };
      
      // Aggiungi l'etichetta se presente
      if (edge.label) {
        edgeData.label = edge.label;
      }
      
      jsonData.edges.push(edgeData);
    }
    
    return jsonData;
  }
}

// Esporta la classe
export { JsonGenerator };
