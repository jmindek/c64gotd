import { GameManager } from './utils/gameManager';
import type { GameInfo } from './types/game';
import { GAMES } from './api/games';

export class App {
  private currentGame: GameInfo | null = null;
  private startButton: HTMLButtonElement | null = null;
  private errorDisplay: HTMLElement | null = null;
  private gameTitleElement: HTMLElement | null = null;
  private gameMetaElement: HTMLElement | null = null;

  async initialize() {
    import('./app/globals.css');

    this.cacheElements();
    this.setupEventListeners();
    const currentGamesTitle = document.getElementById('currentGameTitle');
    this.currentGame = await GameManager.getTodaysGame();
    if (currentGamesTitle && this.currentGame) {
      currentGamesTitle.textContent = this.currentGame.name;

      if (GAMES.length > 0) {
        const gameInfo = GAMES.find(g => g.name === this.currentGame?.name);
        if (gameInfo) {
          this.updateGameInfo(gameInfo);
        }
      } else {
        this.showError('No games available');
      }
    }
  }

  private cacheElements() {
    this.startButton = document.getElementById('startButton') as HTMLButtonElement;
    this.errorDisplay = document.getElementById('errorDisplay');
    this.gameTitleElement = document.getElementById('gameTitle');
    this.gameMetaElement = document.getElementById('gameMeta');
  }

  private setupEventListeners() {
    if (this.startButton) {
      this.startButton.addEventListener('click', () => { void this.startGame(); });
    }
  }

  private updateGameInfo(game: GameInfo) {
    if (this.gameTitleElement) {
      this.gameTitleElement.textContent = game.name;
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

    // Hide startButton and prefix game title with 'Loading' in currentGameTitle
    if (this.startButton) {
      this.startButton.style.display = 'none';
    }
    const currentGameTitle = document.getElementById('currentGameTitle');
    if (currentGameTitle) {
      currentGameTitle.textContent = `Playing ${this.currentGame.name}`;
    }

    try {
      await GameManager.initializeEmulator(this.currentGame.d64Path);
    } catch (error) {
      console.error('Error starting game:', error);
      this.showError('Failed to start game. Please try again.');
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
}
