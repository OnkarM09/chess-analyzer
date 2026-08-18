import { ChessEngine, EngineEvaluation, AnalysisDepth } from "./types";

export class StockfishBrowserEngine implements ChessEngine {
  private worker: Worker | null = null;
  private currentResolve: ((evalData: EngineEvaluation) => void) | null = null;
  private currentReject: ((error: Error) => void) | null = null;
  
  private currentFen: string = "";
  private currentDepth: number = 0;
  
  private bestMove: string = "";
  private latestScore: { value: number; type: "cp" | "mate" } = { value: 0, type: "cp" };
  private pv: string[] = [];
  
  private isReady: boolean = false;
  private initPromise: Promise<void> | null = null;
  private initResolve: (() => void) | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Assume stockfish.js is copied to public/stockfish/stockfish.js
        this.worker = new Worker("/stockfish/stockfish.js");
        
        this.worker.onmessage = (e) => this.handleMessage(e);
        this.worker.onerror = (e) => reject(e);
        
        this.initResolve = resolve;
        this.worker.postMessage("uci");
      } catch (err) {
        reject(err);
      }
    });

    return this.initPromise;
  }

  private handleMessage(e: MessageEvent) {
    const line = e.data as string;
    
    if (line === "uciok") {
      this.isReady = true;
      if (this.initResolve) {
        this.initResolve();
        this.initResolve = null;
      }
      return;
    }

    if (line.startsWith("info depth")) {
      // Parse info string
      // info depth 10 seldepth 14 multipv 1 score cp 26 nodes 13958 nps 1395800 hashfull 3 tbhits 0 time 10 pv e2e4 e7e5 g1f3
      const depthMatch = line.match(/depth (\d+)/);
      const scoreCpMatch = line.match(/score cp (-?\d+)/);
      const scoreMateMatch = line.match(/score mate (-?\d+)/);
      const pvMatch = line.match(/pv (.*)/);
      
      if (depthMatch) {
        const depth = parseInt(depthMatch[1], 10);
        if (depth <= this.currentDepth) {
          if (scoreCpMatch) {
            this.latestScore = { value: parseInt(scoreCpMatch[1], 10), type: "cp" };
          } else if (scoreMateMatch) {
            this.latestScore = { value: parseInt(scoreMateMatch[1], 10), type: "mate" };
          }
          if (pvMatch) {
            this.pv = pvMatch[1].trim().split(" ");
          }
        }
      }
    }

    if (line.startsWith("bestmove")) {
      const match = line.match(/bestmove (\S+)/);
      if (match) {
        this.bestMove = match[1];
      }
      
      if (this.currentResolve) {
        this.currentResolve({
          depth: this.currentDepth,
          score: this.latestScore,
          bestmove: this.bestMove,
          pv: this.pv,
          fen: this.currentFen
        });
        this.currentResolve = null;
        this.currentReject = null;
      }
    }
  }

  async analyze(fen: string, depth: AnalysisDepth): Promise<EngineEvaluation> {
    if (!this.worker || !this.isReady) {
      await this.init();
    }

    // Cancel any ongoing analysis
    this.stop();

    return new Promise((resolve, reject) => {
      this.currentResolve = resolve;
      this.currentReject = reject;
      this.currentFen = fen;
      this.currentDepth = depth;
      
      // Reset state for new analysis
      this.bestMove = "";
      this.latestScore = { value: 0, type: "cp" };
      this.pv = [];

      this.worker!.postMessage(`position fen ${fen}`);
      this.worker!.postMessage(`go depth ${depth}`);
    });
  }

  stop(): void {
    if (this.worker) {
      this.worker.postMessage("stop");
    }
    if (this.currentReject) {
      this.currentReject(new Error("Analysis cancelled"));
      this.currentResolve = null;
      this.currentReject = null;
    }
  }

  destroy(): void {
    this.stop();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    this.initPromise = null;
  }
}
