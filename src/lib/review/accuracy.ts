import { MoveClassification } from "./classification";

/**
 * Calculates a generalized accuracy score between 0 and 100 based on eval loss.
 * Formula used by typical chess engines (Caps/Accuracy v2 approx):
 * Accuracy = 100 * e^(-0.005 * evalLoss)
 * Averaged over all moves.
 */
export function calculateAccuracy(evalLosses: number[]): number {
  if (evalLosses.length === 0) return 100;

  const accuracies = evalLosses.map(loss => {
    // Cap loss to avoid negative loss boosting accuracy above 100,
    // and limit max loss impact
    const clampedLoss = Math.max(0, Math.min(loss, 1500));
    return 100 * Math.exp(-0.005 * clampedLoss);
  });

  const sum = accuracies.reduce((a, b) => a + b, 0);
  return Math.round((sum / accuracies.length) * 10) / 10; // Round to 1 decimal
}

export interface ReviewSummary {
  accuracy: {
    white: number;
    black: number;
  };
  mistakeCounts: {
    white: Record<MoveClassification, number>;
    black: Record<MoveClassification, number>;
  };
}

export function generateSummary(
  whiteLosses: number[],
  blackLosses: number[],
  whiteClassifications: MoveClassification[],
  blackClassifications: MoveClassification[]
): ReviewSummary {
  
  const initCounts = () => ({
    BEST: 0,
    GOOD: 0,
    INACCURACY: 0,
    MISTAKE: 0,
    BLUNDER: 0,
    MISSED_WIN: 0,
    BOOK: 0,
  });

  const whiteCounts = initCounts();
  const blackCounts = initCounts();

  whiteClassifications.forEach(c => whiteCounts[c]++);
  blackClassifications.forEach(c => blackCounts[c]++);

  return {
    accuracy: {
      white: calculateAccuracy(whiteLosses),
      black: calculateAccuracy(blackLosses),
    },
    mistakeCounts: {
      white: whiteCounts,
      black: blackCounts,
    }
  };
}
