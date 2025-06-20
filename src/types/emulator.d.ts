// Type definitions for the EmulatorJS global variables
declare global {
  interface Window {
    EJS_emulator?: {
      [key: string]: any;
      stop?: () => void;
    };
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
    gc?: () => void;
  }
}

export {};
