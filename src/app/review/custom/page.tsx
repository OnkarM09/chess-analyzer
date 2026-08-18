"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Chessboard } from "@/components/chess/ChessboardWrapper"
import { Chess } from "chess.js"

import { parseGameFromPgn, GameMove } from "@/lib/chess/parser"
import { globalAnalysisQueue } from "@/lib/engine/queue"
import { EngineEvaluation } from "@/lib/engine/types"
import { normalizeEval } from "@/lib/engine/eval"
import { classifyMove, ClassifiedMove, MoveClassification } from "@/lib/review/classification"

import { EvalBar } from "@/components/chess/EvalBar"
import { MoveList } from "@/components/chess/MoveList"
import { CoachCard } from "@/components/coach/CoachCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CoachingResponse } from "@/lib/coaching/schema"
import { generateSummary, ReviewSummary } from "@/lib/review/accuracy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Undo2, Zap } from "lucide-react"

export default function ReviewPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ReviewPage />
    </Suspense>
  )
}

function ReviewPage() {
  const router = useRouter()
  const [pgn, setPgn] = useState<string>("")
  const [moves, setMoves] = useState<GameMove[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1) // -1 means initial position
  const [boardFen, setBoardFen] = useState("start")
  const [isShowingBestMove, setIsShowingBestMove] = useState(false)
  
  // Analysis State
  const [evaluations, setEvaluations] = useState<Record<number, EngineEvaluation>>({})
  const [classifications, setClassifications] = useState<Record<number, ClassifiedMove>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  
  // Coaching State
  const [coachingData, setCoachingData] = useState<Record<number, CoachingResponse>>({})
  const [isCoachingLoading, setIsCoachingLoading] = useState(false)

  const [summary, setSummary] = useState<ReviewSummary | null>(null)

  useEffect(() => {
    const savedPgn = localStorage.getItem("temp_pgn")
    if (!savedPgn) {
      router.push("/")
      return
    }
    
    try {
      const parsed = parseGameFromPgn(savedPgn)
      setPgn(savedPgn)
      setMoves(parsed.moves)
      setBoardFen("start")
      setCurrentMoveIndex(-1)
      
      // Start background analysis
      startAnalysis(parsed.moves)
    } catch (e) {
      alert("Failed to parse game.")
      router.push("/")
    }
    
    return () => {
      globalAnalysisQueue.clearQueue()
    }
  }, [])

  const startAnalysis = async (gameMoves: GameMove[]) => {
    setIsAnalyzing(true)
    let analyzedCount = 0
    
    // Analyze the starting position too
    const allPositions = [{ ply: 0, fen: "start", move: null }, ...gameMoves.map(m => ({ ply: m.ply, fen: m.fenAfter, move: m }))]
    const total = allPositions.length

    for (let i = 0; i < allPositions.length; i++) {
      const pos = allPositions[i]
      globalAnalysisQueue.addTask({
        id: `pos_${pos.ply}`,
        fen: pos.fen === "start" ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" : pos.fen,
        depth: 14,
        priority: i === 0 ? 10 : 1, // prioritize current/start position
        onResult: (result) => {
          setEvaluations(prev => ({ ...prev, [pos.ply]: result }))
          analyzedCount++
          setAnalysisProgress(Math.round((analyzedCount / total) * 100))
          
          // If this is not the starting position, we can classify the move
          if (pos.ply > 0) {
            // We need the evaluation of the position BEFORE this move
            setEvaluations(currentEvals => {
              const evalBefore = currentEvals[pos.ply - 1]
              if (evalBefore) {
                const classification = classifyMove(evalBefore, result, pos.move!.color)
                setClassifications(prev => {
                  const updated = { ...prev, [pos.ply]: classification }
                  
                  // Check if we should generate summary
                  if (Object.keys(updated).length === gameMoves.length) {
                    generateFinalSummary(updated, gameMoves)
                  }
                  
                  return updated
                })
              }
              return currentEvals
            })
          }
        }
      })
    }
  }

  const generateFinalSummary = async (clss: Record<number, ClassifiedMove>, gameMoves: GameMove[]) => {
    const wLosses: number[] = []
    const bLosses: number[] = []
    const wCls: MoveClassification[] = []
    const bCls: MoveClassification[] = []
    
    Object.entries(clss).forEach(([ply, cls]) => {
      const move = gameMoves[parseInt(ply) - 1]
      if (move.color === "w") {
        wLosses.push(cls.evalLoss)
        wCls.push(cls.classification)
      } else {
        bLosses.push(cls.evalLoss)
        bCls.push(cls.classification)
      }
    })
    
    const finalSummary = generateSummary(wLosses, bLosses, wCls, bCls)
    setSummary(finalSummary)

    // Save to indexedDB
    try {
      const { saveGameResult, saveMistake } = await import("@/lib/persistence/db")
      
      const gameId = Date.now().toString()
      await saveGameResult({
        id: gameId,
        pgn,
        summary: finalSummary,
        date: Date.now(),
        playerColor: "w", // Defaulting to White for custom PGNs right now, would be parsed from username usually
      })

      // Save blunders/mistakes
      Object.entries(clss).forEach(([plyStr, cls]) => {
        const ply = parseInt(plyStr)
        if (["MISTAKE", "BLUNDER"].includes(cls.classification)) {
          const move = gameMoves[ply - 1]
          const evalBefore = evaluations[ply - 1]
          if (evalBefore && evalBefore.bestmove) {
            saveMistake({
              id: `${gameId}_${ply}`,
              gameId,
              fenBefore: move.fenBefore,
              playedMove: move.san,
              bestMove: evalBefore.bestmove,
              tags: [cls.classification as any],
              date: Date.now()
            })
          }
        }
      })
    } catch (e) {
      console.error("Failed to save to db", e)
    }
  }

  const playMoveSound = () => {
    // In a real app, we would play a sound here:
    // new Audio('/sounds/move.mp3').play().catch(() => {})
  }

  const goToMove = (index: number) => {
    if (index < -1) index = -1
    if (index >= moves.length) index = moves.length - 1
    
    if (index !== currentMoveIndex) {
      playMoveSound()
    }

    setCurrentMoveIndex(index)
    setIsShowingBestMove(false)
    if (index === -1) {
      setBoardFen("start")
    } else {
      setBoardFen(moves[index].fenAfter)
    }
    
    // Reprioritize analysis for this move if not done
    if (!evaluations[index + 1]) {
       globalAnalysisQueue.addTask({
         id: `pos_reprioritize_${index + 1}`,
         fen: index === -1 ? "start" : moves[index].fenAfter,
         depth: 14,
         priority: 100
       })
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToMove(currentMoveIndex - 1)
      else if (e.key === "ArrowRight") goToMove(currentMoveIndex + 1)
      else if (e.key === "ArrowUp" || e.key === "Home") goToMove(-1)
      else if (e.key === "ArrowDown" || e.key === "End") goToMove(moves.length - 1)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentMoveIndex, moves.length])

  // Automatically request coaching for blunders/mistakes
  useEffect(() => {
    if (currentMoveIndex >= 0) {
      const cls = classifications[currentMoveIndex + 1]
      if (cls && ["MISTAKE", "BLUNDER", "MISSED_WIN"].includes(cls.classification)) {
        requestCoaching(currentMoveIndex)
      }
    }
  }, [currentMoveIndex, classifications])

  const requestCoaching = async (index: number) => {
    if (coachingData[index + 1] || isCoachingLoading) return;
    
    const move = moves[index]
    const evalBefore = evaluations[index]
    const evalAfter = evaluations[index + 1]
    
    if (!evalBefore || !evalAfter) return; // Wait for analysis
    
    setIsCoachingLoading(true)
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fenBefore: move.fenBefore,
          playedMove: move.san,
          bestMove: evalBefore.bestmove,
          evalBefore: evalBefore.score.type === "mate" ? (evalBefore.score.value > 0 ? 10000 : -10000) : evalBefore.score.value,
          evalAfter: evalAfter.score.type === "mate" ? (evalAfter.score.value > 0 ? 10000 : -10000) : evalAfter.score.value,
          playerColor: move.color === "w" ? "White" : "Black"
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setCoachingData(prev => ({ ...prev, [index + 1]: data }))
    } catch (e) {
      console.error(e)
    } finally {
      setIsCoachingLoading(false)
    }
  }

  // Derived current state
  const currentPly = currentMoveIndex + 1
  const currentEval = evaluations[currentPly]
  const currentNormalizedEval = currentEval ? normalizeEval(currentEval, "w") : null
  const currentClassifications = classifications // Note: classifications are keyed by ply (1-indexed based on moves)
  
  const customArrows: [string, string][] = []
  
  if (currentEval?.bestmove && !isShowingBestMove) {
    const from = currentEval.bestmove.substring(0, 2)
    const to = currentEval.bestmove.substring(2, 4)
    customArrows.push([from, to])
  }

  let displayFen = boardFen;
  if (isShowingBestMove && currentEval?.bestmove) {
    try {
      const c = new Chess(boardFen === "start" ? undefined : boardFen);
      const from = currentEval.bestmove.substring(0, 2);
      const to = currentEval.bestmove.substring(2, 4);
      const promotion = currentEval.bestmove.length > 4 ? currentEval.bestmove.substring(4) : undefined;
      c.move({ from, to, promotion });
      displayFen = c.fen();
    } catch (e) {
      // ignore invalid moves
    }
  }

  return (
    <div className="container mx-auto px-2 py-4 sm:p-6 lg:p-8 max-w-7xl">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Game Review</h1>
          {analysisProgress < 100 && (
            <p className="text-sm text-zinc-500">Analyzing... {analysisProgress}%</p>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push("/")}>Back to Games</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_350px] gap-6 h-full">
        {/* Left Column: Board and Eval */}
        <div className="flex flex-col gap-4 items-center sm:items-stretch">
          <div className="flex gap-2 sm:gap-4 w-full justify-center lg:justify-end max-w-2xl mx-auto">
            {/* Eval Bar */}
            <div className="shrink-0 flex items-center h-full">
              {currentNormalizedEval ? (
                <EvalBar 
                  evaluation={currentNormalizedEval.absoluteValue} 
                  isMate={currentNormalizedEval.isMate} 
                  orientation="white" 
                />
              ) : (
                <Skeleton className="w-6 sm:w-8 h-[300px] sm:h-[400px] md:h-[600px] rounded" />
              )}
            </div>
            
            {/* Board */}
            <div className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-[600px] aspect-square flex items-center">
              <Chessboard 
                options={{
                  id: "ReviewBoard",
                  position: displayFen,
                  boardOrientation: "white",
                  arrows: customArrows.length > 0 ? customArrows.map(a => ({ startSquare: a[0], endSquare: a[1], color: "rgba(34, 197, 94, 0.5)" })) : undefined
                }}
              />
            </div>

            {/* Best Move Actions */}
            <div className="flex gap-2 justify-center w-full mt-2">
              {isShowingBestMove ? (
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsShowingBestMove(false)}>
                  <Undo2 className="h-4 w-4 mr-2" /> Back to Game
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  className="w-full sm:w-auto"
                  onClick={() => setIsShowingBestMove(true)}
                  disabled={!currentEval?.bestmove}
                >
                  <Zap className="h-4 w-4 mr-2 text-yellow-500" /> Show Best Move
                </Button>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex justify-center gap-2 max-w-2xl mx-auto w-full">
            <Button variant="outline" size="icon" onClick={() => goToMove(-1)} disabled={currentMoveIndex === -1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => goToMove(currentMoveIndex - 1)} disabled={currentMoveIndex === -1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => goToMove(currentMoveIndex + 1)} disabled={currentMoveIndex === moves.length - 1}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => goToMove(moves.length - 1)} disabled={currentMoveIndex === moves.length - 1}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Middle Column: Moves */}
        <div className="h-[400px] lg:h-[600px] flex flex-col">
          <MoveList 
            moves={moves} 
            currentMoveIndex={currentMoveIndex} 
            classifications={currentClassifications}
            onMoveSelect={(idx) => goToMove(idx)}
          />
        </div>

        {/* Right Column: Coaching / Summary */}
        <div className="flex flex-col gap-4">
          {summary && currentMoveIndex === moves.length - 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Game Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Accuracy */}
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3">Accuracy</h3>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-white border border-gray-400"></div> White</span>
                    <span className="text-lg">{summary.accuracy.white}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium mt-2">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-zinc-800 border border-gray-600"></div> Black</span>
                    <span className="text-lg">{summary.accuracy.black}%</span>
                  </div>
                </div>

                {/* Move Classifications */}
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3">Performance</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center font-medium mb-2 pb-1 border-b">
                    <div className="text-left text-muted-foreground">Move</div>
                    <div className="text-muted-foreground">White</div>
                    <div className="text-muted-foreground">Black</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center py-1">
                    <div className="text-left text-blue-500 font-semibold">Best/Book</div>
                    <div>{summary.mistakeCounts.white.BEST + summary.mistakeCounts.white.BOOK}</div>
                    <div>{summary.mistakeCounts.black.BEST + summary.mistakeCounts.black.BOOK}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center py-1">
                    <div className="text-left text-green-500 font-semibold">Good</div>
                    <div>{summary.mistakeCounts.white.GOOD}</div>
                    <div>{summary.mistakeCounts.black.GOOD}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center py-1 bg-muted/30 rounded">
                    <div className="text-left text-yellow-500 font-semibold">Inaccuracy</div>
                    <div>{summary.mistakeCounts.white.INACCURACY}</div>
                    <div>{summary.mistakeCounts.black.INACCURACY}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center py-1 bg-muted/30 rounded">
                    <div className="text-left text-orange-500 font-semibold">Mistake</div>
                    <div>{summary.mistakeCounts.white.MISTAKE}</div>
                    <div>{summary.mistakeCounts.black.MISTAKE}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center py-1 bg-muted/30 rounded">
                    <div className="text-left text-red-500 font-semibold">Blunder</div>
                    <div>{summary.mistakeCounts.white.BLUNDER}</div>
                    <div>{summary.mistakeCounts.black.BLUNDER}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-center py-1">
                    <div className="text-left text-purple-500 font-semibold">Missed Win</div>
                    <div>{summary.mistakeCounts.white.MISSED_WIN}</div>
                    <div>{summary.mistakeCounts.black.MISSED_WIN}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CoachCard 
              coaching={coachingData[currentPly] || null} 
              isLoading={isCoachingLoading && currentPly > 0 && ["MISTAKE", "BLUNDER"].includes(classifications[currentPly]?.classification)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
