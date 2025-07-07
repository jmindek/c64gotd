// Utility to construct the full URL for a game asset based on env and relative path
export function getGameUrl(d64Path: string): string {
  const base = import.meta.env.VITE_GAMES_BASE_URL;
  let finalUrl: string;
  // Remove leading /games if base already ends with /games
  if (base.endsWith('/games') && d64Path.startsWith('/games')) {
    finalUrl = base + d64Path.slice('/games'.length);
  } else {
    // Otherwise, join with a slash
    finalUrl = base.replace(/\/$/, '') + (d64Path.startsWith('/') ? d64Path : '/' + d64Path);
  }
  
  return finalUrl;
}
