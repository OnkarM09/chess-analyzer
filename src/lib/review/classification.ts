import { EngineEvaluation } from "../engine/types";
import { normalizeEval } from "../engine/eval";

export type MoveClassification = "BEST" | "GOOD" | "INACCURACY" | "MISTAKE" | "BLUNDER" | "MISSED_WIN" | "BOOK";

export interface ClassifiedMove {
  classification: MoveClassification;
  evalLoss: number; // in cp, from player's perspective
  playerEvalBefore: number; // in cp
  playerEvalAfter: number; // in cp
}

/**
 * Classifies a move based on the evaluation before and after the move.
 * @param evalBefore The evaluation of the position BEFORE the player made their move
 * @param evalAfter The evaluation of the position AFTER the player made their move
 * @param colorToMove The color of the player who made the move
 */
export function classifyMove(
  evalBefore: EngineEvaluation,
  evalAfter: EngineEvaluation,
  colorToMove: "w" | "b"
): ClassifiedMove {
  // Normalize both evaluations to absolute values from White's perspective
  const before = normalizeEval(evalBefore, "w");
  const after = normalizeEval(evalAfter, "w");

  // Convert to player's perspective.
  // We want to calculate how much the evaluation changed for the player who just moved.
  // If White moved, a positive difference (after - before) means White gained advantage.
  // Actually, wait: evalBefore is from colorToMove's turn. evalAfter is from opponent's turn.
  // Let's just use clampedValue from normalizeEval which is always from White's perspective.
  
  let playerEvalBefore = before.clampedValue;
  let playerEvalAfter = after.clampedValue;
  
  if (colorToMove === "b") {
    playerEvalBefore = -playerEvalBefore;
    playerEvalAfter = -playerEvalAfter;
  }

  // Eval loss: how much centipawn advantage the player LOST.
  // If playerEvalBefore was 100, and playerEvalAfter is 50, evalLoss = 50.
  // If playerEvalBefore was 100, and playerEvalAfter is 120, evalLoss = -20 (gained).
  const evalLoss = playerEvalBefore - playerEvalAfter;

  let classification: MoveClassification = "GOOD";

  // Handle mate transitions
  if (before.isMate && !after.isMate) {
    if (playerEvalBefore > 0) {
      classification = "MISSED_WIN"; // Had mate, lost it
    } else {
      classification = "BEST"; // Escaped mate (maybe)
    }
  } else if (!before.isMate && after.isMate) {
    if (playerEvalAfter < 0) {
      classification = "BLUNDER"; // Walked into mate
    } else {
      classification = "BEST"; // Found mate
    }
  } else if (before.isMate && after.isMate) {
    if (playerEvalBefore > 0 && playerEvalAfter < 0) {
      classification = "BLUNDER"; // Went from mating to being mated
    } else {
      classification = "BEST"; // Still mating or still being mated
    }
  } else {
    // Normal centipawn evaluation loss thresholds
    if (evalLoss <= 20) {
      classification = "BEST";
    } else if (evalLoss <= 50) {
      classification = "GOOD";
    } else if (evalLoss <= 100) {
      classification = "INACCURACY";
    } else if (evalLoss <= 300) {
      classification = "MISTAKE";
    } else {
      classification = "BLUNDER";
    }
    
    // Special case for missed win (if advantage drops significantly from winning position)
    if (playerEvalBefore > 300 && playerEvalAfter < 100 && evalLoss > 300) {
      classification = "MISSED_WIN";
    }
  }

  return {
    classification,
    evalLoss,
    playerEvalBefore,
    playerEvalAfter,
  };
}
