import { ClassifiedMove } from "./classification";

export interface TurningPoint {
  ply: number;
  evalLoss: number;
  classification: string;
}

/**
 * Finds the top 3-5 turning points (biggest blunders/mistakes) in the game.
 */
export function findTurningPoints(moves: { ply: number; classification: ClassifiedMove }[], count = 5): TurningPoint[] {
  // Filter for mistakes, blunders, missed wins
  const significantMoves = moves.filter(
    m => ["MISTAKE", "BLUNDER", "MISSED_WIN"].includes(m.classification.classification)
  );

  // Sort by highest eval loss
  significantMoves.sort((a, b) => b.classification.evalLoss - a.classification.evalLoss);

  // Take top N
  const topN = significantMoves.slice(0, count);

  // Sort back by ply chronological order
  topN.sort((a, b) => a.ply - b.ply);

  return topN.map(m => ({
    ply: m.ply,
    evalLoss: m.classification.evalLoss,
    classification: m.classification.classification,
  }));
}
