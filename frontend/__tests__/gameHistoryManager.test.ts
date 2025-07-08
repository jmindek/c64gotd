import { GameHistoryManager } from '../src/utils/gameHistoryManager';
import type { GameHistoryMap } from '../src/utils/gameHistoryManager';

class MockStore {
  private data: GameHistoryMap = {};
  load = jest.fn(() => ({ ...this.data }));
  save = jest.fn((history: GameHistoryMap) => { this.data = { ...history }; });
  reset = jest.fn(() => { this.data = {}; });
}

describe('GameHistoryManager', () => {
  let manager: GameHistoryManager;
  let store: MockStore;

  beforeEach(() => {
    store = new MockStore();
    manager = new GameHistoryManager(store);
  });

  it('loads from the store', () => {
    store.data = { foo: { lastPlayed: 'today', lastPlayedTime: 1, playCount: 2 } };
    const result = manager.load();
    expect(result).toEqual(store.data);
    expect(manager.getHistory()).toEqual(store.data);
    expect(store.load).toHaveBeenCalled();
  });

  it('saves to the store', () => {
    manager.load();
    manager.updateGame('bar', '2025-06-23', 123);
    expect(store.save).toHaveBeenCalled();
    expect(manager.getHistory()['bar']).toEqual({ lastPlayed: '2025-06-23', lastPlayedTime: 123, playCount: 1 });
  });

  it('increments playCount on repeated update', () => {
    manager.load();
    manager.updateGame('baz', '2025-06-23', 100);
    manager.updateGame('baz', '2025-06-24', 200);
    expect(manager.getHistory()['baz'].playCount).toBe(2);
    expect(manager.getHistory()['baz'].lastPlayed).toBe('2025-06-24');
    expect(manager.getHistory()['baz'].lastPlayedTime).toBe(200);
  });

  it('resets history', () => {
    manager.load();
    manager.updateGame('foo', '2025-06-23', 111);
    manager.reset();
    expect(manager.getHistory()).toEqual({});
    expect(store.reset).toHaveBeenCalled();
  });
});
