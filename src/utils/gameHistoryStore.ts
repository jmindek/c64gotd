// Interface and localStorage implementation for game history storage
import type { GameHistoryMap } from './gameHistoryManager';
import { GAME_HISTORY_KEY } from './config';
import { Logger } from './logger';

export interface IGameHistoryStore {
  load(): GameHistoryMap;
  save(history: GameHistoryMap): void;
  reset(): void;
}

export class LocalGameHistoryStore implements IGameHistoryStore {
  load(): GameHistoryMap {
    if (typeof window === 'undefined') return {};
    try {
      const savedHistory = localStorage.getItem(GAME_HISTORY_KEY);
      /* eslint-disable-next-line */
      return savedHistory ? JSON.parse(savedHistory) : {};
    } catch (error) {
      return {};
    }
  }
  save(history: GameHistoryMap): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      Logger.error('Error saving game history:', error);
    }
  }
  reset(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GAME_HISTORY_KEY);
    }
  }
}
