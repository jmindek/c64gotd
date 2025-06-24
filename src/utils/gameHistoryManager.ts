// Handles all game history and localStorage logic
import { Logger } from './logger';
import type { IGameHistoryStore } from './gameHistoryStore';
import { LocalGameHistoryStore } from './gameHistoryStore';

export interface GameHistory {
  lastPlayed: string;
  lastPlayedTime: number;
  playCount: number;
}

export type GameHistoryMap = Record<string, GameHistory>;

export class GameHistoryManager {
  private gameHistory: GameHistoryMap = {};
  private store: IGameHistoryStore;

  constructor(store: IGameHistoryStore = new LocalGameHistoryStore()) {
    this.store = store;
    this.gameHistory = {};
  }

  /** Load game history from the injected store */
  public load(): GameHistoryMap {
    this.gameHistory = this.store.load();
    Logger.info('Loaded game history:', this.gameHistory);
    return this.gameHistory;
  }

  /** Save game history to the injected store */
  public save(): void {
    this.store.save(this.gameHistory);
    Logger.info('Game history saved:', this.gameHistory);
  }

  /** Reset game history (for testing/development) */
  public reset(): void {
    this.gameHistory = {};
    this.store.reset();
    Logger.info('Game history reset');
  }

  /** Get the current game history map */
  public getHistory(): GameHistoryMap {
    return this.gameHistory;
  }

  /** Update history for a specific game */
  public updateGame(gameId: string, today: string, now: number): void {
    this.gameHistory[gameId] = {
      lastPlayed: today,
      lastPlayedTime: now,
      playCount: ((this.gameHistory[gameId].playCount) || 0) + 1,
    };
    this.save();
  }
}

// Default singleton for legacy usage
export const DefaultGameHistoryManager = new GameHistoryManager();

