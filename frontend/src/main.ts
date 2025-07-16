import { App } from './app';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Hide start button on click
  const startButton = document.getElementById('startButton');
  const startButtonWrapper = document.getElementById('startButtonWrapper');
  if (startButton && startButtonWrapper) {
    startButton.addEventListener('click', () => {
      startButtonWrapper.classList.add('hidden');
    });
  }
  void (async () => {
    try {
      console.log('Initializing C64 Game of the Day app...');
      const app = new App();
      await app.initialize();
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);

      // Show error to user
      const errorDisplay = document.getElementById('errorDisplay');
      if (errorDisplay) {
        errorDisplay.textContent = 'Failed to initialize application. Please check the console for details.';
        errorDisplay.classList.remove('hidden');
      }
    }
  })();
});
