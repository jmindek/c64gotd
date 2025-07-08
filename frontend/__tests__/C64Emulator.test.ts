import { C64Emulator } from '../src/lib/emulator';

describe('C64Emulator', () => {
  let emulator: C64Emulator;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create a mock canvas element
    mockCanvas = document.createElement('canvas');
    mockCanvas.id = 'game-canvas';
    document.body.appendChild(mockCanvas);
    
    // Create a new instance of the emulator for each test
    emulator = new C64Emulator(mockCanvas);
  });

  afterEach(() => {
    // Clean up after each test
    if (document.body.contains(mockCanvas)) {
      document.body.removeChild(mockCanvas);
    }
    emulator.destroy();
  });

  describe('initialization', () => {
    it('should initialize in idle state', () => {
      expect(emulator.isGameRunning()).toBe(false);
    });

    it('should initialize successfully', async () => {
      const onReady = jest.fn();
      const onProgress = jest.fn();
      
      emulator.onReady(onReady);
      emulator.onProgress(onProgress);
      
      await emulator.initialize();
      
      expect(onReady).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(100);
    });
  });

  describe('game loading', () => {
    const TEST_ROM_URL = 'http://example.com/games/test.prg';
    
    beforeEach(async () => {
      await emulator.initialize();
    });

    it('should load a game successfully', async () => {
      const onProgress = jest.fn();
      emulator.onProgress(onProgress);
      
      await emulator.loadGame(TEST_ROM_URL);
      
      // Check that the game name is extracted correctly
      const display = mockCanvas.querySelector('div');
      expect(display).not.toBeNull();
      expect(display?.textContent).toBe('test');
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('should handle game loading errors', async () => {
      const onError = jest.fn();
      
      // Create an uninitialized emulator to test error case
      const uninitializedEmulator = new C64Emulator(mockCanvas);
      uninitializedEmulator.onError(onError);
      
      try {
        await uninitializedEmulator.loadGame(TEST_ROM_URL);
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Emulator not ready');
      }
      
      // Verify the error callback was called
      expect(onError).toHaveBeenCalledWith('Emulator not ready');
    });
  });

  describe('game control', () => {
    const TEST_ROM_URL = 'http://example.com/games/blockheads.prg';
    
    beforeEach(async () => {
      await emulator.initialize();
      await emulator.loadGame(TEST_ROM_URL);
    });

    it('should start the game', async () => {
      await emulator.start();
      expect(emulator.isGameRunning()).toBe(true);
      
      // Check that the game name is displayed
      const display = mockCanvas.querySelector('div');
      expect(display?.textContent).toBe('blockheads');
    });

    it('should stop the game', () => {
      emulator.start();
      expect(emulator.isGameRunning()).toBe(true);
      
      emulator.stop();
      expect(emulator.isGameRunning()).toBe(false);
      
      // Check that the display is cleared
      const display = mockCanvas.querySelector('div');
      expect(display).toBeNull();
    });
  });

  describe('event callbacks', () => {
    it('should call onReady when initialized', async () => {
      const onReady = jest.fn();
      emulator.onReady(onReady);
      
      await emulator.initialize();
      
      expect(onReady).toHaveBeenCalled();
    });

    it('should call onProgress with progress updates', async () => {
      const onProgress = jest.fn();
      emulator.onProgress(onProgress);
      
      await emulator.initialize();
      
      // Should be called at least once with 100% progress
      expect(onProgress).toHaveBeenCalledWith(100);
    });
  });
});
