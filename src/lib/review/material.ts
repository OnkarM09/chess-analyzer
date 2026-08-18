import { Chess } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export function calculateMaterialDifference(fen: string): number {
  const chess = new Chess(fen);
  const board = chess.board();
  
  let whiteMaterial = 0;
  let blackMaterial = 0;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece) {
        const val = PIECE_VALUES[piece.type] || 0;
        if (piece.color === "w") {
          whiteMaterial += val;
        } else {
          blackMaterial += val;
        }
      }
    }
  }

  // Returns positive if White is ahead, negative if Black is ahead
  return whiteMaterial - blackMaterial;
}
