import { z } from "zod";
import { playerSchema, archivesSchema, monthlyGamesSchema, ChesscomPlayer, ChesscomGame } from "../validation/chesscom";

const USER_AGENT = process.env.CHESSCOM_USER_AGENT || "ChessAnalyzer-Local/1.0 (mailto:admin@chessanalyzer.local)";

const headers = {
  "User-Agent": USER_AGENT,
  "Accept": "application/json",
};

export class ChesscomError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ChesscomError";
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { 
    headers,
    cache: 'no-store',
    next: { revalidate: 0 }
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new ChesscomError("Resource not found", 404);
    }
    if (response.status === 429) {
      throw new ChesscomError("Rate limited by Chess.com", 429);
    }
    throw new ChesscomError(`Chess.com API error: ${response.statusText}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function getPlayer(username: string): Promise<ChesscomPlayer> {
  try {
    const data = await fetchJson(`https://api.chess.com/pub/player/${username.toLowerCase()}`);
    return playerSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ChesscomError("Invalid data received from Chess.com API");
    }
    throw error;
  }
}

export async function getArchives(username: string): Promise<string[]> {
  try {
    const data = await fetchJson<{ archives: string[] }>(`https://api.chess.com/pub/player/${username.toLowerCase()}/games/archives`);
    return archivesSchema.parse(data).archives;
  } catch (error) {
    throw error;
  }
}

export async function getGamesFromArchive(url: string): Promise<ChesscomGame[]> {
  try {
    const data = await fetchJson<{ games: any[] }>(url);
    return monthlyGamesSchema.parse(data).games;
  } catch (error) {
    throw error;
  }
}

export async function getRecentGames(username: string, count: number = 20): Promise<ChesscomGame[]> {
  const archives = await getArchives(username);
  if (archives.length === 0) return [];

  let games: ChesscomGame[] = [];
  
  // Iterate backwards through archives to get the most recent games
  for (let i = archives.length - 1; i >= 0; i--) {
    const archiveUrl = archives[i];
    const monthlyGames = await getGamesFromArchive(archiveUrl);
    
    // Sort games in the month descending by end_time (most recent first)
    const sortedGames = monthlyGames.sort((a, b) => b.end_time - a.end_time);
    games = games.concat(sortedGames);
    
    if (games.length >= count) {
      break;
    }
  }

  return games.slice(0, count);
}
