// StarRating.ts - Modular star rating logic for C64 Game of the Day
import { fetchAverageRating, fetchRating, postRating } from '../utils/rating';

export interface StarRatingOptions {
  gameId: number;
  userId: string;
  apiBase?: string; // e.g. '/api/games/'
  onUpdate?: (rating: number, average: number) => void;
}

export class StarRating {
  private container: HTMLElement;
  private gameId: number;
  private userId: string;
  private apiBase: string;
  private userRating = 0;
  private onUpdate?: (rating: number, average: number) => void;

  constructor(container: HTMLElement, options: StarRatingOptions) {
    this.container = container;
    this.gameId = options.gameId;
    this.apiBase = options.apiBase || '/api/games/';
    this.onUpdate = options.onUpdate;
    this.userId = options.userId;
    this.render();
    void this.init();
  }

  private render() {
    // Render 5 stars
    this.container.innerHTML = `
      <div class="star-rating">
        <span class="star" data-value="1">&#9733;</span>
        <span class="star" data-value="2">&#9733;</span>
        <span class="star" data-value="3">&#9733;</span>
        <span class="star" data-value="4">&#9733;</span>
        <span class="star" data-value="5">&#9733;</span>
      </div>
    `;
  }

  private updateStarsUI(rating: number) {
    const stars = this.container.querySelectorAll<HTMLSpanElement>('.star-rating .star');
    stars.forEach(star => {
      star.classList.remove('selected');
    });
    stars.forEach(star => {
      const val = parseInt(star.dataset.value || '0', 10);
      if (val <= rating) {
        star.classList.add('selected');
      }
    });
  }

  private updateAverageUI(average: number) {
    const avgElem = this.container.querySelector<HTMLSpanElement>('#averageRating');
    if (avgElem) {
      avgElem.textContent = `Average rating: ${average.toFixed(2)} stars`;
    }
  }

  private async init() {
    // Fetch and display current ratings
    console.log('Fetching ratings for game id:', this.gameId + ' and user id:', this.userId);
    const data = await fetchRating(this.gameId, this.userId);
    this.userRating = data.rating;
    const avgData = await fetchAverageRating(this.gameId);
    this.updateStarsUI(this.userRating);
    this.updateAverageUI(avgData.average);
    if (this.onUpdate) this.onUpdate(this.userRating, avgData.average);

    // Add click/hover listeners
    const stars = this.container.querySelectorAll<HTMLSpanElement>('.star-rating .star');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        void (async () => {
          const value = parseInt(star.dataset.value || '0', 10);
          if (value === this.userRating) {
            this.userRating = value - 1;
          } else {
            this.userRating = value;
          }
          this.updateStarsUI(this.userRating);
          await postRating(this.gameId, this.userId, this.userRating);
          this.updateAverageUI(avgData.average);
          if (this.onUpdate) this.onUpdate(this.userRating, avgData.average);
        })();
      });
      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.dataset.value || '0', 10);
        this.updateStarsUI(value);
      });
      star.addEventListener('mouseleave', () => {
        this.updateStarsUI(this.userRating);
      });
    });
  }
}
