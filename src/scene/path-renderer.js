// pathRenderer.js
// Gestisce la creazione delle rappresentazioni 3D dei collegamenti tra nodi

// BABYLON è già disponibile globalmente dal CDN

export function createPathMeshes(scene, edges, nodeMeshes) {
  const pathMeshes = [];
  const materials = createPathMaterials(scene);

  edges.forEach((edge, index) => {
    const sourceNode = nodeMeshes[edge.from];
    const targetNode = nodeMeshes[edge.to];

    if (!sourceNode || !targetNode) {
      console.warn(`Nodo non trovato per il collegamento: ${edge.from} -> ${edge.to}`);
      return;
    }

    const sourcePos = sourceNode.mesh.position;
    const targetPos = targetNode.mesh.position;

    // Crea punti per la linea
    const points = [
      sourcePos,
      targetPos
    ];

    // Crea la linea
    const line = BABYLON.MeshBuilder.CreateLines(
      `path_${index}`,
      { points: points },
      scene
    );
    line.color = new BABYLON.Color3(1, 1, 1);

    // Se c'è un'etichetta, creala
    if (edge.label) {
      const midPoint = BABYLON.Vector3.Center(sourcePos, targetPos);
      midPoint.y += 0.5;

      const plane = BABYLON.MeshBuilder.CreatePlane(
        `edge_label_${index}`,
        { width: 3, height: 0.8 },
        scene
      );
      plane.position = midPoint;
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

      const texture = new BABYLON.DynamicTexture(
        `edge_texture_${index}`,
        { width: 512, height: 128 },
        scene,
        true
      );
      const material = new BABYLON.StandardMaterial(`edge_material_${index}`, scene);
      material.diffuseTexture = texture;
      material.specularColor = new BABYLON.Color3(0, 0, 0);
      material.emissiveColor = new BABYLON.Color3(1, 1, 1);
      material.backFaceCulling = false;
      plane.material = material;

      texture.drawText(
        edge.label,
        null,
        80,
        "bold 72px Arial",
        "white",
        "transparent",
        true
      );
    }

    pathMeshes.push(line);
  });

  return pathMeshes;
}

function createPathMaterials(scene) {
  const materials = {
    default: new BABYLON.StandardMaterial("defaultPathMaterial", scene)
  };

  materials.default.diffuseColor = new BABYLON.Color3(1, 1, 1);
  materials.default.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);

  return materials;
}