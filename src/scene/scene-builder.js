// sceneBuilder.js
// Costruisce e gestisce la scena 3D con Babylon.js

import { createNodeMeshes } from './node-renderer.js';
import { createPathMeshes } from './path-renderer.js';
import { setupCamera } from './camera-controller.js';

// Classe principale per la costruzione della scena
class SceneBuilder {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = null;
    this.scene = null;
    this.camera = null;
    this.ground = null;
    this.skybox = null;
    this.nodeMeshes = {};
    this.pathMeshes = [];
    this.highlightLayer = null;
    
    // Inizializza il motore Babylon.js
    this.engine = new BABYLON.Engine(canvas, true);
    
    // Gestisci il ridimensionamento della finestra
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  /**
   * Crea una nuova scena 3D
   * @returns {BABYLON.Scene} La scena creata
   */
  createScene() {
    // Crea una nuova scena
    this.scene = new BABYLON.Scene(this.engine);
    
    // Imposta un colore di sfondo chiaro
    this.scene.clearColor = new BABYLON.Color4(0.9, 0.9, 0.95, 1);
    
    // Abilita la fisica (opzionale)
    // this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
    
    // Crea layer per l'evidenziazione degli oggetti
    this.highlightLayer = new BABYLON.HighlightLayer("highlightLayer", this.scene);
    
    return this.scene;
  }

  /**
   * Crea la skybox
   * @returns {BABYLON.Mesh} La skybox creata
   */
  createSkybox() {
    // Crea una skybox utilizzando una scatola grande
    this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", this.scene);
    skyboxMaterial.backFaceCulling = false;
    
    // Usa un colore gradiente per il cielo
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1.0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    
    // Opzionale: utilizzare cubemap per un cielo realistico
    /*
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    */
    
    this.skybox.material = skyboxMaterial;
    
    return this.skybox;
  }

  /**
   * Configura le luci nella scena
   */
  setupLights() {
    // Luce ambientale
    const hemisphericLight = new BABYLON.HemisphericLight(
      "hemisphericLight", 
      new BABYLON.Vector3(0, 1, 0), 
      this.scene
    );
    hemisphericLight.intensity = 0.7;
    hemisphericLight.diffuse = new BABYLON.Color3(1, 1, 1);
    hemisphericLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
    hemisphericLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    
    // Luce direzionale (simula il sole)
    const directionalLight = new BABYLON.DirectionalLight(
      "directionalLight",
      new BABYLON.Vector3(-1, -2, -1),
      this.scene
    );
    directionalLight.intensity = 0.5;
    directionalLight.diffuse = new BABYLON.Color3(1, 1, 0.9);
    
    // Abilita le ombre (opzionale per prestazioni migliori)
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    
    return { hemisphericLight, directionalLight, shadowGenerator };
  }

  /**
   * Crea il terreno base
   * @returns {BABYLON.Mesh} Il terreno creato
   */
  createGround() {
    // Crea un piano grande per il terreno
    this.ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 200, height: 200, subdivisions: 2 },
      this.scene
    );
    
    // Crea un materiale per il terreno
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    
    // Opzionale: aggiungere texture
    /*
    groundMaterial.diffuseTexture = new BABYLON.Texture("textures/grass.jpg", this.scene);
    groundMaterial.diffuseTexture.uScale = 20;
    groundMaterial.diffuseTexture.vScale = 20;
    */
    
    this.ground.material = groundMaterial;
    this.ground.receiveShadows = true;
    
    return this.ground;
  }

  /**
   * Calcola la disposizione dei nodi nello spazio 3D
   * @param {Array} nodes Array di nodi
   * @returns {Object} Mappa delle posizioni dei nodi
   */
  layoutNodes(nodes) {
    const nodePositions = {};
    const nodeCount = nodes.length;
    
    // Algoritmo di layout: diverse opzioni possibili
    
    // Opzione 1: Layout a cerchio semplice
    if (nodeCount <= 10) {
      const radius = Math.max(nodeCount * 5, 20);
      
      nodes.forEach((node, index) => {
        const angle = (index / nodeCount) * Math.PI * 2;
        nodePositions[node.id] = {
          x: Math.sin(angle) * radius,
          y: 2, // Altezza dal terreno
          z: Math.cos(angle) * radius
        };
      });
    } 
    // Opzione 2: Layout a griglia per molti nodi
    else if (nodeCount > 10) {
      const gridSize = Math.ceil(Math.sqrt(nodeCount));
      const spacing = 10; // Spazio tra i nodi
      
      nodes.forEach((node, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        
        nodePositions[node.id] = {
          x: (col - gridSize / 2) * spacing,
          y: 2, // Altezza dal terreno
          z: (row - gridSize / 2) * spacing
        };
      });
    }
    
    // Opzione 3: Layout gerarchico per grafi con struttura ad albero
    // Implementazione più complessa, non inclusa in questa versione base
    
    return nodePositions;
  }

  /**
   * Costruisce la scena 3D dai dati JSON
   * @param {Object} jsonData Dati JSON con nodi e collegamenti
   * @returns {Promise<boolean>} Promise che si risolve quando la scena è pronta
   */
  async buildFromJSON(jsonData) {
    // Crea una nuova scena pulita
    this.resetScene();
    this.createScene();
    
    // Crea elementi base della scena
    this.createSkybox();
    this.setupLights();
    this.createGround();
    
    // Configura la telecamera utilizzando il modulo cameraController
    this.camera = setupCamera(this.scene, this.canvas);
    
    // Calcola le posizioni dei nodi
    const nodePositions = this.layoutNodes(jsonData.nodes);
    
    // Crea le mesh per i nodi utilizzando il modulo nodeRenderer
    this.nodeMeshes = createNodeMeshes(this.scene, jsonData.nodes, nodePositions);
    
    // Crea le mesh per i sentieri utilizzando il modulo pathRenderer
    this.pathMeshes = createPathMeshes(this.scene, jsonData.edges, this.nodeMeshes);
    
    // Aggiungi le ombre ai nodi
    // Per ogni nodo, aggiungi la sua mesh al generatore di ombre
    const shadowGenerator = this.scene.getLightByName("directionalLight")?.getShadowGenerator();
    if (shadowGenerator) {
      Object.values(this.nodeMeshes).forEach(nodeMesh => {
        if (nodeMesh.mesh) {
          shadowGenerator.addShadowCaster(nodeMesh.mesh);
        }
      });
    }
    
    // Configura l'interazione con la scena
    this.setupInteraction();
    
    // Avvia il loop di rendering
    this.startRenderLoop();
    
    return true;
  }

  /**
   * Resetta la scena, rimuovendo tutti gli elementi esistenti
   */
  resetScene() {
    if (this.scene) {
      this.scene.dispose();
    }
    
    this.nodeMeshes = {};
    this.pathMeshes = [];
    this.highlightLayer = null;
  }

  /**
   * Configura l'interazione utente nella scena
   */
  setupInteraction() {
    // Verifica che la scena esista
    if (!this.scene) return;
    
    // Aggiungi eventi di click e hover per i nodi e i sentieri
    this.scene.onPointerObservable.add((pointerInfo) => {
      // Gestione click sui mesh
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
        const pickedMesh = pointerInfo.pickInfo.pickedMesh;
        
        // Verifica se è stato cliccato un sentiero
        if (pickedMesh && pickedMesh.name.startsWith('path_')) {
          const metadata = pickedMesh.metadata;
          if (metadata) {
            // Sposta la telecamera verso il nodo target
            this.moveToNode(metadata.targetNode);
          }
        }
        
        // Verifica se è stato cliccato un nodo
        if (pickedMesh && pickedMesh.name.startsWith('node_')) {
          // Seleziona il nodo (puoi aggiungere funzionalità aggiuntive qui)
          const nodeId = pickedMesh.name.replace('node_', '');
          console.log(`Node clicked: ${nodeId}`);
          
          // Esempio: Fai "pulsare" il nodo quando viene cliccato
          this.pulseNode(pickedMesh);
        }
      }
      
      // Gestione hover sui mesh (evidenziazione)
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
        const pickedMesh = this.scene.pick(this.scene.pointerX, this.scene.pointerY).pickedMesh;
        
        // Rimuovi tutte le evidenziazioni
        this.highlightLayer?.removeAllMeshes();
        
        // Evidenzia la mesh sotto il cursore
        if (pickedMesh && (pickedMesh.name.startsWith('node_') || pickedMesh.name.startsWith('path_'))) {
          this.highlightLayer?.addMesh(pickedMesh, new BABYLON.Color3(1, 1, 0));
          
          // Cambia il cursore per indicare che l'elemento è cliccabile
          this.canvas.style.cursor = 'pointer';
        } else {
          // Ripristina il cursore predefinito
          this.canvas.style.cursor = 'default';
        }
      }
    });
  }

  /**
   * Sposta la telecamera verso un nodo specifico
   * @param {Object} targetNode Il nodo di destinazione
   */
  moveToNode(targetNode) {
    if (!this.camera || !targetNode) return;
    
    // Ottieni la posizione del nodo
    const targetPosition = targetNode.position;
    
    // Crea un'animazione per spostare la telecamera
    const animationDuration = 1000; // millisecondi
    
    // Anima il target della telecamera
    BABYLON.Animation.CreateAndStartAnimation(
      "cameraAnimation",
      this.camera,
      "target",
      30, // frame rate
      animationDuration / (1000 / 30), // numero di frame
      this.camera.target,
      new BABYLON.Vector3(targetPosition.x, targetPosition.y, targetPosition.z),
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
  }

  /**
   * Crea un'animazione di pulsazione per un nodo
   * @param {BABYLON.Mesh} nodeMesh La mesh del nodo
   */
  pulseNode(nodeMesh) {
    // Salva la scala originale
    const originalScale = nodeMesh.scaling.clone();
    
    // Crea l'animazione di scala
    const scaleAnimation = new BABYLON.Animation(
      "pulseAnimation",
      "scaling",
      30, // frame rate
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
    );
    
    // Keyframes per la pulsazione
    const keyFrames = [
      { frame: 0, value: originalScale },
      { frame: 15, value: originalScale.scale(1.2) }, // Espandi
      { frame: 30, value: originalScale } // Torna alla dimensione originale
    ];
    
    scaleAnimation.setKeys(keyFrames);
    
    // Rimuovi animazioni esistenti e aggiungi quella nuova
    nodeMesh.animations = [];
    nodeMesh.animations.push(scaleAnimation);
    
    // Avvia l'animazione
    this.scene.beginAnimation(nodeMesh, 0, 30, false, 1.0);
  }

  /**
   * Avvia il loop di rendering
   */
  startRenderLoop() {
    // Verifica che l'engine e la scena esistano
    if (!this.engine || !this.scene) return;
    
    // Avvia il loop di rendering
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  /**
   * Ferma il loop di rendering
   */
  stopRenderLoop() {
    if (this.engine) {
      this.engine.stopRenderLoop();
    }
  }

  /**
   * Pulisce le risorse e libera la memoria
   */
  dispose() {
    this.stopRenderLoop();
    
    if (this.scene) {
      this.scene.dispose();
    }
    
    if (this.engine) {
      this.engine.dispose();
    }
  }
}

/**
 * Inizializza e restituisce un'istanza del builder della scena
 * @param {HTMLCanvasElement} canvas Canvas HTML su cui renderizzare
 * @returns {SceneBuilder} Istanza del builder
 */
function initSceneBuilder(canvas) {
  return new SceneBuilder(canvas);
}

// Esporta funzioni e classi
export { initSceneBuilder, SceneBuilder };
