// nodeRenderer.js
// Gestisce la creazione delle rappresentazioni 3D dei nodi

/**
 * Crea le mesh 3D per i nodi del diagramma
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {Array} nodes Array di nodi dal JSON
 * @param {Object} nodePositions Mappa delle posizioni dei nodi
 * @returns {Object} Mappa delle mesh create per ogni nodo
 */
export function createNodeMeshes(scene, nodes, nodePositions) {
  const nodeMeshes = {};
  
  // Crea materiali condivisi per i tipi di nodi
  const materials = createNodeMaterials(scene);
  
  // Crea mesh per ogni nodo
  nodes.forEach(node => {
    const position = nodePositions[node.id];
    if (!position) {
      console.warn(`Posizione non trovata per il nodo ${node.id}`);
      return;
    }
    
    // Crea la mesh principale del nodo
    const nodeMesh = createNodeMesh(scene, node, position, materials);
    
    // Aggiungi etichetta al nodo
    const labelMesh = createNodeLabel(scene, node, position);
    
    // Memorizza la mesh creata e i dati associati
    nodeMeshes[node.id] = {
      mesh: nodeMesh,
      label: labelMesh,
      position: position,
      data: node
    };
  });
  
  return nodeMeshes;
}

/**
 * Crea materiali per i diversi tipi di nodi
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @returns {Object} Mappa dei materiali per tipo di nodo
 */
function createNodeMaterials(scene) {
  const materials = {
    default: new BABYLON.StandardMaterial("nodeMaterial_default", scene),
    implicit: new BABYLON.StandardMaterial("nodeMaterial_implicit", scene),
    actor: new BABYLON.StandardMaterial("nodeMaterial_actor", scene),
    participant: new BABYLON.StandardMaterial("nodeMaterial_participant", scene),
    class: new BABYLON.StandardMaterial("nodeMaterial_class", scene),
    note: new BABYLON.StandardMaterial("nodeMaterial_note", scene)
  };
  
  // Configura materiale predefinito (blu)
  materials.default.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.8);
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
  materials.class.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.8);
  materials.class.specularColor = new BABYLON.Color3(0.3, 0.1, 0.4);
  
  // Configura materiale per note (giallo)
  materials.note.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.3);
  materials.note.specularColor = new BABYLON.Color3(0.4, 0.3, 0.1);
  
  return materials;
}

/**
 * Crea una mesh 3D per un nodo
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {Object} node Dati del nodo
 * @param {Object} position Posizione del nodo
 * @param {Object} materials Materiali condivisi
 * @returns {BABYLON.Mesh} La mesh creata
 */
function createNodeMesh(scene, node, position, materials) {
  // Scegli la forma in base al tipo di nodo
  let nodeMesh;
  
  // Determina il tipo di nodo
  const nodeType = node.type || 'default';
  
  switch (nodeType) {
    case 'actor':
      // Crea una sfera per gli attori
      nodeMesh = BABYLON.MeshBuilder.CreateSphere(
        `node_${node.id}`,
        { diameter: 4, segments: 16 },
        scene
      );
      break;
      
    case 'note':
    case 'note_over':
    case 'note_between':
      // Crea un cilindro per le note
      nodeMesh = BABYLON.MeshBuilder.CreateCylinder(
        `node_${node.id}`,
        { height: 1, diameter: 5, tessellation: 8 },
        scene
      );
      // Ruota per avere il cilindro orizzontale
      nodeMesh.rotation.x = Math.PI / 2;
      break;
      
    case 'class':
      // Crea un cubo per le classi
      nodeMesh = BABYLON.MeshBuilder.CreateBox(
        `node_${node.id}`,
        { width: 5, height: 5, depth: 5 },
        scene
      );
      break;
      
    case 'implicit':
      // Crea un dodecaedro per i nodi impliciti
      nodeMesh = BABYLON.MeshBuilder.CreatePolyhedron(
        `node_${node.id}`,
        { type: 2, size: 2 },
        scene
      );
      break;
      
    default:
      // Per nodi standard, crea un cubo
      nodeMesh = BABYLON.MeshBuilder.CreateBox(
        `node_${node.id}`,
        { width: 4, height: 4, depth: 4 },
        scene
      );
  }
  
  // Posiziona il nodo
  nodeMesh.position = new BABYLON.Vector3(position.x, position.y, position.z);
  
  // Assegna il materiale appropriato
  nodeMesh.material = materials[nodeType] || materials.default;
  
  // Abilita le ombre
  nodeMesh.receiveShadows = true;
  
  // Memorizza dati aggiuntivi per l'interazione
  nodeMesh.metadata = {
    nodeData: node,
    nodeType: nodeType
  };
  
  return nodeMesh;
}

/**
 * Crea un'etichetta per un nodo
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {Object} node Dati del nodo
 * @param {Object} position Posizione del nodo
 * @returns {BABYLON.Mesh} La mesh dell'etichetta
 */
function createNodeLabel(scene, node, position) {
  // Font per il testo
  const fontData = {
    font: "bold 36px Arial",
    resolution: 64,
    characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_'\"(){}[]*/+-=<>"
  };
  
  // Crea un materiale per il testo
  const textMaterial = new BABYLON.StandardMaterial(`label_material_${node.id}`, scene);
  textMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  textMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  textMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
  textMaterial.alpha = 0.9;
  textMaterial.backFaceCulling = false;
  
  // Crea un piano per l'etichetta
  const plane = BABYLON.MeshBuilder.CreatePlane(
    `label_${node.id}`,
    { width: 8, height: 2 },
    scene
  );
  
  // Posiziona sopra al nodo
  plane.position = new BABYLON.Vector3(position.x, position.y + 3, position.z);
  
  // Orienta l'etichetta verso la telecamera (billboard)
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  
  // Crea una texture dinamica per il testo
  const labelTexture = new BABYLON.DynamicTexture(`label_texture_${node.id}`, 512, scene, true);
  textMaterial.diffuseTexture = labelTexture;
  plane.material = textMaterial;
  
  // Disegna il testo sulla texture
  labelTexture.drawText(
    node.label || node.id,
    null, null, fontData.font,
    "white",
    "transparent",
    true
  );
  
  return plane;
}
