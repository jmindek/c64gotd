import { GameInfo } from '../types/game';

export const GAMES: GameInfo[] = [
  {
    name: 'Blockheads',
    d64Path: '/games/Blockheads.d64',
    thumbnailPath: '/games/thumbnails/Blockheads.png',
    description: 'A classic C64 platformer game where you control a character navigating through various levels.',
    year: 1986,
    publisher: 'Ocean Software',
    genre: 'Platform',
    players: '1'
  },
  {
    name: 'Legacy of the Lost Spell',
    d64Path: '/games/Legacy of the Lost Spell Preview + [BLZ].d64',
    thumbnailPath: '/games/thumbnails/Blockheads.png', // Placeholder - add actual thumbnail
    description: 'A preview of an upcoming C64 RPG adventure game with magic and exploration.',
    year: 2023,
    publisher: 'Indie Developer',
    genre: 'RPG',
    players: '1'
  },
  {
    name: 'Luna',
    d64Path: '/games/Luna.d64',
    thumbnailPath: '/games/thumbnails/Blockheads.png', // Placeholder - add actual thumbnail
    description: 'A space adventure game with puzzle elements set on the moon.',
    year: 2022,
    publisher: 'Indie Developer',
    genre: 'Adventure',
    players: '1'
  },
  {
    name: 'Showdown',
    d64Path: '/games/showdown.d64',
    thumbnailPath: '/games/thumbnails/Blockheads.png', // Placeholder - add actual thumbnail
    description: 'A fast-paced action game with intense battles and challenges.',
    year: 2023,
    publisher: 'Indie Developer',
    genre: 'Action',
    players: '1-2'
  }
];

export async function getGames(): Promise<GameInfo[]> {
  // In a real app, this would fetch from a server
  return Promise.resolve(GAMES);
}
