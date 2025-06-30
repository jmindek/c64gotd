import { GameManager } from './utils/gameManager';
import type { GameInfo } from './types/game';
import { NOT_FOUND_GAME_NAME } from './utils/config';

import { getOrCreateUserId } from './utils/user';

export class App {
  private currentGame: GameInfo = {'id': -1, 'name': '', 'd64Path': '', 'thumbnailPath': ''};
  private startButton: HTMLButtonElement | null = null;
  private errorDisplay: HTMLElement | null = null;
  private gameTitleElement: HTMLElement | null = null;
  private gameMetaElement: HTMLElement | null = null;
  private userId = '';

  async initialize() {
    import('./app/globals.css');

    // Assign or fetch persistent user ID
    this.userId = getOrCreateUserId();

    this.cacheElements();
    this.setupEventListeners();
    const currentGamesTitle = document.getElementById('currentGameTitle');
    this.currentGame = await GameManager.getTodaysGame();
    if (this.currentGame.name === NOT_FOUND_GAME_NAME) {
      this.showError(this.currentGame.description || 'Could not load game of the day.');
    }
    if (currentGamesTitle) {
      currentGamesTitle.textContent = this.currentGame.name;
      this.updateGameInfo(this.currentGame);
    }

    // --- STAR RATING FEATURE ---
    const starContainer = document.getElementById('starRating');
    if (starContainer && this.currentGame.id) {
      // Dynamically import to avoid circular deps
      const { StarRating } = await import('./components/StarRating');
      console.log('Current game id:', this.currentGame.id);
      new StarRating(starContainer, { gameId: this.currentGame.id, userId: this.userId });
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
    if (this.currentGame.name === NOT_FOUND_GAME_NAME) {
      this.showError('No game found to start.');
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
