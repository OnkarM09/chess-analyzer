export interface EngineEvaluation {
  depth: number;
  score: {
    value: number; // centipawns or mate in X
    type: "cp" | "mate";
  };
  bestmove: string;
  pv: string[]; // principal variation (moves)
  fen: string;
}

export type AnalysisDepth = 10 | 14 | 18;

export interface ChessEngine {
  init(): Promise<void>;
  analyze(fen: string, depth: AnalysisDepth): Promise<EngineEvaluation>;
  stop(): void;
  destroy(): void;
}
