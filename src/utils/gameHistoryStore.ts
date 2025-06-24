// Interface and localStorage implementation for game history storage
import { GameHistoryMap } from './gameHistoryManager';
import { GAME_HISTORY_KEY } from './config';

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
      return savedHistory ? JSON.parse(savedHistory) : {};
    } catch (error) {
      return {};
    }
  }
  save(history: GameHistoryMap): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {}
  }
  reset(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GAME_HISTORY_KEY);
    }
  }
}
