import { cn } from "@/lib/utils";

interface EvalBarProps {
  evaluation: number; // clampedValue from White's perspective
  isMate: boolean;
  orientation: "white" | "black";
}

export function EvalBar({ evaluation, isMate, orientation }: EvalBarProps) {
  // Convert centipawns to a percentage for the bar height
  // Assuming +/- 500 cp as roughly the visual max/min before it saturates
  // 0 cp = 50%
  // +500 cp = 100% white
  // -500 cp = 0% white
  
  let whitePercentage = 50;
  
  if (isMate) {
    whitePercentage = evaluation > 0 ? 100 : 0;
  } else {
    // Sigmoid-like scaling or linear with cap
    const capped = Math.max(-1000, Math.min(1000, evaluation));
    // -1000 -> 0%, 0 -> 50%, 1000 -> 100%
    whitePercentage = 50 + (capped / 20);
  }

  // If board is flipped, visual white is at bottom vs top
  // In typical online chess, the player's color is at the bottom.
  // The CSS flex column draws from top to bottom.
  // If orientation is white, black is top, white is bottom.
  // The 'white' portion of the bar should be at the bottom.
  
  const formattedScore = isMate 
    ? `M${Math.abs(evaluation)}`
    : Math.abs(evaluation / 100).toFixed(1);

  const isWhiteWinning = evaluation > 0;

  return (
    <div className="relative w-6 sm:w-8 h-[300px] sm:h-[400px] md:h-[600px] bg-[#333] rounded overflow-hidden flex flex-col">
      <div 
        className={cn("w-full transition-all duration-500 ease-out", 
          orientation === "white" ? "bg-[#333]" : "bg-[#ddd]"
        )}
        style={{ height: orientation === "white" ? `${100 - whitePercentage}%` : `${whitePercentage}%` }}
      />
      <div 
        className={cn("w-full flex-1 transition-all duration-500 ease-out",
          orientation === "white" ? "bg-[#ddd]" : "bg-[#333]"
        )}
      />
      
      <div className={cn(
        "absolute inset-x-0 text-center text-[10px] sm:text-xs font-bold font-mono py-1 z-10",
        isWhiteWinning ? (orientation === "white" ? "bottom-0 text-black" : "top-0 text-black") 
                       : (orientation === "white" ? "top-0 text-white" : "bottom-0 text-white")
      )}>
        {formattedScore}
      </div>
    </div>
  );
}
