// Interface and default implementation for game catalog storage
import type { GameInfo } from '@/types/game';

export interface IGameCatalogStore {
  getAvailableGames(): Promise<GameInfo[]>;
}

export class LocalGameCatalogStore implements IGameCatalogStore {
  async getAvailableGames(): Promise<GameInfo[]> {
    try {
      const { GAMES } = await import('@/api/games');
      return GAMES;
    } catch (error) {
      return [];
    }
  }
}
