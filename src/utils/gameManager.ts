// Import and re-export the GameInfo type from the types directory
import type { GameInfo } from '@/types/game';
import {
  EMULATOR_CONTAINER_ID,
  EMULATOR_SCRIPT_URL,
  EMULATOR_CSS_URL,
  EMULATOR_CSS_ID,
  EMULATOR_SCRIPT_ID,
  EMULATOR_CORE,
  EMULATOR_PATH_TO_DATA,
  GAME_HISTORY_KEY,
  GAME_LIST_KEY
} from './config';

export type { GameInfo };

declare global {
  interface Window {
    EJS_emulator?: {
      [key: string]: any;
      stop: () => void;
    };
    EJS_player?: string;
    EJS_core?: string;
    EJS_gameUrl?: string;
    EJS_pathtodata?: string;
    EJS_emulatorPath?: string;
    EJS_startOnLoaded?: boolean;
    EJS_useWebGL?: boolean;
    EJS_volume?: number;
    EJS_onLoadError?: (error: Error) => void;
    EJS_ready?: () => void;
    EJS_onStart?: () => void;
    EJS_onGameStart?: () => void;
    EJS_onGameLoad?: () => void;
  }
}

// Game state type
type GameState = 'idle' | 'loading' | 'running' | 'error';
type StateChangeCallback = (state: GameState) => void;

// Game history interface
interface GameHistory {
  lastPlayed: string;
  lastPlayedTime: number;
  playCount: number;
}

type GameHistoryMap = Record<string, GameHistory>;

export class GameManager {
  private static readonly GAME_HISTORY_KEY = GAME_HISTORY_KEY;
  private static readonly GAME_LIST_KEY = GAME_LIST_KEY;
  private static gameHistory: GameHistoryMap = {};
  private static emulator: any = null;
  private static stateChangeCallbacks: StateChangeCallback[] = [];
  private static currentState: GameState = 'idle';
  private static readonly EMULATOR_SCRIPT = EMULATOR_SCRIPT_URL;
  
  // Prevent instantiation
  private constructor() {}
  
  // Subscribe to state changes
  public static onStateChange(callback: StateChangeCallback): () => void {
    this.stateChangeCallbacks.push(callback);
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Update state and notify subscribers
  private static setState(newState: GameState): void {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.stateChangeCallbacks.forEach(callback => callback(newState));
    }
  }
  
  // Get current state
  public static getState(): GameState {
    return this.currentState;
  }

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

  /**
   * Ensures the emulator container exists and is ready for use
   * @returns The container element
   * @throws {Error} If document is not available
   */
  private static ensureContainer(): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('Document is not available');
    }

    const container = document.getElementById(EMULATOR_CONTAINER_ID);
    if (!container) {
      throw new Error('Emulator container not found in DOM!');
    }
    container.innerHTML = '';
    container.style.display = 'block';
    return container;
  }

  /**
   * Stops the currently running emulator instance if any
   * @returns {Promise<void>}
   */
  public static async stopEmulator(): Promise<void> {
    try {
      if (this.emulator && typeof this.emulator.stop === 'function') {
        await Promise.resolve(this.emulator.stop());
      }
    } catch (error) {
      console.error('Error stopping emulator:', error);
      throw error;
    } finally {
      // Clean up emulator instance
      this.emulator = null;
      
      // Reset emulator state
      if (window.EJS_emulator) {
        try {
          // Clear any emulator-specific state
          delete window.EJS_emulator;
        } catch (e) {
          console.warn('Error cleaning up emulator state:', e);
        }
      }
      
      // Reset loading state
      this.setState('idle');
      
      // Clean up container
      try {
        const container = this.ensureContainer();
       // DEBUG: Confirm container exists and is correct before EmulatorJS init
       console.log('[EJS DEBUG] Container at init:', container);
       if (container) {
         console.log('[EJS DEBUG] Container innerHTML:', container.innerHTML);
       } else {
         throw new Error('[EJS DEBUG] Emulator container not found at initialization!');
       }
        container.innerHTML = '';
      } catch (error) {
        console.warn('Could not clean up container:', error);
      }
      
      // Clean up script reference but don't remove the script element
      // as it might be needed by other instances
      this.emulatorLoadPromise = null;
      this.isEmulatorScriptLoading = false;
    }
  }

  /**
   * Initializes the emulator with the specified game
   * @param gamePath Path to the game file
   * @returns Promise that resolves to true if initialization was successful
   */
  private static isEmulatorScriptLoading = false;
  private static emulatorLoadPromise: Promise<void> | null = null;

  private static async loadEmulatorScript(): Promise<void> {
    // If already loaded, resolve immediately
    if (window.EJS_emulator) {
      return;
    }

    // If already loading, return the existing promise
    if (this.emulatorLoadPromise) {
      return this.emulatorLoadPromise;
    }

    this.isEmulatorScriptLoading = true;
    
    this.emulatorLoadPromise = new Promise<void>((resolve, reject) => {
      // Check again in case it was loaded while we were waiting
      if (window.EJS_emulator) {
        this.isEmulatorScriptLoading = false;
        resolve();
        return;
      }

      console.log('[EJS] Preparing to load emulator script:', this.EMULATOR_SCRIPT);
      const script = document.createElement('script');
      script.src = this.EMULATOR_SCRIPT;
      script.async = true;
      script.onload = () => {
        console.log('[EJS] Emulator script loaded successfully');
        this.isEmulatorScriptLoading = false;
        resolve();
      };
      script.onerror = (e) => {
        console.error('[EJS] Script load error:', e, 'Script src:', script.src);
        this.isEmulatorScriptLoading = false;
        this.emulatorLoadPromise = null;
        reject(new Error('Failed to load emulator script'));
      };
      
      // Remove any existing script first
      const existingScript = document.getElementById(EMULATOR_SCRIPT_ID);
      if (existingScript) {
        console.warn('[EJS] Removing existing emulator script tag before adding new one');
        existingScript.remove();
      }
      
      // Set a unique ID to track the script
      script.id = EMULATOR_SCRIPT_ID;
      
      document.head.appendChild(script);
      console.log('[EJS] Emulator script tag appended to document head:', script);
    });

    return this.emulatorLoadPromise;
  }

  /**
   * Initializes and starts the emulator with the provided game path
   * Ensures the emulator container is reset and only one instance runs at a time
   * @param gamePath Path to the game ROM
   * @param onStarted Optional callback to run after emulator is running
   */
  public static async initializeEmulator(gamePath: string, onStarted?: () => void): Promise<boolean> {
    if (!gamePath) {
      throw new Error('No game path provided');
    }
    
    // Stop any running emulator and clean up container
    await this.stopEmulator();
    this.cleanupContainer();
    this.setState('loading');
    
    try {
      // Wait for DOM to be fully loaded
      if (document.readyState !== 'complete') {
        await new Promise<void>((resolve) => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', () => resolve(), { once: true });
          }
        });
      }
      
      const container = this.ensureContainer();
      
      // Optionally notify UI that emulator is running
      if (onStarted) {
        onStarted();
      }
      // No manual canvas creation here; EmulatorJS will handle it.
      
      // Set up emulator configuration
      window.EJS_player = '#emulator-container';
      window.EJS_core = EMULATOR_CORE;
      window.EJS_gameUrl = gamePath;
      window.EJS_pathtodata = EMULATOR_PATH_TO_DATA;
      window.EJS_startOnLoaded = true;

      // Inject EmulatorJS CDN CSS if not already present
      if (!document.getElementById(EMULATOR_CSS_ID)) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = EMULATOR_CSS_URL;
        cssLink.id = EMULATOR_CSS_ID;
        document.head.appendChild(cssLink);
      }
      
      // Load the emulator script
      await this.loadEmulatorScript();
      
      // Wait for the emulator to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Emulator initialization timed out'));
        }, 50000);
        
        const checkReady = setInterval(() => {
          if (window.EJS_emulator) {
            clearTimeout(timeout);
            clearInterval(checkReady);
            this.emulator = window.EJS_emulator;
            resolve();
          }
        }, 100);
      });
      
      this.setState('running');
      return true;
    } catch (error) {
      console.error('Error initializing emulator:', error);
      await this.stopEmulator();
      this.setState('error');
      throw error;
    }
  }

  /**
   * Get today's featured game
   * @returns Promise that resolves to today's game or null if no games are available
   */
  public static async getTodaysGame(): Promise<GameInfo | null> {
    try {
      const games = await this.getAvailableGames();
      if (games.length === 0) {
        console.warn('No games available');
        return null;
      }
      
      // Load game history
      this.loadGameHistory();
      
      const now = Date.now();
      const today = new Date(now).toDateString();
      
      // Check if we have a game set for today
      const todaysGameId = Object.entries(this.gameHistory).find(
        ([_, history]) => history.lastPlayed === today
      )?.[0];
      
      if (todaysGameId) {
        return games.find(game => game.id === todaysGameId) || games[0];
      }
      
      // If no game for today, find the least recently played game
      const leastPlayedGame = Object.entries(this.gameHistory).length > 0
        ? Object.entries(this.gameHistory).sort(
            (a, b) => a[1].playCount - b[1].playCount || 
                     a[1].lastPlayedTime - b[1].lastPlayedTime
          )[0]
        : null;
      
      const nextGameId = leastPlayedGame ? leastPlayedGame[0] : games[0].id;
      
      // Update game history
      this.gameHistory[nextGameId] = {
        lastPlayed: today,
        lastPlayedTime: now,
        playCount: ((this.gameHistory[nextGameId]?.playCount) || 0) + 1
      };
      
      this.saveGameHistory();
      
      return games.find(game => game.id === nextGameId) || games[0];
    } catch (error) {
      console.error('Error getting today\'s game:', error);
      return null;
    }
  }
  
  // Load game history from localStorage
  private static loadGameHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const savedHistory = localStorage.getItem(this.GAME_HISTORY_KEY);
      if (savedHistory) {
        this.gameHistory = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('Error loading game history:', error);
      this.gameHistory = {};
    }
  }
  
  // Save game history to localStorage
  public static saveGameHistory(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.GAME_HISTORY_KEY, JSON.stringify(this.gameHistory));
      console.log('Game history saved:', this.gameHistory);
    } catch (error) {
      console.error('Error saving game history:', error);
    }
  }
  
  // Reset game history (for testing/development)
  public static resetHistory(): void {
    this.gameHistory = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.GAME_HISTORY_KEY);
    }
  }
    
    /**
   * Cleans up the emulator container
   */
  private static cleanupContainer(): void {
    if (typeof document === 'undefined') return;
    
    const container = document.getElementById(EMULATOR_CONTAINER_ID);
    if (container) {
      // Just clear the container; EmulatorJS will create its own canvas
      container.innerHTML = '';
    }
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }
}
