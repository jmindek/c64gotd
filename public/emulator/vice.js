// Placeholder for VICE emulator
console.log('VICE emulator placeholder loaded');

// Initialize the emulator when loaded
if (typeof Module !== 'undefined') {
  Module.onRuntimeInitialized = function() {
    console.log('VICE emulator runtime initialized');
    if (typeof Module._main === 'function') {
      Module._main();
    }
  };
}

// Export for CommonJS/Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Module;
}
