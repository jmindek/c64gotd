import { GameManager } from '../src/utils/gameManager';
import { DefaultGameHistoryManager } from '../src/utils/gameHistoryManager';
import { DefaultGameCatalog } from '../src/utils/gameCatalog';
import { EmulatorManager } from '../src/utils/emulatorManager';
import type { GameInfo } from '../src/types/game';

describe('GameManager Integration', () => {
  let originalLocalStorage: Storage;
  let originalGames: GameInfo[];
  let container: HTMLElement;

  beforeEach(() => {
    // Mock localStorage
    const mockStorage = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
      };
    })();
    // @ts-ignore
    originalLocalStorage = global.localStorage;
    // @ts-ignore
    global.localStorage = mockStorage;

    // Mock game list
    originalGames = [
      { id: 'g1', name: 'Game1', path: '/g1.d64', description: 'desc', year: 1985 },
      { id: 'g2', name: 'Game2', path: '/g2.d64', description: 'desc2', year: 1986 }
    ];
    jest.spyOn(DefaultGameCatalog, 'getAvailableGames').mockResolvedValue(originalGames);

    // Mock emulator container
    container = document.createElement('div');
    container.id = 'emulator-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // @ts-ignore
    global.localStorage = originalLocalStorage;
    jest.restoreAllMocks();
    document.body.innerHTML = '';
    DefaultGameHistoryManager.reset();
  });

  it('gets available games from the catalog', async () => {
    const games = await GameManager.getAvailableGames();
    expect(games).toEqual(originalGames);
  });

  it('ensures and cleans up emulator container', () => {
    const ensured = GameManager.ensureContainer();
    expect(ensured).toBe(container);
    ensured.innerHTML = 'test';
    GameManager.cleanupContainer();
    expect(ensured.innerHTML).toBe('');
  });

  it('resets game history', () => {
    DefaultGameHistoryManager.updateGame('g1', '2025-06-23', Date.now());
    expect(Object.keys(DefaultGameHistoryManager.getHistory())).toContain('g1');
    GameManager.resetHistory();
    expect(DefaultGameHistoryManager.getHistory()).toEqual({});
  });

  // Emulator lifecycle and selectGame logic could be tested with more advanced mocks/stubs if needed
});
