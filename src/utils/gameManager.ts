// Import and re-export the GameInfo type from the types directory
import type { GameInfo } from '@/types/game';
import {
  GAME_HISTORY_KEY,
  GAME_LIST_KEY,
  NOT_FOUND_GAME_NAME,
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
  /**
   * Ensure any input is shaped as a valid GameInfo object.
   */
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  private static normalizeGameInfo(data: any): GameInfo {
    return {
      id: typeof data.id === 'number' ? data.id : 'unknown',
      name: typeof data.name === 'string' ? data.name : 'Unknown Game',
      d64Path: typeof data.d64Path === 'string' ? data.d64Path : '',
      thumbnailPath: typeof data.thumbnailPath === 'string' ? data.thumbnailPath : '',
      description: typeof data.description === 'string' ? data.description : '',
      year: typeof data.year === 'number' ? data.year : undefined,
      publisher: typeof data.publisher === 'string' ? data.publisher : undefined,
      genre: typeof data.genre === 'string' ? data.genre : undefined,
      players: typeof data.players === 'string' ? data.players : undefined,
    };
  }
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */

  public static async getTodaysGame(): Promise<GameInfo> {
    try {
      const { fetchWithTimeout } = await import('../utils/index');
      const response = await fetchWithTimeout('/api/game_of_the_day', {}, 2000);
      if (!response.ok) throw new Error('Failed to fetch game of the day from backend');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await response.json();
      return GameManager.normalizeGameInfo(data);
    } catch (error: any) {
      let description = 'Game of the day not found.';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error && error.name === 'AbortError') {
        description = 'Request for game of the day timed out.';
      }
      console.error('Error fetching today\'s game from backend:', error);
      return {
        id: -1,
        name: NOT_FOUND_GAME_NAME,
        d64Path: '',
        thumbnailPath: '',
        description,
        year: undefined,
        publisher: undefined,
        genre: undefined,
        players: undefined,
      };
    }
  }

  // Reset game history (for testing/development)
  public static resetHistory(): void {
    DefaultGameHistoryManager.reset();
  }
}
