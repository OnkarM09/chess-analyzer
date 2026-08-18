import { EngineEvaluation } from "./types";

export function normalizeEval(evaluation: EngineEvaluation, colorToMove: "w" | "b") {
  const { score } = evaluation;
  
  // Stockfish evaluation is always relative to the side to move
  // We want to return absolute evaluation from White's perspective,
  // or a formatted string.
  
  let absoluteValue = score.value;
  if (colorToMove === "b") {
    absoluteValue = -absoluteValue;
  }

  // Cap centipawn evaluation around +/- 1500 (15 pawns) for bar graphs
  const clampedValue = Math.max(-1500, Math.min(1500, absoluteValue));

  return {
    absoluteValue, // in cp
    clampedValue,
    type: score.type,
    isMate: score.type === "mate",
    whiteAdvantage: absoluteValue > 0,
    formatted: score.type === "mate" 
      ? `M${Math.abs(absoluteValue)}` 
      : (absoluteValue / 100).toFixed(2)
  };
}
