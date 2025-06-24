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

// Game history management
import { GameHistoryManager, GameHistory, GameHistoryMap } from './gameHistoryManager';

import { EmulatorManager } from './emulatorManager';

export class GameManager {
  private static readonly GAME_HISTORY_KEY = GAME_HISTORY_KEY;
  private static readonly GAME_LIST_KEY = GAME_LIST_KEY;
  
  private static stateChangeCallbacks: StateChangeCallback[] = [];
  private static currentState: GameState = 'idle';
  
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
    const { GameCatalog } = await import('./gameCatalog');
    return GameCatalog.getAvailableGames();
  }

  // Emulator lifecycle delegation
  public static ensureContainer(): HTMLElement {
    return EmulatorManager.ensureContainer();
  }

  public static cleanupContainer(): void {
    EmulatorManager.cleanupContainer();
  }

  public static async loadEmulatorScript(): Promise<void> {
    return EmulatorManager.loadEmulatorScript();
  }

  public static async stopEmulator(): Promise<void> {
    await EmulatorManager.stopEmulator();
    this.setState('idle');
  }

  public static async initializeEmulator(gamePath: string, onStarted?: () => void): Promise<boolean> {
    this.setState('loading');
    try {
      const result = await EmulatorManager.initializeEmulator(gamePath, onStarted);
      this.setState('running');
      return result;
    } catch (error) {
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
      const gameHistory = GameHistoryManager.load();
      const now = Date.now();
      const today = new Date(now).toDateString();

      // Check if we have a game set for today
      const todaysGameId = Object.entries(gameHistory).find(
        ([_, history]) => history.lastPlayed === today
      )?.[0];

      if (todaysGameId) {
        return games.find(game => game.id === todaysGameId) || games[0];
      }

      // If no game for today, find the least recently played game
      const leastPlayedGame = Object.entries(gameHistory).length > 0
        ? Object.entries(gameHistory).sort(
            (a, b) => a[1].playCount - b[1].playCount || 
                     a[1].lastPlayedTime - b[1].lastPlayedTime
          )[0]
        : null;

      const nextGameId = leastPlayedGame ? leastPlayedGame[0] : games[0].id;

      // Update game history
      GameHistoryManager.updateGame(nextGameId, today, now);

      return games.find(game => game.id === nextGameId) || games[0];
    } catch (error) {
      console.error('Error getting today\'s game:', error);
      return null;
    }
  }
  
  // Reset game history (for testing/development)
  public static resetHistory(): void {
    GameHistoryManager.reset();
  }
    

}
