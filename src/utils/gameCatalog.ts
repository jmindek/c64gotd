// Handles fetching and returning available games
import type { GameInfo } from '@/types/game';

export class GameCatalog {
  /**
   * Get all available games from the imported list
   * @returns Promise resolving to array of GameInfo
   */
  public static async getAvailableGames(): Promise<GameInfo[]> {
    try {
      const { GAMES } = await import('@/api/games');
      if (!GAMES || GAMES.length === 0) {
        console.warn('No games found in the games list');
        return [];
      }
      return GAMES;
    } catch (error) {
      console.error('Error getting available games:', error);
      return [];
    }
  }
}
