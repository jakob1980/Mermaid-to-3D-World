// mermaidParser.js
// Parser per diagrammi Mermaid

/**
 * Classe Node rappresenta un nodo nel diagramma
 */
class Node {
  /**
   * @param {string} id - Identificatore univoco del nodo
   * @param {string} label - Etichetta del nodo
   * @param {number} x - Coordinata X (opzionale)
   * @param {number} y - Coordinata Y (opzionale)
   * @param {number} z - Coordinata Z (opzionale)
   */
  constructor(id, label, x = 0, y = 0, z = 0) {
    this.id = id;
    this.label = label;
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

/**
 * Classe Edge rappresenta un collegamento tra nodi
 */
class Edge {
  /**
   * @param {string} source - ID del nodo di origine
   * @param {string} target - ID del nodo di destinazione
   * @param {string|null} label - Etichetta del collegamento (opzionale)
   */
  constructor(source, target, label = null) {
    this.source = source;
    this.target = target;
    this.label = label;
  }
}

/**
 * Classe GraphData rappresenta i dati del grafico estratti
 */
class GraphData {
  /**
   * @param {Array<Node>} nodes - Array di nodi
   * @param {Array<Edge>} edges - Array di collegamenti
   */
  constructor(nodes = [], edges = []) {
    this.nodes = nodes;
    this.edges = edges;
  }
}

/**
 * Classe MermaidParser per analizzare diagrammi Mermaid
 */
class MermaidParser {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.supportedTypes = ["flowchart", "sequenceDiagram", "classDiagram"];
    this.diagramType = null;
    this.rawContent = "";
    this.parsed = false;
  }

  /**
   * Resetta lo stato del parser
   */
  reset() {
    this.diagramType = null;
    this.nodes = [];
    this.edges = [];
    this.rawContent = "";
    this.parsed = false;
  }

  /**
   * Analizza un file Mermaid e restituisce una struttura di grafico
   * @param {File} file - File Mermaid da analizzare
   * @returns {Promise<Object>} Struttura del grafico
   */
  async parseFile(file) {
    try {
      // Leggi il contenuto del file
      const content = await this._readFileContent(file);
      
      // Analizza il contenuto
      const success = this.parseString(content);
      if (!success) {
        console.warn("Parsing del file non riuscito");
        return { nodes: {}, edges: [] };
      }
      
      // Converti il formato interno nel formato atteso
      const result = {
        nodes: {},
        edges: []
      };
      
      // Converti l'array di nodi in un dizionario con ID come chiavi
      for (const node of this.nodes) {
        const nodeId = node.id;
        result.nodes[nodeId] = node;
      }
      
      // Aggiungi i collegamenti così come sono
      result.edges = this.edges;
      
      return result;
      
    } catch (error) {
      console.error(`Errore durante il parsing del file: ${error}`);
      return { nodes: {}, edges: [] };
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
   * Analizza una stringa contenente un diagramma Mermaid
   * @param {string} content - Contenuto del diagramma Mermaid
   * @returns {boolean} True se il parsing è avvenuto con successo
   */
  parseString(content) {
    console.log("MermaidParser: parseString (wrapper) chiamato");
    const result = this.parse(content);
    return result && result.nodes && result.nodes.length > 0;
  }

  /**
   * Analizza una stringa contenente un diagramma Mermaid
   * @param {string} content - Contenuto del diagramma Mermaid
   * @returns {GraphData} Struttura dati del grafico
   */
  parse(content) {
    console.log("MermaidParser: Inizio parsing");
    
    try {
      this.reset();
      this.rawContent = content;
      
      // Determina il tipo di diagramma
      console.log("MermaidParser: determinazione tipo diagramma");
      for (const diagramType of this.supportedTypes) {
        if (content.includes(diagramType)) {
          this.diagramType = diagramType;
          console.log(`MermaidParser: tipo diagramma rilevato: ${diagramType}`);
          break;
        }
      }
      
      if (!this.diagramType) {
        console.error("MermaidParser: Tipo di diagramma non supportato o non riconosciuto");
        return new GraphData();
      }
      
      // Esegui il parsing specifico per il tipo di diagramma
      console.log(`MermaidParser: avvio parsing per tipo ${this.diagramType}`);
      let success = false;
      if (this.diagramType === "flowchart") {
        success = this._parseFlowchart();
      } else if (this.diagramType === "sequenceDiagram") {
        success = this._parseSequence();
      } else if (this.diagramType === "classDiagram") {
        success = this._parseClass();
      }
      
      this.parsed = success;
      
      if (success) {
        console.log(`MermaidParser: parsing completato con successo, ${this.nodes.length} nodi e ${this.edges.length} collegamenti`);
        return new GraphData([...this.nodes], [...this.edges]);
      } else {
        console.error("MermaidParser: parsing fallito");
        return new GraphData();
      }
    } catch (error) {
      console.error(`MermaidParser: errore durante il parsing: ${error.message}`);
      console.error('Stack trace:', error.stack);
      return new GraphData();
    }
  }

  /**
   * Parser per diagrammi di flusso
   * @returns {boolean} True se il parsing è avvenuto con successo
   * @private
   */
  _parseFlowchart() {
    console.debug("Parsing di un diagramma di flusso");
    
    const content = this.rawContent;
    
    // Estrazione nodi - pattern migliorato per supportare ID più complessi
    // Supporta id[label], id(label), id{label}, id>label<, etc.
    const nodePattern = /(["\']?[\w\-\s]+["\']?|\w+)[\[\(\{\<](.*?)[\]\)\}\>]/g;
    let match;
    
    while ((match = nodePattern.exec(content)) !== null) {
      const nodeId = match[1].replace(/^["']|["']$/g, '');  // Rimuovi virgolette se presenti
      const label = match[2];
      
      this.nodes.push({
        id: nodeId,
        label: label,
        type: 'node'
      });
    }
    
    // Estrazione collegamenti con supporto per più sintassi
    // Pattern per collegamenti: A-->B, A--text-->B, A ==> B, A -. B, etc.
    const edgePattern = /(["\']?[\w\-\s]+["\']?|\w+)\s*(-[-.]+>|=+>|--[|ox]|-.+|==+|--+)\s*(["\']?[\w\-\s]+["\']?|\w+)/g;
    
    while ((match = edgePattern.exec(content)) !== null) {
      const source = match[1].replace(/^["']|["']$/g, '');
      const edgeType = match[2];
      const target = match[3].replace(/^["']|["']$/g, '');
      
      // Determina il tipo di connessione
      let edgeStyle = 'solid';
      if (edgeType.includes('-.->' ) || edgeType.includes('-.')) {
        edgeStyle = 'dashed';
      } else if (edgeType.includes('==>') || edgeType.includes('==')) {
        edgeStyle = 'thick';
      }
      
      this.edges.push({
        source: source,
        target: target,
        type: edgeStyle
      });
    }
    
    // Estrazione testo sui collegamenti
    const labelEdgePattern = /(["\']?[\w\-\s]+["\']?|\w+)\s*--\s*(.*?)\s*-->\s*(["\']?[\w\-\s]+["\']?|\w+)/g;
    
    while ((match = labelEdgePattern.exec(content)) !== null) {
      const source = match[1].replace(/^["']|["']$/g, '');
      const label = match[2];
      const target = match[3].replace(/^["']|["']$/g, '');
      
      // Verifica se esiste già un collegamento
      let edgeExists = false;
      for (const edge of this.edges) {
        if (edge.source === source && edge.target === target) {
          edge.label = label;
          edgeExists = true;
          break;
        }
      }
      
      if (!edgeExists) {
        this.edges.push({
          source: source,
          target: target,
          label: label,
          type: 'solid'
        });
      }
    }
    
    // Aggiungi nodi impliciti (menzionati solo nei collegamenti)
    const allNodeIds = new Set(this.nodes.map(node => node.id));
    const implicitNodes = new Set();
    
    for (const edge of this.edges) {
      if (!allNodeIds.has(edge.source) && !implicitNodes.has(edge.source)) {
        implicitNodes.add(edge.source);
        this.nodes.push({
          id: edge.source,
          label: edge.source,
          type: 'implicit'
        });
      }
      
      if (!allNodeIds.has(edge.target) && !implicitNodes.has(edge.target)) {
        implicitNodes.add(edge.target);
        this.nodes.push({
          id: edge.target,
          label: edge.target,
          type: 'implicit'
        });
      }
    }
    
    // Considerato riuscito se almeno un'entità è stata trovata
    return this.nodes.length > 0 || this.edges.length > 0;
  }

  /**
   * Parser per diagrammi di sequenza
   * @returns {boolean} True se il parsing è avvenuto con successo
   * @private
   */
  _parseSequence() {
    console.debug("Parsing di un diagramma di sequenza");
    
    const content = this.rawContent;
    
    // Estrazione partecipanti con supporto per ID più flessibili e alias
    const participantPattern = /participant\s+(["\']?[\w\-\s]+["\']?|\w+)(?:\s+as\s+(["\']?[\w\-\s]+["\']?|\w+))?/g;
    const actorPattern = /actor\s+(["\']?[\w\-\s]+["\']?|\w+)(?:\s+as\s+(["\']?[\w\-\s]+["\']?|\w+))?/g;
    
    // Trova tutti i partecipanti dichiarati esplicitamente
    const declaredParticipants = new Set();
    let match;
    
    // Processa i partecipanti
    while ((match = participantPattern.exec(content)) !== null) {
      const nodeId = match[1].replace(/^["']|["']$/g, '');
      let label = nodeId;
      
      if (match[2]) {
        const alias = match[2].replace(/^["']|["']$/g, '');
        label = alias;
      }
      
      declaredParticipants.add(nodeId);
      this.nodes.push({
        id: nodeId,
        label: label,
        type: 'participant'
      });
    }
    
    // Processa gli attori
    while ((match = actorPattern.exec(content)) !== null) {
      const nodeId = match[1].replace(/^["']|["']$/g, '');
      let label = nodeId;
      
      if (match[2]) {
        const alias = match[2].replace(/^["']|["']$/g, '');
        label = alias;
      }
      
      declaredParticipants.add(nodeId);
      this.nodes.push({
        id: nodeId,
        label: label,
        type: 'actor'
      });
    }
    
    // Estrazione messaggi tra partecipanti con supporto per più formati di frecce
    // Supporta pattern come A->B: Message, A->>B: Message, A-->>B: Message, etc.
    const messagePattern = /(["\']?[\w\-\s]+["\']?|\w+)\s*(->>|->|-->>|-->|==>>|==>|--x|--X|x-x|<-|<<-)\s*(["\']?[\w\-\s]+["\']?|\w+)(?::\s*(.*?))?(?:\n|$)/g;
    
    while ((match = messagePattern.exec(content)) !== null) {
      let source = match[1].replace(/^["']|["']$/g, '');
      const arrowType = match[2];
      let target = match[3].replace(/^["']|["']$/g, '');
      const message = match[4] || '';
      
      // Aggiungi partecipanti impliciti (non dichiarati esplicitamente)
      for (const participant of [source, target]) {
        if (!declaredParticipants.has(participant)) {
          this.nodes.push({
            id: participant,
            label: participant,
            type: 'implicit_participant'
          });
          declaredParticipants.add(participant);
        }
      }
      
      // Determina tipo di messaggio
      let messageType = 'async';
      if (!arrowType.includes('>>')) {
        messageType = 'sync';
      }
      
      if (arrowType.toLowerCase().includes('x')) {
        messageType = 'lost';
      }
      
      if (arrowType.includes('<-')) {
        // Inverti source e target per le frecce di ritorno
        [source, target] = [target, source];
      }
      
      this.edges.push({
        source: source,
        target: target,
        label: message,
        type: messageType
      });
    }
    
    // Estrai le note
    const notePattern = /[Nn]ote (?:over|left of|right of)\s+(["\']?[\w\-\s]+["\']?|\w+)(?:,\s*(["\']?[\w\-\s]+["\']?|\w+))?:\s*(.*?)(?:\n|end [Nn]ote|$)/g;
    
    while ((match = notePattern.exec(content)) !== null) {
      const participant1 = match[1].replace(/^["']|["']$/g, '');
      const participant2 = match[2] ? match[2].replace(/^["']|["']$/g, '') : null;
      const noteText = match[3];
      
      const noteId = `note_${this.nodes.length}`;
      const noteType = participant2 ? "note_between" : "note_over";
      
      this.nodes.push({
        id: noteId,
        label: noteText.trim(),
        type: noteType,
        participants: participant2 ? [participant1, participant2] : [participant1]
      });
    }
    
    return this.nodes.length > 0;
  }

  /**
   * Parser per diagrammi di classe
   * @returns {boolean} True se il parsing è avvenuto con successo
   * @private
   */
  _parseClass() {
    console.debug("Parsing di un diagramma di classe");
    
    const content = this.rawContent;
    
    // Estrazione definizioni di classe con supporto per ID più flessibili
    const classPattern = /class\s+(["\']?[\w\-\s]+["\']?|\w+)(?:\s+\{([\s\S]*?)\})?/g;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      const className = match[1].replace(/^["']|["']$/g, '');
      const classContent = match[2];
      
      const attributes = [];
      const methods = [];
      
      // Se c'è contenuto nella classe, estrai attributi e metodi
      if (classContent) {
        const lines = classContent.split('\n');
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          // Estrai visibilità (+, -, #, ~)
          let visibility = 'public';  // default
          let processedLine = trimmedLine;
          
          if (trimmedLine.startsWith('+')) {
            visibility = 'public';
            processedLine = trimmedLine.substring(1).trim();
          } else if (trimmedLine.startsWith('-')) {
            visibility = 'private';
            processedLine = trimmedLine.substring(1).trim();
          } else if (trimmedLine.startsWith('#')) {
            visibility = 'protected';
            processedLine = trimmedLine.substring(1).trim();
          } else if (trimmedLine.startsWith('~')) {
            visibility = 'package';
            processedLine = trimmedLine.substring(1).trim();
          }
          
          // Rileva metodi (contengono parentesi)
          if (processedLine.includes('(')) {
            methods.push({
              name: processedLine,
              visibility: visibility
            });
          } else {  // È un attributo
            attributes.push({
              name: processedLine,
              visibility: visibility
            });
          }
        }
      }
      
      this.nodes.push({
        id: className,
        label: className,
        type: 'class',
        attributes: attributes,
        methods: methods
      });
    }
    
    // Estrazione relazioni tra classi con supporto per più formati
    const relationPattern = /(["\']?[\w\-\s]+["\']?|\w+)\s*(--|>|<\|--|\*--|o--|<--|\.\.|<\.\.|\.\.|--|\.\|--|o\.\.|<\.\.|--\*|--o)\s*(["\']?[\w\-\s]+["\']?|\w+)(?:\s*:\s*(.*?))?(?:\n|$)/g;
    
    const relationTypes = {
      '--|>': 'inheritance',
      '<|--': 'inheritance_reverse',
      '--*': 'composition',
      '*--': 'composition_reverse',
      '--o': 'aggregation',
      'o--': 'aggregation_reverse',
      '<--': 'dependency',
      '..': 'dotted',
      '<..': 'dotted_dependency',
      '--': 'association',
      '.|--': 'realization',
      '<..|': 'dotted_dependency_reverse',
      'o..': 'dotted_aggregation',
      '--*': 'composition',
      '--o': 'aggregation'
    };
    
    while ((match = relationPattern.exec(content)) !== null) {
      let source = match[1].replace(/^["']|["']$/g, '');
      const relation = match[2];
      let target = match[3].replace(/^["']|["']$/g, '');
      const label = match[4];
      
      let relationType = relationTypes[relation] || 'association';
      
      // Gestisci le relazioni con direzione invertita
      if (relationType.includes('_reverse')) {
        [source, target] = [target, source];
        relationType = relationType.replace('_reverse', '');
      }
      
      const edgeData = {
        source: source,
        target: target,
        type: relationType
      };
      
      if (label) {
        edgeData.label = label.trim();
      }
      
      this.edges.push(edgeData);
    }
    
    // Estrazione stereotipi (<<interface>>, <<abstract>>, etc.)
    const stereotypePattern = /class\s+(["\']?[\w\-\s]+["\']?|\w+)\s+<<(.*?)>>/g;
    
    while ((match = stereotypePattern.exec(content)) !== null) {
      const className = match[1].replace(/^["']|["']$/g, '');
      const stereotype = match[2];
      
      // Cerca il nodo classe esistente
      for (const node of this.nodes) {
        if (node.id === className && node.type === 'class') {
          node.stereotype = stereotype.trim();
          break;
        }
      }
    }
    
    return this.nodes.length > 0;
  }

  /**
   * Restituisce i nodi e gli archi estratti dal diagramma
   * @returns {Array} Array contenente [nodes, edges]
   */
  getGraphData() {
    if (!this.parsed) {
      console.warn("Tentativo di accesso ai dati prima del parsing");
      return [[], []];
    }
    
    return [this.nodes, this.edges];
  }

  /**
   * Estrae l'etichetta di un nodo da una linea
   * @param {string} line - Linea di testo
   * @param {string} nodeId - ID del nodo
   * @returns {string|null} Etichetta estratta o null
   * @private
   */
  _extractLabel(line, nodeId) {
    // Gestisci vari formati di nodi
    const formats = [
      new RegExp(`${nodeId}\\s*\\[(.*?)\\]`),  // A[Testo]
      new RegExp(`${nodeId}\\s*\\((.*?)\\)`),  // A(Testo)
      new RegExp(`${nodeId}\\s*\\{(.*?)\\}`),  // A{Testo}
      new RegExp(`${nodeId}\\s*<(.*?)>`),      // A<Testo>
      new RegExp(`${nodeId}\\s*\\[\\[(.*?)\\]\\]`),  // A[[Testo]]
      new RegExp(`${nodeId}\\s*\\(\\((.*?)\\)\\)`)   // A((Testo))
    ];
    
    for (const pattern of formats) {
      const match = line.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Estrae l'etichetta di un arco da una linea
   * @param {string} line - Linea di testo
   * @returns {string|null} Etichetta estratta o null
   * @private
   */
  _extractEdgeLabel(line) {
    // Cerca formati come --> |label|
    const pattern = /-+>\s*\|(.*?)\|/;
    const match = line.match(pattern);
    if (match) {
      return match[1].trim();
    }
    return null;
  }
}

// Funzione wrapper per verificare se un diagramma Mermaid è valido
function parserAccept(content) {
  const parser = new MermaidParser();
  return parser.parseString(content);
}

// Esporta le classi e le funzioni
export { MermaidParser, Node, Edge, GraphData, parserAccept };
