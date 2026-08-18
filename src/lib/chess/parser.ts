import { Chess } from "chess.js";

export interface GameMove {
  ply: number;
  san: string;
  lan: string;
  fenBefore: string;
  fenAfter: string;
  color: "w" | "b";
  piece: string;
}

export interface ParsedGame {
  headers: Record<string, string>;
  moves: GameMove[];
  result: string;
}

export function parseGameFromPgn(pgn: string): ParsedGame {
  const chess = new Chess();
  
  try {
    chess.loadPgn(pgn);
  } catch (error) {
    throw new Error("Invalid PGN provided");
  }

  const history = chess.history({ verbose: true });
  const moves: GameMove[] = [];
  
  // Create a new instance to replay and get FENs
  const replay = new Chess();
  
  for (let i = 0; i < history.length; i++) {
    const move = history[i];
    const fenBefore = replay.fen();
    replay.move(move.san);
    const fenAfter = replay.fen();
    
    moves.push({
      ply: i + 1,
      san: move.san,
      lan: move.lan,
      fenBefore,
      fenAfter,
      color: move.color,
      piece: move.piece,
    });
  }

  const rawHeaders = chess.header();
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawHeaders)) {
    if (v !== null) headers[k] = v;
  }
  const resultHeader = headers.Result || "*";
  
  return {
    headers,
    moves,
    result: resultHeader,
  };
}
