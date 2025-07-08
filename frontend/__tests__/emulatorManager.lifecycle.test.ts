import { EmulatorManager } from '../src/utils/emulatorManager';

describe('EmulatorManager Lifecycle', () => {
  let originalWindow: any;
  let originalDocument: any;
  let container: HTMLElement;

  beforeEach(() => {
    // Mock DOM and window globals
    originalWindow = { ...window };
    originalDocument = { ...document };
    container = document.createElement('div');
    container.id = 'emulator-container';
    document.body.appendChild(container);
    // Reset emulator-related globals
    // @ts-ignore
    delete window.EJS_emulator;
    // @ts-ignore
    delete window.EJS_player;
    // @ts-ignore
    delete window.EJS_core;
    // @ts-ignore
    delete window.EJS_gameUrl;
    // @ts-ignore
    delete window.EJS_pathtodata;
    // @ts-ignore
    delete window.EJS_startOnLoaded;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    // Restore window/document if needed
    window.EJS_emulator = undefined;
    window.EJS_player = undefined;
    window.EJS_core = undefined;
    window.EJS_gameUrl = undefined;
    window.EJS_pathtodata = undefined;
    window.EJS_startOnLoaded = undefined;
  });

  it('loadEmulatorScript resolves if EJS_emulator exists', async () => {
    // @ts-ignore
    window.EJS_emulator = {};
    await expect(EmulatorManager.loadEmulatorScript()).resolves.toBeUndefined();
  });

  it('stopEmulator cleans up emulator and container', async () => {
    // @ts-ignore
    EmulatorManager['emulator'] = { stop: jest.fn().mockResolvedValue(undefined) };
    // @ts-ignore
    window.EJS_emulator = {};
    const cleanupSpy = jest.spyOn(EmulatorManager, 'cleanupContainer');
    await EmulatorManager.stopEmulator();
    expect(EmulatorManager['emulator']).toBeNull();
    expect(window.EJS_emulator).toBeUndefined();
    expect(cleanupSpy).toHaveBeenCalled();
  });

  // Skipped: Cannot reliably test DOM readiness (document.readyState) in Jest/jsdom
  it.skip('initializeEmulator sets up window globals and injects CSS', async () => {
    // jsdom does not allow document.readyState to be changed after initialization.
    // This behavior is covered by browser/integration tests.
    // Remove any existing CSS
    const css = document.getElementById('emulator-css');
    if (css) css.remove();
    // @ts-ignore
    window.EJS_emulator = {};
    const onStarted = jest.fn();
    await EmulatorManager.initializeEmulator('/test/path.d64', onStarted);
    expect(window.EJS_player).toBe('#emulator-container');
    expect(window.EJS_core).toBeDefined();
    expect(window.EJS_gameUrl).toBe('/test/path.d64');
    expect(window.EJS_pathtodata).toBeDefined();
    expect(window.EJS_startOnLoaded).toBe(true);
    expect(document.getElementById('emulator-css')).not.toBeNull();
    expect(onStarted).toHaveBeenCalled();
  });

  it('throws if initializeEmulator called with no gamePath', async () => {
    await expect(EmulatorManager.initializeEmulator('')).rejects.toThrow('No game path provided');
  });
});
