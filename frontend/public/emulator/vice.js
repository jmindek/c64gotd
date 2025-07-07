window.EJS_onGameStart = function() {
  console.log('Emulator game started!');
  if (typeof window.viceOnStart === 'function') window.viceOnStart();
};

window.EJS_onLoadError = function(error) {
  const errorMessage = `Failed to load emulator: ${error || 'Unknown error'}`;
  console.error('Emulator load error:', errorMessage);
  if (typeof window.viceOnLoadError === 'function') window.viceOnLoadError(errorMessage);
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
  if (typeof window.viceOnError === 'function') window.viceOnError(errorMessage);
  window.dispatchEvent(new CustomEvent('emulatorError', {
    detail: {
      message: 'Emulator error occurred',
      error: errorMessage
    }
  }));
};

window.EJS_onLoad = function() {
  console.log('Emulator loaded successfully');
  if (typeof window.viceOnLoad === 'function') window.viceOnLoad();
};