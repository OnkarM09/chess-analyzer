"use client"

import { useEffect, useState } from "react"
import { getSavedMistakes, SavedMistake } from "@/lib/persistence/db"
import { Chessboard } from "react-chessboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chess } from "chess.js"

export default function TrainingPage() {
  const [mistakes, setMistakes] = useState<SavedMistake[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null)

  useEffect(() => {
    async function loadData() {
      setMistakes(await getSavedMistakes())
    }
    loadData()
  }, [])

  if (mistakes.length === 0) {
    return (
      <div className="container mx-auto p-8 text-center max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Training Mode</h1>
        <p className="text-zinc-500">You don't have any saved mistakes yet. Review some games to populate your training data!</p>
      </div>
    )
  }

  const currentMistake = mistakes[currentIndex]
  // Extract target move details
  const bestMove = currentMistake.bestMove // e.g. "e2e4"
  const fromSquare = bestMove.substring(0, 2)
  const toSquare = bestMove.substring(2, 4)
  const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined

  const handlePieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    // Only allow the correct move
    if (sourceSquare === fromSquare && targetSquare === toSquare) {
      setFeedback("success")
      return true
    }
    
    setFeedback("error")
    return false // Snap back
  }

  const nextMistake = () => {
    setFeedback(null)
    setCurrentIndex((prev) => (prev + 1) % mistakes.length)
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Retry Your Mistakes</h1>
        <span className="text-sm text-zinc-500">{currentIndex + 1} / {mistakes.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
        <div className="aspect-square w-full max-w-[500px] mx-auto">
          <Chessboard 
            {...({
              position: currentMistake.fenBefore,
              onPieceDrop: handlePieceDrop,
              boardOrientation: new Chess(currentMistake.fenBefore).turn() === "w" ? "white" : "black"
            } as any)}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600 dark:text-zinc-300">
                Find the best move in this position!
              </p>
              <p className="text-sm text-zinc-500 mt-2">
                In your game, you played <span className="font-bold text-red-500">{currentMistake.playedMove}</span>.
              </p>
            </CardContent>
          </Card>

          {feedback === "success" && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <p className="text-green-700 dark:text-green-400 font-bold mb-4">Correct! Well done.</p>
                <Button onClick={nextMistake} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Next Position
                </Button>
              </CardContent>
            </Card>
          )}

          {feedback === "error" && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
              <CardContent className="pt-6 text-red-700 dark:text-red-400">
                <p className="font-bold">Incorrect.</p>
                <p className="text-sm mt-1">That's not the best move. Try again!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
