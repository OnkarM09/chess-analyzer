import { ChessEngine, EngineEvaluation, AnalysisDepth } from "./types";
import { StockfishBrowserEngine } from "./stockfish";

export interface AnalysisTask {
  id: string;
  fen: string;
  depth: AnalysisDepth;
  priority: number; // Higher number = higher priority
  onResult?: (result: EngineEvaluation) => void;
  onError?: (error: Error) => void;
}

export class AnalysisQueue {
  private engine: ChessEngine | null = null;
  private queue: AnalysisTask[] = [];
  private currentTask: AnalysisTask | null = null;
  private isProcessing: boolean = false;
  
  // Cache of fen+depth -> EngineEvaluation
  private cache: Map<string, EngineEvaluation> = new Map();

  async init() {
    if (!this.engine) {
      this.engine = new StockfishBrowserEngine();
      await this.engine.init();
    }
  }

  addTask(task: AnalysisTask) {
    const cacheKey = `${task.fen}_${task.depth}`;
    if (this.cache.has(cacheKey)) {
      if (task.onResult) {
        task.onResult(this.cache.get(cacheKey)!);
      }
      return;
    }

    // Check if task already in queue, update priority if higher
    const existingIndex = this.queue.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      if (task.priority > this.queue[existingIndex].priority) {
        this.queue[existingIndex].priority = task.priority;
        this.queue[existingIndex].onResult = task.onResult;
        this.queue.sort((a, b) => b.priority - a.priority);
      }
      return;
    }

    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processNext();
  }

  cancelTask(id: string) {
    this.queue = this.queue.filter(t => t.id !== id);
    if (this.currentTask?.id === id) {
      if (this.engine) {
        this.engine.stop();
      }
    }
  }

  clearQueue() {
    this.queue = [];
    if (this.engine) {
      this.engine.stop();
    }
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;

    if (!this.engine) {
      try {
        await this.init();
      } catch (err) {
        console.error("Failed to init engine", err);
        this.isProcessing = false;
        return;
      }
    }

    this.currentTask = this.queue.shift() || null;

    if (this.currentTask) {
      try {
        const result = await this.engine!.analyze(this.currentTask.fen, this.currentTask.depth);
        const cacheKey = `${this.currentTask.fen}_${this.currentTask.depth}`;
        this.cache.set(cacheKey, result);
        
        if (this.currentTask.onResult) {
          this.currentTask.onResult(result);
        }
      } catch (error: any) {
        if (this.currentTask?.onError && error?.message !== "Analysis cancelled") {
          this.currentTask.onError(error);
        }
      }
    }

    this.currentTask = null;
    this.isProcessing = false;
    this.processNext();
  }

  destroy() {
    this.clearQueue();
    if (this.engine) {
      this.engine.destroy();
      this.engine = null;
    }
  }
}

// Singleton instance for the app
export const globalAnalysisQueue = new AnalysisQueue();
