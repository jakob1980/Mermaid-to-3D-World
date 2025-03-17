// cameraController.js
// Gestisce la telecamera e i controlli di navigazione nella scena 3D

/**
 * Configura la telecamera principale nella scena
 * @param {BABYLON.Scene} scene La scena Babylon.js
 * @param {HTMLCanvasElement} canvas L'elemento canvas
 * @returns {BABYLON.Camera} La telecamera configurata
 */
export function setupCamera(scene, canvas) {
  // Crea una telecamera ArcRotate che ruota attorno a un punto centrale
  // Parametri: nome, alpha (rotazione orizzontale), beta (rotazione verticale), 
  // raggio, punto di target, scena
  const camera = new BABYLON.ArcRotateCamera(
    "mainCamera",
    -Math.PI / 2,  // alpha (posizione orizzontale iniziale)
    Math.PI / 3,   // beta (altezza iniziale, 0 è dall'alto, PI/2 è di fronte)
    50,            // raggio (distanza dalla scena)
    new BABYLON.Vector3(0, 0, 0),  // punto di target
    scene
  );

  // Collega i controlli della telecamera al canvas
  camera.attachControl(canvas, true);

  // Configura i limiti della telecamera
  configureCameraLimits(camera);

  // Configura i controlli della telecamera
  configureCameraControls(camera);

  // Configura gli eventi per la navigazione
  setupCameraNavigation(camera, scene, canvas);

  return camera;
}

/**
 * Configura i limiti della telecamera
 * @param {BABYLON.ArcRotateCamera} camera La telecamera
 */
function configureCameraLimits(camera) {
  // Limita la distanza minima e massima dalla scena
  camera.lowerRadiusLimit = 10;  // Non troppo vicino
  camera.upperRadiusLimit = 100; // Non troppo lontano

  // Limita l'angolo verticale (beta)
  camera.lowerBetaLimit = 0.1;   // Non completamente dall'alto
  camera.upperBetaLimit = Math.PI / 2; // Non sotto la scena

  // Velocità dello zoom con la rotella del mouse
  camera.wheelDeltaPercentage = 0.01;

  // Inerzia (effetto di smorzamento dei movimenti)
  camera.inertia = 0.7;
}

/**
 * Configura i controlli della telecamera
 * @param {BABYLON.ArcRotateCamera} camera La telecamera
 */
function configureCameraControls(camera) {
  // Imposta i pulsanti del mouse per i controlli
  camera.inputs.attached.pointers.buttons = [0, 1, 2];  // Supporta tasto sinistro, medio e destro

  // Sensibilità dell'angolazione
  camera.angularSensibilityX = 500;
  camera.angularSensibilityY = 500;

  // Sensibilità panoramica
  camera.panningSensibility = 50;

  // Abilita il panning con il tasto destro (spostamento della telecamera)
  camera.useCtrlForPanning = false;
  camera.panningAxis = new BABYLON.Vector3(1, 1, 1);  // Consenti panning su tutti gli assi

  // Opzionale: imposta una posizione home che può essere ripristinata
  camera.setPosition(new BABYLON.Vector3(30, 20, 30));
}

/**
 * Configura gli eventi per la navigazione nella scena
 * @param {BABYLON.ArcRotateCamera} camera La telecamera
 * @param {BABYLON.Scene} scene La scena
 * @param {HTMLCanvasElement} canvas L'elemento canvas
 */
function setupCameraNavigation(camera, scene, canvas) {
  // Evento doppio click per centrare la vista su un oggetto
  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
      const pickResult = scene.pick(scene.pointerX, scene.pointerY);

      if (pickResult.hit && pickResult.pickedMesh) {
        const mesh = pickResult.pickedMesh;

        // Verifica se è un nodo
        if (mesh.name.startsWith('node_')) {
          // Anima la telecamera verso il nodo
          animateCameraToTarget(camera, mesh.position);
        }
      }
    }
  });

  // Pulsante Home (opzionale)
  const homeButton = document.getElementById('homeButton');
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      resetCameraPosition(camera);
    });
  }

  // Gestisci il tasto ESC per ripristinare la vista
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      resetCameraPosition(camera);
    }
  });
}

/**
 * Anima la telecamera verso un punto target
 * @param {BABYLON.ArcRotateCamera} camera La telecamera
 * @param {BABYLON.Vector3} targetPosition Posizione target
 */
export function animateCameraToTarget(camera, targetPosition) {
  // Crea un'animazione per spostare il target della telecamera
  const targetAnimation = new BABYLON.Animation(
    "targetAnimation",
    "target",
    30,  // frame rate
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  // Keyframes per l'animazione target
  const targetKeyframes = [
    { frame: 0, value: camera.target },
    { frame: 30, value: targetPosition }
  ];
  targetAnimation.setKeys(targetKeyframes);

  // Aggiungi easing
  const easingFunction = new BABYLON.QuadraticEase();
  easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
  targetAnimation.setEasingFunction(easingFunction);

  // Aggiungi l'animazione alla telecamera
  camera.animations = [];
  camera.animations.push(targetAnimation);

  // Avvia l'animazione
  camera.getScene().beginAnimation(camera, 0, 30, false);
}

/**
 * Ripristina la posizione predefinita della telecamera
 * @param {BABYLON.ArcRotateCamera} camera La telecamera
 */
export function resetCameraPosition(camera) {
  // Crea animazioni per ripristinare la posizione iniziale
  const alphaAnimation = new BABYLON.Animation(
    "alphaAnimation",
    "alpha",
    30,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const betaAnimation = new BABYLON.Animation(
    "betaAnimation",
    "beta",
    30,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const radiusAnimation = new BABYLON.Animation(
    "radiusAnimation",
    "radius",
    30,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const targetAnimation = new BABYLON.Animation(
    "targetAnimation",
    "target",
    30,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  // Keyframes
  alphaAnimation.setKeys([
    { frame: 0, value: camera.alpha },
    { frame: 30, value: -Math.PI / 2 }
  ]);

  betaAnimation.setKeys([
    { frame: 0, value: camera.beta },
    { frame: 30, value: Math.PI / 3 }
  ]);

  radiusAnimation.setKeys([
    { frame: 0, value: camera.radius },
    { frame: 30, value: 50 }
  ]);

  targetAnimation.setKeys([
    { frame: 0, value: camera.target },
    { frame: 30, value: new BABYLON.Vector3(0, 0, 0) }
  ]);

  // Aggiungi easing
  const easingFunction = new BABYLON.QuadraticEase();
  easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  alphaAnimation.setEasingFunction(easingFunction);
  betaAnimation.setEasingFunction(easingFunction);
  radiusAnimation.setEasingFunction(easingFunction);
  targetAnimation.setEasingFunction(easingFunction);

  // Aggiungi le animazioni alla telecamera
  camera.animations = [];
  camera.animations.push(alphaAnimation);
  camera.animations.push(betaAnimation);
  camera.animations.push(radiusAnimation);
  camera.animations.push(targetAnimation);

  // Avvia le animazioni
  camera.getScene().beginAnimation(camera, 0, 30, false);
}

/**
 * Crea una fotocamera secondaria per una vista alternativa (es. vista dall'alto)
 * @param {BABYLON.Scene} scene La scena
 * @param {HTMLCanvasElement} canvas L'elemento canvas
 * @returns {BABYLON.Camera} La telecamera secondaria
 */
export function createSecondaryCamera(scene, canvas) {
  // Crea una telecamera dall'alto
  const topCamera = new BABYLON.FreeCamera(
    "topCamera",
    new BABYLON.Vector3(0, 100, 0),
    scene
  );

  // Punta verso il basso
  topCamera.setTarget(new BABYLON.Vector3(0, 0, 0));

  // Disattiva i controlli di default
  topCamera.detachControl();

  // Opzionale: configura un viewport per questa telecamera
  // In questo caso, posizionala in un angolo del canvas
  topCamera.viewport = new BABYLON.Viewport(0.8, 0, 0.2, 0.2);

  // Disabilita inizialmente la telecamera secondaria
  topCamera.isEnabled = false;

  return topCamera;
}

/**
 * Attiva o disattiva la telecamera secondaria
 * @param {BABYLON.Camera} mainCamera La telecamera principale
 * @param {BABYLON.Camera} secondaryCamera La telecamera secondaria
 */
export function toggleSecondaryCamera(mainCamera, secondaryCamera) {
  if (secondaryCamera.isEnabled) {
    // Disattiva la telecamera secondaria
    secondaryCamera.isEnabled = false;
    mainCamera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
  } else {
    // Attiva la telecamera secondaria
    secondaryCamera.isEnabled = true;
    mainCamera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
  }
}