type EmulatorStatus = 'idle' | 'loading' | 'ready' | 'error' | 'running';

export class C64Emulator {
  private status: EmulatorStatus = 'idle';
  private gameName = '';
  private onReadyCallback?: () => void;
  private onErrorCallback?: (error: string) => void;
  private onProgressCallback?: (progress: number) => void;
  private gameContainer?: HTMLElement;

  constructor(canvas: HTMLCanvasElement) {
    console.log('C64Emulator stub initialized');
    // Store reference to the canvas
    this.gameContainer = canvas;
  }

  public async initialize(): Promise<void> {
    console.log('Initializing emulator...');
    this.status = 'loading';
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.status = 'ready';
    if (this.onReadyCallback) {
      this.onReadyCallback();
    }
    if (this.onProgressCallback) {
      this.onProgressCallback(100);
    }
    console.log('Emulator initialized');
  }

  public async loadGame(romUrl: string): Promise<void> {
    if (this.status !== 'ready') {
      const error = new Error('Emulator not ready');
      if (this.onErrorCallback) {
        this.onErrorCallback(error.message);
      }
      throw error;
    }

    this.status = 'loading';
    console.log(`Loading game from ${romUrl}`);
    
    try {
      // Extract game name from URL
      this.gameName = romUrl.split('/').pop()?.replace(/\.(prg|d64|t64|p00|crt)$/i, '') || 'C64 Game';
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update status and call callbacks
      this.status = 'ready';
      if (this.onProgressCallback) {
        this.onProgressCallback(100);
      }
      
      console.log(`Game loaded: ${this.gameName}`);
      this.displayGameName();
    } catch (error) {
      this.status = 'error';
      const errorMsg = error instanceof Error ? error.message : 'Failed to load game';
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMsg);
      }
      throw error;
    }
  }

  public start(): void {
    if (this.status !== 'ready') {
      throw new Error('Cannot start: emulator not ready');
    }
    
    if (!this.gameName) {
      throw new Error('No game loaded');
    }

    this.status = 'running';
    console.log(`Starting game: ${this.gameName}`);
    
    // In a real implementation, this would start the emulation
    this.displayGameName();
  }

  public stop(): void {
    if (this.status === 'running') {
      console.log('Stopping game');
      this.status = 'ready';
      this.clearDisplay();
    }
  }

  private displayGameName(): void {
    if (!this.gameContainer) {
      const container = document.getElementById('game-canvas');
      if (container) {
        this.gameContainer = container;
      } else {
        console.warn('Game container not found');
        return;
      }
    }

    // Clear previous content
    this.clearDisplay();
    
    // Create and style the game name display
    const display = document.createElement('div');
    display.style.display = 'flex';
    display.style.justifyContent = 'center';
    display.style.alignItems = 'center';
    display.style.width = '100%';
    display.style.height = '100%';
    display.style.color = '#fff';
    display.style.fontFamily = '"Press Start 2P", monospace';
    display.style.fontSize = '24px';
    display.style.textAlign = 'center';
    display.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    display.style.padding = '20px';
    display.style.boxSizing = 'border-box';
    display.style.overflow = 'hidden';
    display.style.wordBreak = 'break-word';
    
    display.textContent = this.gameName;
    this.gameContainer.appendChild(display);
  }

  private clearDisplay(): void {
    if (this.gameContainer) {
      this.gameContainer.innerHTML = '';
    }
  }

  public onReady(callback: () => void): void {
    this.onReadyCallback = callback;
  }

  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  public onProgress(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }

  public isGameRunning(): boolean {
    return this.status === 'running';
  }

  public destroy(): void {
    this.stop();
    this.clearDisplay();
    this.gameContainer = undefined;
    console.log('Emulator destroyed');
  }
}
