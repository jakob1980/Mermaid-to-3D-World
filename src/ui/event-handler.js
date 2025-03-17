// eventHandler.js
// Gestisce gli eventi dell'interfaccia utente

import { resetCameraPosition } from '../scene/camera-controller.js';

/**
 * Collega gli eventi agli elementi dell'interfaccia
 * @param {Object} elements Elementi dell'interfaccia
 * @param {Object} callbacks Funzioni di callback
 */
export function handleEvents(elements, callbacks) {
  console.log("Inizializzazione eventi UI", elements);
  
  // Bottone di caricamento file
  if (elements.uploadButton && elements.fileInput) {
    console.log("Upload button trovato:", elements.uploadButton);
    console.log("File input trovato:", elements.fileInput);
    
    elements.uploadButton.addEventListener('click', () => {
      console.log("Upload button cliccato!");
      elements.fileInput.click();
    });
    
    elements.fileInput.addEventListener('change', (event) => {
      console.log("File selezionato:", event.target.files);
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        if (callbacks.onFileLoaded) {
          callbacks.onFileLoaded(file);
        }
      }
    });
  } else {
    console.error("Elementi mancanti:", { 
      uploadButton: !!elements.uploadButton, 
      fileInput: !!elements.fileInput 
    });
  }
  
  // Bottone di caricamento esempio
  if (elements.loadExampleButton && elements.exampleSelect) {
    elements.loadExampleButton.addEventListener('click', () => {
      const selectedExample = elements.exampleSelect.value;
      if (selectedExample && callbacks.onExampleSelected) {
        callbacks.onExampleSelected(selectedExample);
      }
    });
  }
  
  // Bottone di reset
  if (elements.resetButton) {
    elements.resetButton.addEventListener('click', () => {
      // Trova la camera nella scena
      const scene = BABYLON.Engine.Instances[0]?.scenes[0];
      if (scene) {
        const camera = scene.getCameraByName('mainCamera');
        if (camera) {
          resetCameraPosition(camera);
        }
      }
    });
  }
  
  // Bottone di aiuto
  if (elements.helpButton && elements.helpPanel) {
    elements.helpButton.addEventListener('click', () => {
      elements.helpPanel.style.display = 'block';
    });
  }
  
  // Bottone chiudi aiuto
  if (elements.closeHelpButton && elements.helpPanel) {
    elements.closeHelpButton.addEventListener('click', () => {
      elements.helpPanel.style.display = 'none';
    });
  }
  
  // Bottone schermo intero
  if (elements.fullscreenButton) {
    elements.fullscreenButton.addEventListener('click', () => {
      toggleFullscreen();
    });
  }
  
  // Gestione drag and drop dei file
  if (elements.canvas) {
    elements.canvas.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
      elements.canvas.classList.add('drag-over');
    });
    
    elements.canvas.addEventListener('dragleave', (event) => {
      event.preventDefault();
      event.stopPropagation();
      elements.canvas.classList.remove('drag-over');
    });
    
    elements.canvas.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      elements.canvas.classList.remove('drag-over');
      
      if (event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.name.endsWith('.mmd') || file.name.endsWith('.txt')) {
          if (callbacks.onFileLoaded) {
            callbacks.onFileLoaded(file);
          }
        } else {
          showErrorToast('Il file deve essere in formato .mmd o .txt');
        }
      }
    });
  }
  
  // Gestione tasti
  document.addEventListener('keydown', (event) => {
    // ESC per chiudere il pannello di aiuto
    if (event.key === 'Escape' && elements.helpPanel) {
      elements.helpPanel.style.display = 'none';
    }
    
    // F1 per mostrare il pannello di aiuto
    if (event.key === 'F1' && elements.helpPanel) {
      event.preventDefault();
      elements.helpPanel.style.display = 'block';
    }
    
    // F11 per schermo intero
    if (event.key === 'F11') {
      event.preventDefault();
      toggleFullscreen();
    }
  });
}

/**
 * Attiva/disattiva la modalità a schermo intero
 */
function toggleFullscreen() {
  const container = document.documentElement;
  
  if (!document.fullscreenElement) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

/**
 * Mostra un messaggio di errore temporaneo
 * @param {string} message Messaggio di errore
 */
function showErrorToast(message) {
  let toast = document.getElementById('errorToast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'errorToast';
    toast.className = 'error-toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

/**
 * Aggiunge un listener per eventi personalizzati dell'applicazione
 * @param {string} eventName Nome dell'evento
 * @param {Function} callback Funzione da eseguire
 */
export function addAppEventListener(eventName, callback) {
  document.addEventListener(eventName, callback);
}

/**
 * Genera un evento personalizzato dell'applicazione
 * @param {string} eventName Nome dell'evento
 * @param {Object} detail Dati aggiuntivi dell'evento
 */
export function dispatchAppEvent(eventName, detail = {}) {
  const event = new CustomEvent(eventName, { detail });
  document.dispatchEvent(event);
}
