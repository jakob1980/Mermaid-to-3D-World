// nodeRenderer.js
// Gestisce la creazione delle rappresentazioni 3D dei nodi

// BABYLON è già disponibile globalmente dal CDN

/**
 * Crea le mesh 3D per i nodi del diagramma
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {Array} nodes Array di nodi dal JSON
 * @param {Object} nodePositions Mappa delle posizioni dei nodi
 * @returns {Object} Mappa delle mesh create per ogni nodo
 */
export function createNodeMeshes(scene, nodes, nodePositions) {
  const nodeMeshes = {};
  const materials = createNodeMaterials(scene);

  nodes.forEach(node => {
    const position = nodePositions[node.id];
    if (!position) {
      console.warn(`Posizione non trovata per il nodo ${node.id}`);
      return;
    }

    // Crea cubo per il nodo
    const nodeMesh = BABYLON.MeshBuilder.CreateBox(
      `node_${node.id}`,
      { size: 2 },
      scene
    );
    nodeMesh.position = new BABYLON.Vector3(position.x, position.y, position.z);
    nodeMesh.material = materials[node.type] || materials.default;
    
    // Memorizza i dati del nodo come metadati per l'interazione
    nodeMesh.metadata = {
      id: node.id,
      label: node.label,
      nodeType: node.type,
      fullData: node
    };

    // Calcola dimensioni ottimali per l'etichetta
    const { textLines, maxLineWidth, labelWidth, labelHeight } = calculateLabelDimensions(node.label);

    // Crea etichetta del nodo con dimensioni appropriate
    const plane = BABYLON.MeshBuilder.CreatePlane(
      `label_${node.id}`,
      { width: labelWidth, height: labelHeight },
      scene
    );

    // Posiziona l'etichetta sopra il nodo
    plane.position = new BABYLON.Vector3(
      position.x,
      position.y + 1.5,
      position.z
    );

    // Orienta l'etichetta verso la telecamera
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    // Crea texture dinamica per il testo con dimensioni proporzionali
    const textureWidth = Math.max(512, maxLineWidth * 16);
    const textureHeight = Math.max(128, textLines.length * 40);
    
    const texture = new BABYLON.DynamicTexture(
      `texture_${node.id}`,
      { width: textureWidth, height: textureHeight },
      scene,
      true
    );
    
    const material = new BABYLON.StandardMaterial(`material_${node.id}`, scene);
    material.diffuseTexture = texture;
    material.specularColor = new BABYLON.Color3(0, 0, 0);
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.backFaceCulling = false;
    plane.material = material;

    // Disegna il testo multilinea
    drawMultilineText(texture, textLines);

    // Collegamento tra nodeMesh e etichetta
    nodeMesh.label = plane;
    plane.metadata = { parentNodeId: node.id };

    nodeMeshes[node.id] = {
      mesh: nodeMesh,
      label: plane,
      position: position,
      data: node
    };
  });

  return nodeMeshes;
}

/**
 * Calcola le dimensioni appropriate per un'etichetta in base al testo
 * @param {string} text Il testo dell'etichetta
 * @returns {Object} Dimensioni e layout del testo
 */
function calculateLabelDimensions(text) {
  // Dividi il testo in linee se è più lungo di 20 caratteri
  const maxCharsPerLine = 20;
  let textLines = [];
  
  if (text.length <= maxCharsPerLine) {
    textLines = [text];
  } else {
    // Dividi il testo in parole
    const words = text.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          textLines.push(currentLine);
        }
        // Se la parola è più lunga del massimo, spezzala
        if (word.length > maxCharsPerLine) {
          let remainingWord = word;
          while (remainingWord.length > 0) {
            const chunk = remainingWord.substring(0, maxCharsPerLine);
            textLines.push(chunk);
            remainingWord = remainingWord.substring(maxCharsPerLine);
          }
          currentLine = '';
        } else {
          currentLine = word;
        }
      }
    }
    
    if (currentLine) {
      textLines.push(currentLine);
    }
  }
  
  // Calcola la larghezza massima tra le linee
  const maxLineWidth = Math.max(...textLines.map(line => line.length));
  
  // Calcola le dimensioni del piano dell'etichetta in base al testo
  const labelWidth = Math.max(4, maxLineWidth * 0.25);
  const labelHeight = Math.max(1, textLines.length * 0.5);
  
  return { textLines, maxLineWidth, labelWidth, labelHeight };
}

/**
 * Disegna testo multilinea su una texture
 * @param {BABYLON.DynamicTexture} texture La texture su cui disegnare
 * @param {Array} textLines Array di linee di testo
 */
function drawMultilineText(texture, textLines) {
  const ctx = texture.getContext();
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  // Pulisci la texture
  ctx.clearRect(0, 0, width, height);
  
  // Disegna uno sfondo semi-trasparente
  ctx.fillStyle = "#ffffff99";
  ctx.fillRect(0, 0, width, height);
  
  // Configura lo stile del testo
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  
  // Calcola la dimensione del font in base al numero di linee e alla lunghezza
  const maxLineLength = Math.max(...textLines.map(line => line.length));
  const fontSize = Math.min(48, Math.max(24, 600 / maxLineLength, 600 / (textLines.length * 2)));
  ctx.font = `bold ${fontSize}px Arial`;
  
  // Disegna ciascuna linea di testo
  const lineHeight = fontSize * 1.2;
  const startY = (height - (textLines.length * lineHeight)) / 2 + fontSize / 2;
  
  textLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });
  
  // Aggiorna la texture
  texture.update();
}

/**
 * Crea materiali per i diversi tipi di nodi
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @returns {Object} Mappa dei materiali per tipo di nodo
 */
function createNodeMaterials(scene) {
  const materials = {
    default: new BABYLON.StandardMaterial("defaultMaterial", scene),
    implicit: new BABYLON.StandardMaterial("nodeMaterial_implicit", scene),
    actor: new BABYLON.StandardMaterial("nodeMaterial_actor", scene),
    participant: new BABYLON.StandardMaterial("nodeMaterial_participant", scene),
    class: new BABYLON.StandardMaterial("classMaterial", scene),
    note: new BABYLON.StandardMaterial("nodeMaterial_note", scene)
  };

  // Configura materiale predefinito (blu)
  materials.default.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.8);
  materials.default.specularColor = new BABYLON.Color3(0.2, 0.2, 0.6);
  materials.default.emissiveColor = new BABYLON.Color3(0, 0, 0.1);

  // Configura materiale per nodi impliciti (grigio)
  materials.implicit.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  materials.implicit.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

  // Configura materiale per attori (verde)
  materials.actor.diffuseColor = new BABYLON.Color3(0.3, 0.7, 0.4);
  materials.actor.specularColor = new BABYLON.Color3(0.1, 0.3, 0.1);

  // Configura materiale per partecipanti (azzurro)
  materials.participant.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.8);
  materials.participant.specularColor = new BABYLON.Color3(0.1, 0.2, 0.4);

  // Configura materiale per classi (viola)
  materials.class.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
  materials.class.specularColor = new BABYLON.Color3(0.3, 0.1, 0.4);

  // Configura materiale per note (giallo)
  materials.note.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.3);
  materials.note.specularColor = new BABYLON.Color3(0.4, 0.3, 0.1);

  return materials;
}