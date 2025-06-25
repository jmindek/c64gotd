// Import and re-export the GameInfo type from the types directory
import type { GameInfo } from '@/types/game';
import {
  GAME_HISTORY_KEY,
  GAME_LIST_KEY,
} from './config';

export type { GameInfo };

declare global {
  interface Window {
    EJS_emulator?: {
      /* eslint-disable-next-line */
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
import { DefaultGameHistoryManager } from './gameHistoryManager';

import { EmulatorManager } from './emulatorManager';
import { DefaultGameCatalog } from './gameCatalog';

export class GameManager {
  private static readonly GAME_HISTORY_KEY = GAME_HISTORY_KEY;
  private static readonly GAME_LIST_KEY = GAME_LIST_KEY;

  private static stateChangeCallbacks: StateChangeCallback[] = [];
  private static currentState: GameState = 'idle';

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
      this.stateChangeCallbacks.forEach(callback => {
        callback(newState);
      });
    }
  }

  // Get current state
  public static getState(): GameState {
    return this.currentState;
  }

  // Get all available games from the backend API
  public static async getAvailableGames(): Promise<GameInfo[]> {
    const response = await fetch('/api/games');
    if (!response.ok) throw new Error('Failed to fetch games from backend');
    return response.json();
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
   * Get today's featured game from the backend
   * @returns Promise that resolves to today's game or null if no games are available
   */
  public static async getTodaysGame(): Promise<GameInfo | null> {
    try {
      const response = await fetch('/api/game_of_the_day');
      if (!response.ok) throw new Error('Failed to fetch game of the day from backend');
      return await response.json();
    } catch (error) {
      console.error("Error fetching today's game from backend:", error);
      return null;
    }
  }

  // Reset game history (for testing/development)
  public static resetHistory(): void {
    DefaultGameHistoryManager.reset();
  }


}
