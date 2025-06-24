// Handles all game history and localStorage logic
import { GAME_HISTORY_KEY } from './config';
import { Logger } from './logger';

export interface GameHistory {
  lastPlayed: string;
  lastPlayedTime: number;
  playCount: number;
}

export type GameHistoryMap = Record<string, GameHistory>;

export class GameHistoryManager {
  private static gameHistory: GameHistoryMap = {};

  /** Load game history from localStorage */
  public static load(): GameHistoryMap {
    if (typeof window === 'undefined') return {};
    try {
      const savedHistory = localStorage.getItem(GAME_HISTORY_KEY);
      Logger.warn(`Loaded game history: ${savedHistory}`);
      if (savedHistory) {
        this.gameHistory = JSON.parse(savedHistory);
      }
    } catch (error) {
      Logger.error('Error loading game history:', error);
      this.gameHistory = {};
    }
    return this.gameHistory;
  }

  /** Save game history to localStorage */
  public static save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(this.gameHistory));
      Logger.info('Game history saved:', this.gameHistory);
    } catch (error) {
      Logger.error('Error saving game history:', error);
    }
  }

  /** Reset game history (for testing/development) */
  public static reset(): void {
    this.gameHistory = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GAME_HISTORY_KEY);
    }
  }

  /** Get the current game history map */
  public static getHistory(): GameHistoryMap {
    return this.gameHistory;
  }

  /** Update history for a specific game */
  public static updateGame(gameId: string, today: string, now: number): void {
    this.gameHistory[gameId] = {
      lastPlayed: today,
      lastPlayedTime: now,
      playCount: ((this.gameHistory[gameId]?.playCount) || 0) + 1
    };
    this.save();
  }
}
