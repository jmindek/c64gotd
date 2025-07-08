import { LocalGameHistoryStore } from '../src/utils/gameHistoryStore';
import type { GameHistoryMap } from '../src/utils/gameHistoryManager';

describe('LocalGameHistoryStore', () => {
  let store: LocalGameHistoryStore;
  let originalLocalStorage: Storage;

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

  beforeAll(() => {
    // @ts-ignore
    originalLocalStorage = global.localStorage;
    // @ts-ignore
    global.localStorage = mockStorage;
  });

  afterAll(() => {
    // @ts-ignore
    global.localStorage = originalLocalStorage;
  });

  beforeEach(() => {
    store = new LocalGameHistoryStore();
    mockStorage.clear();
  });

  it('should load empty history if nothing is saved', () => {
    const history = store.load();
    expect(history).toEqual({});
  });

  it('should save and load game history', () => {
    const mockHistory: GameHistoryMap = {
      'game1': { lastPlayed: '2025-06-23', lastPlayedTime: 123456, playCount: 2 },
      'game2': { lastPlayed: '2025-06-22', lastPlayedTime: 654321, playCount: 1 }
    };
    store.save(mockHistory);
    const loaded = store.load();
    expect(loaded).toEqual(mockHistory);
  });

  it('should reset game history', () => {
    const mockHistory: GameHistoryMap = {
      'game1': { lastPlayed: '2025-06-23', lastPlayedTime: 123456, playCount: 2 }
    };
    store.save(mockHistory);
    store.reset();
    const loaded = store.load();
    expect(loaded).toEqual({});
  });

  it('should handle corrupted localStorage data gracefully', () => {
    // @ts-ignore
    global.localStorage.setItem('c64gotd_game_history', '{bad json');
    const loaded = store.load();
    expect(loaded).toEqual({});
  });
});
