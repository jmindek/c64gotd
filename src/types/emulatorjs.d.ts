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
  EJS_emulator?: {
    stop: () => void;
    [key: string]: any;
  };
  EJS?: new (elementId: string, options: any) => any;
}

declare const window: Window;
