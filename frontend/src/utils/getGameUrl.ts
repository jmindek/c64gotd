// Utility to construct the full URL for a game asset based on env and relative path
export function getGameUrl(d64Path: string): string {
  const base = import.meta.env.VITE_GAMES_BASE_URL as string;
  let finalUrl: string;
  
  // Remove leading /games if base already ends with /games
  if (base.endsWith('/games') && d64Path.startsWith('/games')) {
    const pathWithoutGames = d64Path.slice('/games'.length);
    // Encode the filename part only, preserve the path structure
    const encodedPath = pathWithoutGames.split('/').map(part => encodeURIComponent(part)).join('/');
    finalUrl = base + encodedPath;
  } else {
    // Otherwise, join with a slash and encode
    const cleanPath = d64Path.startsWith('/') ? d64Path.slice(1) : d64Path;
    const encodedPath = cleanPath.split('/').map(part => encodeURIComponent(part)).join('/');
    finalUrl = base.replace(/\/$/, '') + '/' + encodedPath;
  }
  
  return finalUrl;
}
