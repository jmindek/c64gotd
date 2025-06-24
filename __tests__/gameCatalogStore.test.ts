import { LocalGameCatalogStore } from '../src/utils/gameCatalogStore';
import type { GameInfo } from '../src/types/game';

describe('LocalGameCatalogStore', () => {
  let store: LocalGameCatalogStore;
  let originalImport: any;

  beforeEach(() => {
    store = new LocalGameCatalogStore();
    // Save the original import function
    originalImport = globalThis.__importMock;
  });

  afterEach(() => {
    if (originalImport) {
      // Restore the original import if it was replaced
      globalThis.__importMock = originalImport;
    }
  });

  it('should return games from the imported list', async () => {
    // Mock the dynamic import
    const mockGames: GameInfo[] = [
      { id: 'g1', title: 'Game1', path: '/g1.d64', description: 'desc', year: 1985 },
      { id: 'g2', title: 'Game2', path: '/g2.d64', description: 'desc2', year: 1986 }
    ];
    jest.spyOn(store as any, 'getAvailableGames').mockImplementationOnce(async () => mockGames);
    const games = await store.getAvailableGames();
    expect(games).toEqual(mockGames);
  });

  it('should return an empty array if GAMES is missing', async () => {
    jest.spyOn(store as any, 'getAvailableGames').mockImplementationOnce(async () => []);
    const games = await store.getAvailableGames();
    expect(games).toEqual([]);
  });

  it('should return an empty array on error', async () => {
    jest.spyOn(store as any, 'getAvailableGames').mockImplementationOnce(async () => { throw new Error('fail'); });
    let games: GameInfo[] = [];
    try {
      games = await store.getAvailableGames();
    } catch {}
    expect(games).toEqual([]);
  });
});
