/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_GAMES_BASE_URL: string; // S3 asset base URL for games
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend the Window interface
declare interface Window {
  EJS_player: string;
  EJS_gameUrl: string;
  EJS_core: string;
  EJS_pathtodata: string;
  EJS_emulatorPath: string;
  EJS_startOnLoaded: boolean;
  EJS_useWebGL: boolean;
  EJS_volume: number;
  EJS_ready: () => void;
  EJS_emulator: any;
}

export {}; // This file needs to be a module
