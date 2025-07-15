// Centralized configuration and constants for the emulator/game system

export const EMULATOR_CONTAINER_ID = 'emulator-container';
export const EMULATOR_SCRIPT_URL = 'https://cdn.emulatorjs.org/stable/data/loader.js';
export const EMULATOR_CSS_URL = 'https://cdn.emulatorjs.org/stable/data/emulator.min.css';
export const EMULATOR_CSS_ID = 'emulatorjs-css';
export const EMULATOR_SCRIPT_ID = 'emulatorjs-script';
export const EMULATOR_CORE = 'vice_x64';
export const EMULATOR_PATH_TO_DATA = 'https://cdn.emulatorjs.org/stable/data/';
export const GAME_HISTORY_KEY = 'c64gotd_game_history';
export const GAME_LIST_KEY = 'c64_games';
export const NOT_FOUND_GAME_NAME = 'NO GAMES FOUND :-(';

// Default control mappings for C64 emulator
// EmulatorJS expects format: { 0: { 0: { 'value': 'key', 'value2': 'BUTTON' } } }
export const DEFAULT_CONTROLS = {
  0: { // Player 1 controls (number, not string)
    // D-pad mappings
    0: {
      'value': 'space',
      'value2': 'BUTTON_2'
    },
    1: {
        'value': 's',
        'value2': 'BUTTON_4'
    },
    2: {
        'value': 'v',
        'value2': 'SELECT'
    },
    3: {
        'value': 'enter',
        'value2': 'START'
    },
    4: {
        'value': 'up arrow',
        'value2': 'DPAD_UP'
    },
    5: {
        'value': 'down arrow',
        'value2': 'DPAD_DOWN'
    },
    6: {
        'value': 'left arrow',
        'value2': 'DPAD_LEFT'
    },
    7: {
        'value': 'right arrow',
        'value2': 'DPAD_RIGHT'
    },
    8: {
        'value': 'z',
        'value2': 'BUTTON_1'
    },
    9: {
        'value': 'a',
        'value2': 'BUTTON_3'
    },
    10: {
        'value': 'q',
        'value2': 'LEFT_TOP_SHOULDER'
    },
    11: {
        'value': 'e',
        'value2': 'RIGHT_TOP_SHOULDER'
    },
    12: {
        'value': 'tab',
        'value2': 'LEFT_BOTTOM_SHOULDER'
    },
    13: {
        'value': 'r',
        'value2': 'RIGHT_BOTTOM_SHOULDER'
    },
  },
  1: {
    0: {
      'value': 'space',
      'value2': 'BUTTON_2'
    },
    1: {
      'value': 's',
      'value2': 'BUTTON_4'
    },
    2: {
      'value': 'v',
      'value2': 'SELECT'
    },
    3: {
      'value': 'enter',
      'value2': 'START'
    },
    4: {
      'value': 'up arrow',
      'value2': 'DPAD_UP'
    },
    5: {
      'value': 'down arrow',
      'value2': 'DPAD_DOWN'
    },
    6: {
      'value': 'left arrow',
      'value2': 'DPAD_LEFT'
    },
    7: {
      'value': 'right arrow',
      'value2': 'DPAD_RIGHT'
    },
    8: {
      'value': 'z',
      'value2': 'BUTTON_1'
    },
    9: {
      'value': 'a',
      'value2': 'BUTTON_3'
    },
    10: {
      'value': 'q',
      'value2': 'LEFT_TOP_SHOULDER'
    },
    11: {
      'value': 'e',
      'value2': 'RIGHT_TOP_SHOULDER'
    },
    12: {
      'value': 'tab',
      'value2': 'LEFT_BOTTOM_SHOULDER'
    },
    13: {
      'value': 'r',
      'value2': 'RIGHT_BOTTOM_SHOULDER'
    },
  },
  2: {},
  3: {}
};

export const DEFAULT_OPTIONS = {
  'vice_warp_boost': 'enabled',                 // Enable warp mode for disk operations
  'vice_autoloadwarp': 'enabled',               // Enable autoload warp
  'input_autodetect_enable': 'true',            // Enable input autodetection
  'input_keyboard_gamepad_mapping_type': '1',   // Enable keyboard to gamepad mapping
};

export const DEFAULT_BUTTONS = {
    playPause: true,
    restart: true,
    mute: true,
    settings: true,
    fullscreen: true,
    saveState: false,
    loadState: false,
    screenRecord: false,
    gamepad: true,
    cheat: false,
    volume: true,
    saveSavFiles: false,
    loadSavFiles: false,
    quickSave: false,
    quickLoad: false,
    screenshot: false,
    cacheManager: false,
    exitEmulation: true
};
