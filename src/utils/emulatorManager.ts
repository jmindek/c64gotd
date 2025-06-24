// Handles emulator script/CSS injection, container setup, and lifecycle
import {
  EMULATOR_CONTAINER_ID,
  EMULATOR_SCRIPT_URL,
  EMULATOR_CSS_URL,
  EMULATOR_CSS_ID,
  EMULATOR_SCRIPT_ID,
  EMULATOR_CORE,
  EMULATOR_PATH_TO_DATA
} from './config';

export type EmulatorState = 'idle' | 'loading' | 'running' | 'error';

export class EmulatorManager {
  private static emulator: any = null;
  private static isEmulatorScriptLoading = false;
  private static emulatorLoadPromise: Promise<void> | null = null;

  /** Ensures the emulator container exists and is ready for use */
  public static ensureContainer(): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('Document is not available');
    }
    const container = document.getElementById(EMULATOR_CONTAINER_ID);
    if (!container) {
      throw new Error('Emulator container not found in DOM!');
    }
    container.innerHTML = '';
    container.style.display = 'block';
    return container;
  }

  /** Cleans up the emulator container */
  public static cleanupContainer(): void {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(EMULATOR_CONTAINER_ID);
    if (container) {
      container.innerHTML = '';
    }
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }

  /** Loads the emulator script from CDN if needed */
  public static async loadEmulatorScript(): Promise<void> {
    if (window.EJS_emulator) return;
    if (this.emulatorLoadPromise) return this.emulatorLoadPromise;
    this.isEmulatorScriptLoading = true;
    this.emulatorLoadPromise = new Promise<void>((resolve, reject) => {
      if (window.EJS_emulator) {
        this.isEmulatorScriptLoading = false;
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = EMULATOR_SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        this.isEmulatorScriptLoading = false;
        resolve();
      };
      script.onerror = (e) => {
        this.isEmulatorScriptLoading = false;
        this.emulatorLoadPromise = null;
        reject(new Error('Failed to load emulator script'));
      };
      const existingScript = document.getElementById(EMULATOR_SCRIPT_ID);
      if (existingScript) existingScript.remove();
      script.id = EMULATOR_SCRIPT_ID;
      document.head.appendChild(script);
    });
    return this.emulatorLoadPromise;
  }

  /** Stops the currently running emulator instance if any */
  public static async stopEmulator(): Promise<void> {
    try {
      if (this.emulator && typeof this.emulator.stop === 'function') {
        await Promise.resolve(this.emulator.stop());
      }
    } catch (error) {
      console.error('Error stopping emulator:', error);
      throw error;
    } finally {
      this.emulator = null;
      if (window.EJS_emulator) {
        try {
          delete window.EJS_emulator;
        } catch (e) {
          console.warn('Error cleaning up emulator state:', e);
        }
      }
      this.isEmulatorScriptLoading = false;
      this.emulatorLoadPromise = null;
      this.cleanupContainer();
    }
  }

  /** Initializes and starts the emulator with the provided game path */
  public static async initializeEmulator(gamePath: string, onStarted?: () => void): Promise<boolean> {
    if (!gamePath) throw new Error('No game path provided');
    await this.stopEmulator();
    this.cleanupContainer();
    // Wait for DOM ready
    if (document.readyState !== 'complete') {
      await new Promise<void>((resolve) => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', () => resolve(), { once: true });
      });
    }
    const container = this.ensureContainer();
    if (onStarted) onStarted();
    window.EJS_player = `#${EMULATOR_CONTAINER_ID}`;
    window.EJS_core = EMULATOR_CORE;
    window.EJS_gameUrl = gamePath;
    window.EJS_pathtodata = EMULATOR_PATH_TO_DATA;
    window.EJS_startOnLoaded = true;
    // Inject CSS if not present
    if (!document.getElementById(EMULATOR_CSS_ID)) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = EMULATOR_CSS_URL;
      cssLink.id = EMULATOR_CSS_ID;
      document.head.appendChild(cssLink);
    }
    await this.loadEmulatorScript();
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Emulator initialization timed out')), 50000);
      const checkReady = setInterval(() => {
        if (window.EJS_emulator) {
          clearTimeout(timeout);
          clearInterval(checkReady);
          this.emulator = window.EJS_emulator;
          resolve();
        }
      }, 100);
    });
    return true;
  }
}
