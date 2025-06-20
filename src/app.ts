import { GameManager } from './utils/gameManager';
import { GameInfo } from './types/game';

export class App {
    private gameManager: GameManager;
    private currentGame: GameInfo | null = null;
    private startButton: HTMLButtonElement | null = null;
    private loadingIndicator: HTMLElement | null = null;
    private errorDisplay: HTMLElement | null = null;
    private gameTitleElement: HTMLElement | null = null;
    private gameContainer: HTMLElement | null = null;
    private gameMetaElement: HTMLElement | null = null;
    private gameOverlay: HTMLElement | null = null;

    constructor() {
        this.gameManager = new GameManager();
        
        // Make GameManager available globally for debugging
        if (typeof window !== 'undefined') {
            (window as any).GameManager = GameManager;
        }
    }

    async initialize() {
        import('./app/globals.css');

        this.cacheElements();
        await this.setupEventListeners();
        await this.loadGameOfTheDay();
    }

    private cacheElements() {
        this.startButton = document.getElementById('startButton') as HTMLButtonElement;
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorDisplay = document.getElementById('errorDisplay');
        this.gameTitleElement = document.getElementById('gameTitle');
        this.gameContainer = document.getElementById('emulatorContainer');
        this.gameMetaElement = document.getElementById('gameMeta');
        this.gameOverlay = document.getElementById('gameOverlay');
    }

    private async setupEventListeners() {
        if (this.startButton) {
            this.startButton.addEventListener('click', () => this.startGame());
        }
    }

    private async loadGameOfTheDay() {
        try {
            this.showLoading(true, 'Loading game...');
            const game = await GameManager.getTodaysGame();
            
            if (game) {
                this.currentGame = game;
                this.updateGameInfo(this.currentGame);
            } else {
                this.showError('No games available');
            }
        } catch (error) {
            console.error('Error loading game:', error);
            this.showError('Failed to load game');
        } finally {
            this.showLoading(false);
        }
    }

    private updateGameInfo(game: GameInfo) {
        if (this.gameTitleElement) {
            this.gameTitleElement.textContent = game.name;
        }
        
        const descriptionElement = this.gameOverlay?.querySelector('p');
        if (descriptionElement) {
            descriptionElement.textContent = game.description || 'A classic Commodore 64 experience';
        }
        
        if (this.gameMetaElement) {
            const meta: string[] = [];
            
            // Safely add each property if it exists
            if (game.year) meta.push(`Year: ${game.year}`);
            if (game.publisher) meta.push(`Publisher: ${game.publisher}`);
            if (game.genre) meta.push(`Genre: ${game.genre}`);
            if (game.players) meta.push(`Players: ${game.players}`);
            
            this.gameMetaElement.textContent = meta.join(' • ');
        }
    }

    private async startGame() {
        if (!this.currentGame) {
            this.showError('No game selected');
            return;
        }

        try {
            this.showLoading(true, 'Starting game...');
            const success = await GameManager.initializeEmulator(this.currentGame.d64Path);
            this.hideOverlay();
        } catch (error) {
            console.error('Error starting game:', error);
            this.showError('Failed to start game. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    private showLoading(show: boolean, message?: string) {
        if (this.loadingIndicator) {
            const loadingText = this.loadingIndicator.querySelector('p');
            if (loadingText && message) {
                loadingText.textContent = message;
            }
            
            if (show) {
                this.loadingIndicator?.classList.remove('hidden');
            } else {
                this.loadingIndicator?.classList.add('hidden');
            }
        }
    }

    private showError(message: string) {
        if (this.errorDisplay) {
            this.errorDisplay.textContent = message;
            this.errorDisplay.classList.remove('hidden');
            
            // Hide error after 5 seconds
            setTimeout(() => {
                this.errorDisplay?.classList.add('hidden');
            }, 5000);
        }
    }

    private hideOverlay() {
        if (this.gameOverlay) {
            this.gameOverlay.style.display = 'none';
        }
    }
}
