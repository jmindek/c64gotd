interface Window {
  // EmulatorJS globals
  EJS_DEBUG_XX?: boolean;
  EJS_player?: string;
  EJS_gameUrl?: string;
  EJS_core?: string;
  EJS_pathtodata?: string;
  EJS_corePath?: string;
  EJS_emulatorPath?: string;
  EJS_gameName?: string;
  EJS_color?: string;
  EJS_volume?: number;
  EJS_lightgun?: boolean;
  EJS_useWebGL?: boolean;
  EJS_useWasm?: boolean;
  EJS_BIOS?: string;
  EJS_ready?: () => void;
  EJS_wasmPath?: string;
  EJS_wasmBinaryFile?: string;
  EJS_wasmBinary?: ArrayBuffer;
  EJS_wasmMemory?: WebAssembly.Memory;
  EJS_buttons?: Record<string, {
      type: 'button' | 'key';
      button?: number;
      key?: string;
      description: string;
    }>;
  EJS_startOnLoaded?: boolean;
  EJS_emulator?: import('./emulator-shared').EmulatorInstance;
  EJS?: new (elementId: string, options: any) => any;
  EJS_coreModule?: any;
  EJS_onStart?: () => void;
  EJS_onLoad?: () => void;
  EJS_onGameStart?: () => void;
  EJS_onGameEnd?: () => void;
  EJS_onSaveState?: () => void;
  EJS_onLoadState?: () => void;
  EJS_onPause?: () => void;
  EJS_onResume?: () => void;
  EJS_onFullscreen?: () => void;
  EJS_onExitFullscreen?: () => void;
  EJS_onError?: (error: Error) => void;
}

declare const window: Window;
