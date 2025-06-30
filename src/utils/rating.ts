// Utility functions for game ratings API

export interface RatingResponse {
  rating: number;
  game_id: number;
  user_id: string;
}

export interface AverageRatingResponse {
  average: number;
  game_id: number;
}

const API_BASE = '/api/games/';

export async function fetchAverageRating(gameId: number): Promise<AverageRatingResponse> {
  try {
    const url = `${API_BASE}${encodeURIComponent(gameId)}/average_rating`;
    console.log('[fetchAverageRating] GET', url);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch rating');
    return await resp.json() as AverageRatingResponse;
  } catch (e) {
    return { average: 0, game_id: gameId };
  }
}

export async function fetchRating(gameId: number, userId: string): Promise<RatingResponse> {
  try {
    const url = `${API_BASE}${encodeURIComponent(gameId)}/rating?user_id=${encodeURIComponent(userId)}`;
    console.log('[fetchRating] GET', url);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch rating');
    return await resp.json() as RatingResponse;
  } catch (e) {
    return { rating: 0, game_id: gameId, user_id: userId };
  }
}

export async function postRating(gameId: number, userId: string, rating: number): Promise<RatingResponse> {
  try {
    const url = `${API_BASE}${encodeURIComponent(gameId)}/rating`;
    const body = JSON.stringify({ user_id: userId, rating: rating, game_id: gameId });
    console.log('[postRating] POST', url, 'body:', body);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!resp.ok) throw new Error('Failed to post rating');
    return await resp.json() as RatingResponse;
  } catch (e) {
    return { rating: 0, game_id: gameId, user_id: userId };
  }
}
