import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { GameMove } from "@/lib/chess/parser";
import { MoveClassification } from "@/lib/review/classification";

interface MoveListProps {
  moves: GameMove[];
  currentMoveIndex: number;
  classifications: Record<number, MoveClassification>;
  onMoveSelect: (index: number) => void;
}

export function MoveList({ moves, currentMoveIndex, classifications, onMoveSelect }: MoveListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeMoveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeMoveRef.current && containerRef.current) {
      activeMoveRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMoveIndex]);

  // Group moves into pairs (White, Black)
  const rows = [];
  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIndex: i,
      black: moves[i + 1], // could be undefined
      blackIndex: i + 1,
    });
  }

  const getClassificationColor = (cls?: MoveClassification) => {
    switch(cls) {
      case "BEST": return "text-green-500";
      case "GOOD": return "text-emerald-400";
      case "INACCURACY": return "text-yellow-500";
      case "MISTAKE": return "text-orange-500";
      case "BLUNDER": return "text-red-500";
      case "MISSED_WIN": return "text-purple-500";
      case "BOOK": return "text-blue-400";
      default: return "";
    }
  };

  const getClassificationIcon = (cls?: MoveClassification) => {
    switch(cls) {
      case "BEST": return "★";
      case "GOOD": return "✓";
      case "INACCURACY": return "?!";
      case "MISTAKE": return "?";
      case "BLUNDER": return "??";
      case "MISSED_WIN": return "-+";
      case "BOOK": return "📖";
      default: return "";
    }
  };

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 p-2 font-mono text-sm">
      <div className="grid grid-cols-[3rem_1fr_1fr] gap-x-2">
        {rows.map((row) => (
          <div key={row.moveNumber} className="contents">
            <div className="py-1 text-zinc-500 text-right pr-2 select-none border-r border-zinc-200 dark:border-zinc-800">
              {row.moveNumber}.
            </div>
            
            <button
              ref={currentMoveIndex === row.whiteIndex ? activeMoveRef : null}
              onClick={() => onMoveSelect(row.whiteIndex)}
              className={cn(
                "py-1 px-2 text-left rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex justify-between",
                currentMoveIndex === row.whiteIndex ? "bg-zinc-200 dark:bg-zinc-800 font-bold" : ""
              )}
            >
              <span>{row.white.san}</span>
              {classifications[row.whiteIndex] && (
                <span className={cn("text-xs font-bold", getClassificationColor(classifications[row.whiteIndex]))}>
                  {getClassificationIcon(classifications[row.whiteIndex])}
                </span>
              )}
            </button>
            
            {row.black ? (
              <button
                ref={currentMoveIndex === row.blackIndex ? activeMoveRef : null}
                onClick={() => onMoveSelect(row.blackIndex)}
                className={cn(
                  "py-1 px-2 text-left rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex justify-between",
                  currentMoveIndex === row.blackIndex ? "bg-zinc-200 dark:bg-zinc-800 font-bold" : ""
                )}
              >
                <span>{row.black.san}</span>
                {classifications[row.blackIndex] && (
                  <span className={cn("text-xs font-bold", getClassificationColor(classifications[row.blackIndex]))}>
                    {getClassificationIcon(classifications[row.blackIndex])}
                  </span>
                )}
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
