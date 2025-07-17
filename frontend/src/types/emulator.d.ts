// Type definitions for the EmulatorJS global variables
import type { EmulatorInstance } from './emulator-shared';
declare global {
  interface Window {
    EJS_emulator?: EmulatorInstance;
    EJS_player?: string;
    EJS_gameUrl?: string;
    EJS_core?: string;
    EJS_pathtodata?: string;
    EJS_emulatorPath?: string;
    EJS_startOnLoaded?: boolean;
    EJS_useWebGL?: boolean;
    EJS_volume?: number;
    EJS_ready?: () => void;
    EJS_onGameStart?: () => void;
    EJS_onLoadError?: (error: Error) => void;
    EJS_defaultControls?: Record<number, Record<number, {
      value: string;
      value2: string;
    }>>;
    EJS_defaultOptions?: Record<string, string>;
    EJS_DEBUG_XX?: boolean;
    gc?: () => void;
  }
}

export {};
