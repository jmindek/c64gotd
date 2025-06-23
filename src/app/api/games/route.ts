import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const gamesDir = path.join(process.cwd(), 'public/games');
    const files = await fs.readdir(gamesDir);
    
    const games = files
      .filter(file => file.endsWith('.d64'))
      .map(file => {
        const name = path.basename(file, '.d64');
        const thumbnailPath = `/games/thumbnails/${name.toLowerCase()}.png`;
        return {
          name,
          d64Path: `/games/${file}`,
          thumbnailPath: fs.access(path.join(process.cwd(), 'public', thumbnailPath))
            .then(() => thumbnailPath)
            .catch(() => '/games/thumbnails/default.png')
        };
      });

    // Wait for all thumbnail checks to complete
    const gamesWithThumbnails = await Promise.all(
      games.map(async game => ({
        ...game,
        thumbnailPath: await game.thumbnailPath
      }))
    );

    return NextResponse.json(gamesWithThumbnails);
  } catch (error) {
    console.error('Error reading games directory:', error);
    return NextResponse.json(
      { error: 'Failed to load games' },
      { status: 500 }
    );
  }
}
