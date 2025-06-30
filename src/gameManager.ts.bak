import type { GameInfo } from './types/game';
import { getGames } from './api/games';

export class GameManager {
    private static readonly GAME_HISTORY_KEY = 'c64_gotd_history';
    private static readonly ONE_DAY = 24 * 60 * 60 * 1000;
    private static readonly TEST_ONE_MINUTE = 60 * 1000;

    async getAvailableGames(): Promise<GameInfo[]> {
        try {
            return await getGames();
        } catch (error) {
            console.error('Error getting available games:', error);
            return [];
        }
    }

    async getTodaysGame(): Promise<GameInfo | null> {
        const games = await this.getAvailableGames();
        if (games.length === 0) return null;

        const lastPlayed = localStorage.getItem(GameManager.GAME_HISTORY_KEY);
        const now = Date.now();
        // Check if we're in development mode by checking the URL
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const rotationTime = isDev ? GameManager.TEST_ONE_MINUTE : GameManager.ONE_DAY;

        let nextIndex = 0;

        interface LastPlayed { index: number; timestamp: number }

        if (lastPlayed) {
            try {
                const { index, timestamp } = JSON.parse(lastPlayed) as LastPlayed;
                if ((now - timestamp) < rotationTime) {
                    return games[index % games.length];
                }
                nextIndex = (index + 1) % games.length;
            } catch (error) {
                console.error('Error parsing game history:', error);
            }
        }

        localStorage.setItem(
            GameManager.GAME_HISTORY_KEY,
            JSON.stringify({ index: nextIndex, timestamp: now }),
        );

        return games[nextIndex];
    }

    async initializeEmulator(gamePath: string): Promise<void> {
        this.stopEmulator();
        
        return new Promise((resolve, reject) => {
            try {
                const container = this.ensureContainer();
                
                // Configure emulator
                /* eslint-disable-next-line */
                const EJS = (window as any).EJS;
                if (!EJS) {
                    throw new Error('EmulatorJS not loaded');
                }

                const config = {
                    core: 'vice_x64',
                    canvas: container,
                    dataPath: '/emulatorjs/data/',
                    emulatorPath: '/emulatorjs/emulators/',
                    gameUrl: gamePath,
                    biosUrl: '/emulatorjs/data/bios.bin',
                    system: 'c64',
                    autoload: true,
                    fullscreenOnTouch: true,
                    volume: 0.5,
                    onload: () => {
                        resolve();
                    },
                    onerror: (error: Error) => {
                        reject(error);
                    },
                    onpausestate: (paused: boolean) => {
                        console.log('Emulation', paused ? 'paused' : 'resumed');
                    },
                };

                // Initialize the emulator
                /* eslint-disable-next-line */
                EJS.start(config);
                
            } catch (error) {
                console.error('Error initializing emulator:', error);
            }
        });
    }

    stopEmulator(): void {
        /* eslint-disable-next-line */
        if ((window as any).EJS_emulator !== undefined) {
            try {
                /* eslint-disable-next-line */
                if (typeof (window as any).EJS_emulator.stop === 'function') {
                    /* eslint-disable-next-line */
                    (window as any).EJS_emulator.stop();
                }
                /* eslint-disable-next-line */
                if ((window as any).EJS_emulator !== undefined) {
                    /* eslint-disable-next-line */
                    delete (window as any).EJS_emulator;
                }
            } catch (error) {
                console.error('Error stopping emulator:', error);
            }
        }

        const container = document.getElementById('emulatorContainer');
        if (container) {
            container.innerHTML = '';
        }
    }

    private ensureContainer(): HTMLElement {
        let container = document.getElementById('emulatorContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'emulatorContainer';
            document.body.appendChild(container);
        }
        return container;
    }
}
