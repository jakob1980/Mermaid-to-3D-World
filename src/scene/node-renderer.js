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

    // Crea etichetta del nodo
    const plane = BABYLON.MeshBuilder.CreatePlane(
      `label_${node.id}`,
      { width: 4, height: 1 },
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

    // Crea texture dinamica per il testo
    const texture = new BABYLON.DynamicTexture(
      `texture_${node.id}`,
      { width: 512, height: 128 },
      scene,
      true
    );
    const material = new BABYLON.StandardMaterial(`material_${node.id}`, scene);
    material.diffuseTexture = texture;
    material.specularColor = new BABYLON.Color3(0, 0, 0);
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.backFaceCulling = false;
    plane.material = material;

    // Disegna il testo
    texture.drawText(
      node.label,
      null,
      80,
      "bold 72px Arial",
      "white",
      "transparent",
      true
    );

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