console.log('Emulator script loading...');

// Function to ensure the container exists and is properly set up
function ensureContainer() {
  let container = document.getElementById('emulator-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'emulator-container';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.overflow = 'hidden';
    container.style.backgroundColor = '#000';
    
    const gameArea = document.querySelector('[data-testid="game-area"]');
    if (gameArea) {
      gameArea.style.position = 'relative';
      gameArea.appendChild(container);
      console.log('Created emulator container in game area');
    } else {
      console.error('Game area not found');
      throw new Error('Game area element not found');
    }
  }
  
  return container;
}

// Get or create the container
let container;
try {
  container = ensureContainer();
} catch (error) {
  console.error('Failed to initialize emulator container:', error);
  window.dispatchEvent(new CustomEvent('emulatorError', { 
    detail: { 
      message: 'Failed to initialize game container',
      error: error.message
    } 
  }));
  throw error;
}

// Set up EmulatorJS configuration
const config = {
  player: '#emulator-container',
  core: 'c64', // This will use vice_x64sc core by default
  game: {
    path: '/games/Blockheads.d64',
    type: 'prg',
  },
  dataPath: 'https://cdn.emulatorjs.org/stable/data/',
  onStart: function() {
    console.log('Emulator started!');
  },
  onLoadError: function(error) {
    console.error('Emulator load error:', error);
  },
  onError: function(error) {
    console.error('Emulator error:', error);
  },
  onLoad: function() {
    console.log('Emulator loaded successfully');
  },
  onProgress: function(progress) {
    console.log('Loading progress:', progress);
  },
  onStart: function() {
    console.log('Emulator started!');
    window.dispatchEvent(new CustomEvent('emulatorStart'));
  },
  onLoadError: function(error) {
    console.error('Emulator load error:', error);
    window.dispatchEvent(new CustomEvent('emulatorError', { detail: { error } }));
  },
  onError: function(error) {
    console.error('Emulator error:', error);
    window.dispatchEvent(new CustomEvent('emulatorError', { detail: { error } }));
  },
  onLoad: function() {
    console.log('Emulator loaded successfully');
  },
  onProgress: function(progress) {
    console.log('Loading progress:', progress);
  },
  EJS_onGameStart: function() {
    console.log('Game started!');
    window.dispatchEvent(new CustomEvent('gameStart'));
  },
  EJS_onLoadError: function(error) {
    console.error('Game load error:', error);
    window.dispatchEvent(new CustomEvent('emulatorError', { detail: { error } }));
  },
  EJS_onError: function(error) {
    console.error('Game error:', error);
    try {
      // If WebGL fails, try falling back to canvas
      if (error && error.toString().includes('WebGL') && !config.EJS_forceCanvas) {
        console.log('WebGL error detected, attempting canvas fallback...');
        config.EJS_forceCanvas = true;
        config.EJS_useWebGL = false;
        window.EJS_forceCanvas = true;
        window.EJS_useWebGL = false;
        
        // Reload the emulator with canvas fallback
        setTimeout(() => {
          if (window.EJS_emulator) {
            window.EJS_emulator.startGame();
          }
        }, 1000);
        return;
      }
      window.dispatchEvent(new CustomEvent('emulatorError', { detail: { error } }));
    } catch (fallbackError) {
      console.error('Error in error handler:', fallbackError);
      window.dispatchEvent(new CustomEvent('emulatorError', { 
        detail: { 
          error: 'Failed to start game: ' + (error?.message || error || 'Unknown error') 
        } 
      }));
    }
  },
  EJS_onLoad: function() {
    console.log('Game loaded successfully');
  }
};

// Set global config for backward compatibility
window.EJS_player = config.player;
window.EJS_core = config.core;
window.EJS_gameName = config.EJS_gameName;
window.EJS_gameUrl = config.game.path;
window.EJS_pathtodata = config.dataPath;
window.EJS_useWebGL = config.EJS_useWebGL;
window.EJS_lightgun = config.EJS_lightgun;
window.EJS_volume = config.EJS_volume;
window.EJS_buttons = config.EJS_buttons;

// Debug info
console.log('Emulator config:', config);

// Check if game file exists and is accessible
console.log('Checking game file at:', config.game.path);
let gameLoadError = null;

const checkGameFile = async () => {
  try {
    const response = await fetch(config.game.path, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    console.log('✅ Game file found and accessible');
    console.log('Content-Type:', response.headers.get('Content-Type'));
    console.log('Content-Length:', response.headers.get('Content-Length'), 'bytes');
    return true;
  } catch (error) {
    const errorMessage = `Failed to load game file: ${error.message}. Please check if the file exists at: ${window.location.origin}${config.game.path}`;
    console.error('❌', errorMessage);
    gameLoadError = errorMessage;
    
    // Dispatch custom event to notify the React component
    window.dispatchEvent(new CustomEvent('emulatorError', { 
      detail: { 
        message: 'Failed to load game',
        error: errorMessage
      } 
    }));
    
    return false;
  }
};

// Run the check
checkGameFile().then(isAvailable => {
  if (!isAvailable) return;
  
  // Only proceed with emulator initialization if game file is available
  initializeEmulator();
});

function initializeEmulator() {
  // Existing emulator initialization code will go here
  console.log('Initializing emulator...');
  
  // Set up emulator configuration
  window.EJS_player = config.player;
  window.EJS_core = config.core;
  window.EJS_gameUrl = config.game.path;
  window.EJS_pathtodata = config.dataPath;
  
  window.EJS_onGameStart = function() {
    console.log('Emulator game started!');
    config.onStart();
  };
  
  window.EJS_onLoadError = function(error) {
    const errorMessage = `Failed to load emulator: ${error || 'Unknown error'}`;
    console.error('Emulator load error:', errorMessage);
    config.onLoadError(errorMessage);
    
    // Notify React component about the error
    window.dispatchEvent(new CustomEvent('emulatorError', { 
      detail: { 
        message: 'Emulator initialization failed',
        error: errorMessage
      } 
    }));
  };
  
  window.EJS_onError = function(error) {
    const errorMessage = `Emulator error: ${error || 'Unknown error'}`;
    console.error(errorMessage);
    config.onError(errorMessage);
    
    // Notify React component about the error
    window.dispatchEvent(new CustomEvent('emulatorError', { 
      detail: { 
        message: 'Emulator error occurred',
        error: errorMessage
      } 
    }));
  };
  
  window.EJS_onLoad = function() {
    console.log('Emulator loaded successfully');
    config.onLoad();
  };
  
  // Load the CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = 'https://cdn.emulatorjs.org/stable/data/emulator.min.css';
  document.head.appendChild(cssLink);
  
  // Load the emulator script
  const script = document.createElement('script');
  script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  script.onerror = function() {
    const errorMessage = 'Failed to load emulator script';
    console.error(errorMessage);
    
    // Notify React component about the error
    window.dispatchEvent(new CustomEvent('emulatorError', { 
      detail: { 
        message: 'Failed to load emulator',
        error: errorMessage
      } 
    }));
  };
  document.head.appendChild(script);
}

// Initialize the emulator
console.log('Initializing emulator...');
console.log('Container element:', container);

// Add a small delay to ensure the container is fully in the DOM
setTimeout(() => {
  try {
    // Verify container is still in the DOM
    if (!document.body.contains(container)) {
      throw new Error('Container is no longer in the DOM');
    }
  } catch (error) {
    console.error('Container verification failed:', error);
    window.dispatchEvent(new CustomEvent('emulatorError', { 
      detail: { 
        message: 'Game container is not available',
        error: error.message
      } 
    }));
  }
}, 100);

// Log when the container content changes
const observer = new MutationObserver((mutations) => {
  console.log('Container content changed:', mutations);
  const iframe = container.querySelector('iframe');
  if (iframe) {
    console.log('Emulator iframe found:', iframe);
    console.log('Iframe src:', iframe.src);
    console.log('Iframe contentDocument:', iframe.contentDocument);
    observer.disconnect(); // Stop observing once we find the iframe
  }
});

// Start observing the container for changes
observer.observe(container, { childList: true, subtree: true });

// Set up emulator configuration
window.EJS_player = config.player;
window.EJS_core = config.core;
window.EJS_gameUrl = config.game.path;
window.EJS_pathtodata = config.dataPath;
window.EJS_onGameStart = function() {
  console.log('Emulator game started!');
  config.onStart();
};
window.EJS_onLoadError = function(error) {
  console.error('Emulator load error:', error);
  config.onLoadError(error);
};
window.EJS_onError = function(error) {
  console.error('Emulator error:', error);
  config.onError(error);
};
window.EJS_onLoad = function() {
  console.log('Emulator loaded successfully');
  config.onLoad();
};

// Load the CSS
const cssLink = document.createElement('link');
cssLink.rel = 'stylesheet';
cssLink.href = 'https://cdn.emulatorjs.org/stable/data/emulator.min.css';
document.head.appendChild(cssLink);

// Load the emulator script
const script = document.createElement('script');
script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
script.onerror = (error) => {
  console.error('Failed to load emulator script:', error);
  container.innerHTML = `
    <div style="color: white; background: #ff4444; padding: 1rem; border-radius: 4px;">
      Failed to load emulator. Please check your internet connection and try again.
    </div>
  `;
};
document.head.appendChild(script);