// Import and re-export the GameInfo type from the types directory
import type { GameInfo } from '@/types/game';

export type { GameInfo };

// Using the global Window interface from emulatorjs.d.ts

export class GameManager {
  private static readonly GAME_HISTORY_KEY = 'c64_gotd_history';
  private static readonly GAME_LIST_KEY = 'c64_games';
  private static readonly ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static readonly TEST_ONE_MINUTE = 60 * 1000; // 1 minute in milliseconds

  // Get all available games from the imported list
  public static async getAvailableGames(): Promise<GameInfo[]> {
    try {
      // Import the games directly from the API file
      const { GAMES } = await import('@/api/games');
      
      if (!GAMES || GAMES.length === 0) {
        console.warn('No games found in the games list');
        return [];
      }
      
      return GAMES;
    } catch (error) {
      console.error('Error getting available games:', error);
      return [];
    }
  }

  // Initialize the emulator with the specified game
  public static async initializeEmulator(gamePath: string): Promise<boolean> {
    console.log('Initializing emulator with game:', gamePath);
    
    if (!gamePath) {
      const errorMsg = 'No game path provided';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Ensure the game path is properly formatted
    const normalizedPath = gamePath.startsWith('/') ? gamePath : `/${gamePath}`;
    console.log('Normalized game path:', normalizedPath);
    
    // First, stop any existing emulator instance
    this.stopEmulator();
    
    // Create the container if it doesn't exist
    const ensureContainer = (): HTMLElement => {
      let container = document.getElementById('emulator-container');
      
      if (!container) {
        // Create a new container if it doesn't exist
        container = document.createElement('div');
        container.id = 'emulator-container';
        container.className = 'w-full h-full relative';
        
        // Create the canvas element
        const canvas = document.createElement('canvas');
        canvas.id = 'game-canvas';
        canvas.className = 'w-full h-full';
        canvas.width = 800;
        canvas.height = 600;
        
        container.appendChild(canvas);
        
        // Find the game container in the DOM
        // Look for an element with the emulator-container ID or use the body as fallback
        let gameContainer = document.getElementById('game-container') || 
                          document.querySelector('.game-container') ||
                          document.body;
        
        gameContainer.appendChild(container);
      }
      
      // Make sure container is visible and has dimensions
      container.style.display = 'block';
      container.style.visibility = 'visible';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.position = 'relative';
      
      return container;
    };

    try {
      const container = await ensureContainer();
      
      // Ensure the container is visible and has dimensions
      container.style.display = 'block';
      container.style.visibility = 'visible';
      
      // Reset any existing emulator state
      if (window.EJS_emulator) {
        delete window.EJS_emulator;
      }
      
      try {
        // Set up emulator paths and configuration
        const emulatorCDN = 'https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@main/data/';
        
        console.log('Configuring emulator with game path:', gamePath);
        console.log('Using emulator CDN:', emulatorCDN);
        
        // Store the emulator configuration on the window object
        Object.assign(window, {
          EJS_player: '#emulator-container',
          EJS_gameUrl: gamePath, // Local path to the ROM
          EJS_core: 'vice_x64',
          EJS_pathtodata: emulatorCDN, // CDN for emulator data files
          EJS_emulatorPath: emulatorCDN, // CDN for emulator files
          EJS_startOnLoaded: true,
          EJS_useWebGL: true,
          EJS_volume: 0.5
        });

        // Define emulator event handlers
        const emulatorHandlers = {
          EJS_onLoadError: (error: Error) => {
            const errorMsg = `Emulator load error: ${error.message || 'Unknown error'}`;
            console.error(errorMsg, error);
            throw new Error(errorMsg);
          },
          EJS_ready: () => {
            console.log('Emulator is ready and game should be starting...');
          },
          EJS_onStart: () => {
            console.log('Emulator started successfully');
          },
          EJS_onGameStart: () => {
            console.log('Game started successfully');
          },
          EJS_onGameLoad: () => {
            console.log('Game loaded successfully');
          }
        };

        // Apply the emulator handlers
        Object.assign(window, emulatorHandlers);

        // Check if the script is already loaded
        if (!window.EJS_emulator) {
          console.log('Loading emulator script...');
          
          // Initialize timeoutId at the function scope
          let timeoutId: NodeJS.Timeout;
          
          return new Promise<boolean>((resolve, reject) => {
            try {
              // Set up a timeout to handle cases where the emulator fails to load
              timeoutId = setTimeout(() => {
                reject(new Error('Emulator initialization timed out after 30 seconds'));
              }, 30000);

              // Override the global EJS_ready function
              (window as any).EJS_ready = () => {
                if (timeoutId) clearTimeout(timeoutId);
                console.log('Emulator is ready');
                resolve(true);
              };

              // Load the emulator script from CDN
              const script = document.createElement('script');
              script.id = 'emulator-script';
              script.src = `${emulatorCDN}loader.js`;
              script.onerror = (error) => {
                if (timeoutId) clearTimeout(timeoutId);
                console.error('Failed to load emulator script:', error);
                reject(new Error(`Failed to load emulator script: ${error}`));
              };
              
              document.head.appendChild(script);
              console.log('Emulator script element added to document head');
            } catch (error) {
              if (timeoutId) clearTimeout(timeoutId);
              reject(error);
            }
          });
        } else {
          // If emulator is already loaded, just reset it
          this.stopEmulator();
          return true;
        }
      } catch (error) {
        console.error('Error initializing emulator:', error);
        this.stopEmulator();
        return false;
      }
    } catch (error) {
      console.error('Error initializing emulator:', error);
      this.stopEmulator();
      return false;
    }
  }

  // Stop the currently running emulator and clean up
  public static stopEmulator(): void {
    console.log('Stopping emulator...');
    
    // Stop and clean up the emulator instance
    if (window.EJS_emulator) {
      try {
        if (typeof window.EJS_emulator.stop === 'function') {
          window.EJS_emulator.stop();
        }
        // Clean up event listeners and other resources
        if (window.EJS_emulator.canvas) {
          const canvas = window.EJS_emulator.canvas;
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (error) {
        console.error('Error stopping emulator:', error);
      } finally {
        // Remove the emulator instance to ensure a clean state
        delete window.EJS_emulator;
      }
    }
    
    // Clear the emulator container
    const container = document.getElementById('emulator-container');
    if (container) {
      // Create a new canvas element to ensure a clean state
      const newCanvas = document.createElement('canvas');
      newCanvas.id = 'game-canvas';
      newCanvas.className = 'w-full h-full';
      newCanvas.width = 800;
      newCanvas.height = 600;
      
      // Replace the container contents
      container.innerHTML = '';
      container.appendChild(newCanvas);
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  // Get today's game of the day
  public static async getTodaysGame(): Promise<GameInfo | null> {
    const games = await this.getAvailableGames();
    if (games.length === 0) return null;

    // Get the last played game and timestamp from localStorage
    const lastPlayed = typeof window !== 'undefined' 
      ? localStorage.getItem(this.GAME_HISTORY_KEY) 
      : null;
    
    interface GameHistory {
      date: string;
      index: number;
      timestamp: number;
    }
    
    let lastGame: GameHistory | null = null;
    const now = Date.now();
    const isDev = process.env.NODE_ENV === 'development';
    const rotationTime = isDev ? this.TEST_ONE_MINUTE : this.ONE_DAY;
    
    if (lastPlayed) {
      try {
        const parsed = JSON.parse(lastPlayed) as Partial<GameHistory>;
        
        // Only use the parsed data if it has the required fields
        if (parsed && 
            typeof parsed.index === 'number' && 
            parsed.timestamp && 
            (now - parsed.timestamp) < rotationTime) {
          
          // If we have valid data and not enough time has passed, return the current game
          return games[parsed.index % games.length];
        }
        
        // If we're here but have a valid index, use it to continue the sequence
        if (parsed && typeof parsed.index === 'number') {
          lastGame = {
            date: parsed.date || new Date().toDateString(),
            index: parsed.index,
            timestamp: parsed.timestamp || now
          };
        }
      } catch (e) {
        console.error('Error parsing game history:', e);
      }
    }

    // If we get here, we need to select a new game
    let nextIndex = 0;
    if (lastGame !== null) {
      // Get the next game in sequence
      nextIndex = (lastGame.index + 1) % games.length;
    }

    // Save the new selection with current timestamp
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        this.GAME_HISTORY_KEY,
        JSON.stringify({
          date: new Date().toDateString(),
          index: nextIndex,
          timestamp: now
        })
      );
    }

    return games[nextIndex];
  }

  // Reset the game history (for testing purposes)
  public static resetHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.GAME_HISTORY_KEY);
    }
  }
}
