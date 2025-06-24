import type { GameInfo } from '@/types/game';
import type { IGameCatalogStore } from './gameCatalogStore';
import { LocalGameCatalogStore } from './gameCatalogStore';

export class GameCatalog {
  private store: IGameCatalogStore;
  constructor(store: IGameCatalogStore = new LocalGameCatalogStore()) {
    this.store = store;
  }
  public async getAvailableGames(): Promise<GameInfo[]> {
    return this.store.getAvailableGames();
  }
}

// Default singleton for legacy usage
export const DefaultGameCatalog = new GameCatalog();
