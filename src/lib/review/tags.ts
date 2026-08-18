import { Chess } from "chess.js";

export type CoachingTag = 
  | "HANGING_PIECE"
  | "MISSED_FORK"
  | "MISSED_CHECK"
  | "MISSED_CAPTURE"
  | "MISSED_MATE"
  | "QUEEN_ADVENTURE"
  | "UNDEVELOPED_PIECE"
  | "LOST_MATERIAL";

/**
 * Very basic heuristics to tag a move.
 * A full implementation would require deep Stockfish PV analysis.
 * Here we use simple board state comparisons and bestmove.
 */
export function generateTags(
  fenBefore: string, 
  fenAfter: string, 
  playedMove: string, 
  bestMove: string, 
  evalLoss: number,
  isMateMissed: boolean
): CoachingTag[] {
  const tags: CoachingTag[] = [];
  
  const chessBefore = new Chess(fenBefore);
  const chessAfter = new Chess(fenAfter);

  if (isMateMissed) {
    tags.push("MISSED_MATE");
  }

  // Basic lost material heuristic (if eval dropped significantly and material difference changed negatively)
  // This is a simplification.
  if (evalLoss > 200) {
    const piecesBefore = chessBefore.board().flat().filter(p => p !== null).length;
    const piecesAfter = chessAfter.board().flat().filter(p => p !== null).length;
    if (piecesAfter < piecesBefore) {
      // Piece was captured or traded badly
      tags.push("LOST_MATERIAL");
    } else {
      // No piece was captured, maybe hanging piece
      tags.push("HANGING_PIECE");
    }
  }

  // Missed capture (if best move was a capture, but played move was not)
  // We can check if bestMove string like 'e4d5' corresponds to a capture on the board before.
  if (bestMove && bestMove.length >= 4) {
    const targetSquare = bestMove.substring(2, 4);
    const pieceAtTarget = chessBefore.get(targetSquare as any);
    
    // If there was an opponent's piece at the bestMove target square, it was a capture
    if (pieceAtTarget && evalLoss > 100) {
      tags.push("MISSED_CAPTURE");
    }
  }

  return tags;
}
