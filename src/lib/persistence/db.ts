import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ReviewSummary } from '../review/accuracy';
import { CoachingTag } from '../review/tags';

export interface SavedGame {
  id: string; // FEN or PGN hash
  pgn: string;
  summary: ReviewSummary;
  date: number;
  playerColor: "w" | "b";
  username?: string;
}

export interface SavedMistake {
  id: string;
  gameId: string;
  fenBefore: string;
  playedMove: string;
  bestMove: string;
  tags: CoachingTag[];
  date: number;
}

interface ChessCoachDB extends DBSchema {
  games: {
    key: string;
    value: SavedGame;
    indexes: { "by-date": number; "by-username": string };
  };
  mistakes: {
    key: string;
    value: SavedMistake;
    indexes: { "by-date": number };
  };
}

let dbPromise: Promise<IDBPDatabase<ChessCoachDB>> | null = null;

export function getDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB<ChessCoachDB>("chesscoach", 1, {
      upgrade(db) {
        const gameStore = db.createObjectStore("games", { keyPath: "id" });
        gameStore.createIndex("by-date", "date");
        gameStore.createIndex("by-username", "username");

        const mistakeStore = db.createObjectStore("mistakes", { keyPath: "id" });
        mistakeStore.createIndex("by-date", "date");
      },
    });
  }
  return dbPromise;
}

export async function saveGameResult(game: SavedGame) {
  const db = await getDB();
  if (db) {
    await db.put("games", game);
  }
}

export async function getRecentSavedGames() {
  const db = await getDB();
  if (!db) return [];
  const games = await db.getAllFromIndex("games", "by-date");
  return games.reverse();
}

export async function saveMistake(mistake: SavedMistake) {
  const db = await getDB();
  if (db) {
    await db.put("mistakes", mistake);
  }
}

export async function getSavedMistakes() {
  const db = await getDB();
  if (!db) return [];
  const mistakes = await db.getAllFromIndex("mistakes", "by-date");
  return mistakes.reverse();
}
