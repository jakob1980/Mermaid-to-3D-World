// pathRenderer.js
// Gestisce la creazione delle rappresentazioni 3D dei collegamenti tra nodi

/**
 * Crea le mesh 3D per i collegamenti tra nodi
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {Array} edges Array di collegamenti dal JSON
 * @param {Object} nodeMeshes Mappa delle mesh dei nodi
 * @returns {Array} Array delle mesh dei collegamenti
 */
export function createPathMeshes(scene, edges, nodeMeshes) {
  const pathMeshes = [];
  
  // Crea materiali condivisi per i tipi di collegamenti
  const materials = createPathMaterials(scene);
  
  // Crea mesh per ogni collegamento
  edges.forEach((edge, index) => {
    const sourceNode = nodeMeshes[edge.from];
    const targetNode = nodeMeshes[edge.to];
    
    if (!sourceNode || !targetNode) {
      console.warn(`Nodo non trovato per il collegamento: ${edge.from} -> ${edge.to}`);
      return;
    }
    
    // Crea la mesh del collegamento
    const pathMesh = createPathMesh(scene, edge, sourceNode, targetNode, materials, index);
    
    // Aggiungi etichetta al collegamento se presente
    if (edge.label) {
      const labelMesh = createPathLabel(scene, edge, sourceNode, targetNode);
      pathMesh.edgeLabel = labelMesh;
    }
    
    // Aggiungi la mesh all'array
    pathMeshes.push(pathMesh);
  });
  
  return pathMeshes;
}

/**
 * Crea materiali per i diversi tipi di collegamenti
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @returns {Object} Mappa dei materiali per tipo di collegamento
 */
function createPathMaterials(scene) {
  const materials = {
    solid: new BABYLON.StandardMaterial("pathMaterial_solid", scene),
    dashed: new BABYLON.StandardMaterial("pathMaterial_dashed", scene),
    thick: new BABYLON.StandardMaterial("pathMaterial_thick", scene),
    inheritance: new BABYLON.StandardMaterial("pathMaterial_inheritance", scene),
    composition: new BABYLON.StandardMaterial("pathMaterial_composition", scene),
    aggregation: new BABYLON.StandardMaterial("pathMaterial_aggregation", scene),
    dependency: new BABYLON.StandardMaterial("pathMaterial_dependency", scene),
    async: new BABYLON.StandardMaterial("pathMaterial_async", scene),
    sync: new BABYLON.StandardMaterial("pathMaterial_sync", scene),
    lost: new BABYLON.StandardMaterial("pathMaterial_lost", scene)
  };
  
  // Configura materiale per collegamenti solidi (bianco)
  materials.solid.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  materials.solid.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  materials.solid.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  
  // Configura materiale per collegamenti tratteggiati (grigio chiaro)
  materials.dashed.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
  materials.dashed.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  materials.dashed.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  
  // Configura materiale per collegamenti spessi (blu)
  materials.thick.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.8);
  materials.thick.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.4);
  materials.thick.specularColor = new BABYLON.Color3(0.1, 0.1, 0.3);
  
  // Configura materiale per ereditarietà (verde)
  materials.inheritance.diffuseColor = new BABYLON.Color3(0.2, 0.7, 0.3);
  materials.inheritance.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.1);
  materials.inheritance.specularColor = new BABYLON.Color3(0.05, 0.1, 0.05);
  
  // Configura materiale per composizione (rosso)
  materials.composition.diffuseColor = new BABYLON.Color3(0.8, 0.3, 0.3);
  materials.composition.emissiveColor = new BABYLON.Color3(0.4, 0.1, 0.1);
  materials.composition.specularColor = new BABYLON.Color3(0.2, 0.1, 0.1);
  
  // Configura materiale per aggregazione (arancione)
  materials.aggregation.diffuseColor = new BABYLON.Color3(0.9, 0.6, 0.2);
  materials.aggregation.emissiveColor = new BABYLON.Color3(0.4, 0.3, 0.1);
  materials.aggregation.specularColor = new BABYLON.Color3(0.2, 0.15, 0.05);
  
  // Configura materiale per dipendenza (viola)
  materials.dependency.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.8);
  materials.dependency.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.4);
  materials.dependency.specularColor = new BABYLON.Color3(0.15, 0.05, 0.2);
  
  // Configura materiale per messaggi asincroni (cyan)
  materials.async.diffuseColor = new BABYLON.Color3(0.3, 0.8, 0.8);
  materials.async.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.4);
  materials.async.specularColor = new BABYLON.Color3(0.05, 0.2, 0.2);
  
  // Configura materiale per messaggi sincroni (azzurro)
  materials.sync.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.9);
  materials.sync.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
  materials.sync.specularColor = new BABYLON.Color3(0.05, 0.1, 0.2);
  
  // Configura materiale per messaggi persi (rosso scuro)
  materials.lost.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0.2);
  materials.lost.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.1);
  materials.lost.specularColor = new BABYLON.Color3(0.15, 0.05, 0.05);
  
  return materials;
}

/**
 * Crea una mesh 3D per un collegamento
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {Object} edge Dati del collegamento
 * @param {Object} sourceNode Nodo di origine
 * @param {Object} targetNode Nodo di destinazione
 * @param {Object} materials Materiali condivisi
 * @param {number} index Indice del collegamento
 * @returns {BABYLON.Mesh} La mesh creata
 */
function createPathMesh(scene, edge, sourceNode, targetNode, materials, index) {
  // Ottieni le posizioni dei nodi
  const sourcePos = sourceNode.position;
  const targetPos = targetNode.position;
  
  // Determina il tipo di collegamento
  const edgeType = edge.type || 'solid';
  
  // Crea una mesh appropriata in base al tipo
  let pathMesh;
  
  // Per collegamenti standard, crea una linea
  if (edgeType === 'solid' || edgeType === 'dashed' || edgeType === 'thick' || 
      edgeType === 'async' || edgeType === 'sync' || edgeType === 'dependency' ||
      !materials[edgeType]) {
    
    // Crea punti per la linea
    const pathPoints = [
      new BABYLON.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
      new BABYLON.Vector3(targetPos.x, targetPos.y, targetPos.z)
    ];
    
    // Crea la linea
    pathMesh = BABYLON.MeshBuilder.CreateLines(
      `path_${index}`,
      { points: pathPoints },
      scene
    );
    
    // Imposta il colore della linea
    pathMesh.color = materials[edgeType]?.diffuseColor || materials.solid.diffuseColor;
    
    // Se è un collegamento spesso, aumenta la larghezza
    if (edgeType === 'thick') {
      pathMesh.width = 3;
    }
    
  } 
  // Per collegamenti speciali (eredità, composizione, ecc.), crea un tubo
  else {
    // Direzione dal nodo sorgente al nodo target
    const direction = targetPos.subtract(sourcePos);
    const distance = direction.length();
    
    // Punto intermedio (leggermente rialzato per creare un arco)
    const midPoint = sourcePos.add(direction.scale(0.5)).add(new BABYLON.Vector3(0, distance * 0.2, 0));
    
    // Crea una curva di Bézier
    const bezierPoints = BABYLON.Curve3.CreateQuadraticBezier(
      new BABYLON.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
      midPoint,
      new BABYLON.Vector3(targetPos.x, targetPos.y, targetPos.z),
      20 // Numero di punti (maggiore = più liscia)
    ).getPoints();
    
    // Crea un tubo lungo la curva
    pathMesh = BABYLON.MeshBuilder.CreateTube(
      `path_${index}`,
      { 
        path: bezierPoints, 
        radius: 0.2,
        tessellation: 8,
        updatable: true
      },
      scene
    );
    
    // Assegna il materiale appropriato
    pathMesh.material = materials[edgeType] || materials.solid;
  }
  
  // Aggiungi una freccia alla fine del collegamento
  const arrowMesh = createArrow(scene, targetPos, sourcePos, edgeType, index);
  
  // Memorizza dati aggiuntivi per l'interazione
  pathMesh.metadata = {
    edgeData: edge,
    sourceNode: sourceNode,
    targetNode: targetNode,
    arrow: arrowMesh
  };
  
  return pathMesh;
}

/**
 * Crea una freccia alla fine di un collegamento
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {BABYLON.Vector3} targetPos Posizione del nodo target
 * @param {BABYLON.Vector3} sourcePos Posizione del nodo source
 * @param {string} edgeType Tipo di collegamento
 * @param {number} index Indice del collegamento
 * @returns {BABYLON.Mesh} La mesh della freccia
 */
function createArrow(scene, targetPos, sourcePos, edgeType, index) {
  // Calcola la direzione dal source al target
  const direction = targetPos.subtract(sourcePos).normalize();
  
  // Calcola la posizione della freccia (leggermente prima del nodo target)
  const arrowPos = targetPos.subtract(direction.scale(2));
  
  // Crea un cono per la testa della freccia
  const arrowMesh = BABYLON.MeshBuilder.CreateCylinder(
    `arrow_${index}`,
    {
      height: 1,
      diameterTop: 0,
      diameterBottom: 0.8,
      tessellation: 8
    },
    scene
  );
  
  // Posiziona la freccia
  arrowMesh.position = arrowPos;
  
  // Orienta la freccia nella direzione corretta
  // La freccia di default è orientata lungo l'asse Y, dobbiamo ruotarla
  // per puntare nella direzione corretta
  const upVector = new BABYLON.Vector3(0, 1, 0);
  
  // Calcoliamo l'asse di rotazione facendo il prodotto vettoriale
  const axis = BABYLON.Vector3.Cross(upVector, direction);
  
  // Calcoliamo l'angolo tra i vettori
  const angle = Math.acos(BABYLON.Vector3.Dot(upVector, direction));
  
  // Applichiamo la rotazione
  if (axis.length() > 0.001) { // Evita rotazioni problematiche con vettori quasi paralleli
    arrowMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, angle);
  }
  
  // Assegna il materiale appropriato in base al tipo di collegamento
  if (edgeType && scene.getMaterialByName(`pathMaterial_${edgeType}`)) {
    arrowMesh.material = scene.getMaterialByName(`pathMaterial_${edgeType}`);
  } else {
    arrowMesh.material = scene.getMaterialByName('pathMaterial_solid');
  }
  
  return arrowMesh;
}

/**
 * Crea un'etichetta per un collegamento
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {Object} edge Dati del collegamento
 * @param {Object} sourceNode Nodo di origine
 * @param {Object} targetNode Nodo di destinazione
 * @returns {BABYLON.Mesh} La mesh dell'etichetta
 */
function createPathLabel(scene, edge, sourceNode, targetNode) {
  // Ottieni le posizioni dei nodi
  const sourcePos = sourceNode.position;
  const targetPos = targetNode.position;
  
  // Calcola il punto medio tra i nodi
  const midPoint = sourcePos.add(targetPos).scale(0.5);
  
  // Aggiungi un piccolo offset verticale
  midPoint.y += 1;
  
  // Font per il testo
  const fontData = {
    font: "bold 24px Arial",
    resolution: 64,
    characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_'\"(){}[]*/+-=<>"
  };
  
  // Crea un materiale per il testo
  const textMaterial = new BABYLON.StandardMaterial(`edge_label_material_${edge.from}_${edge.to}`, scene);
  textMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
  textMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  textMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  textMaterial.backFaceCulling = false;
  
  // Crea un piano per l'etichetta
  const plane = BABYLON.MeshBuilder.CreatePlane(
    `edge_label_${edge.from}_${edge.to}`,
    { width: 6, height: 1.5 },
    scene
  );
  
  // Posiziona nel punto medio
  plane.position = midPoint;
  
  // Orienta l'etichetta verso la telecamera (billboard)
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  
  // Crea una texture dinamica per il testo
  const labelTexture = new BABYLON.DynamicTexture(`edge_label_texture_${edge.from}_${edge.to}`, 512, scene, true);
  textMaterial.diffuseTexture = labelTexture;
  plane.material = textMaterial;
  
  // Disegna il testo sulla texture
  labelTexture.drawText(
    edge.label,
    null, null, fontData.font,
    "white",
    "transparent",
    true
  );
  
  return plane;
}
