"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function GamesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    }>
      <GamesList />
    </Suspense>
  )
}

function GamesList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const username = searchParams.get("username")

  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Filter states
  const [timeControlFilter, setTimeControlFilter] = useState("all")
  const [colorFilter, setColorFilter] = useState("all")
  const [resultFilter, setResultFilter] = useState("all")

  useEffect(() => {
    if (!username) {
      setLoading(false)
      return
    }

    const fetchGames = async () => {
      try {
        setLoading(true)
        setError("")
        const res = await fetch(`/api/chesscom/games?username=${encodeURIComponent(username)}&_t=${Date.now()}`, {
          cache: 'no-store'
        })
        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch games")
        }
        
        setGames(data.games || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [username])

  if (!username) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg space-y-6">
        <h1 className="text-2xl font-bold">No Username Provided</h1>
        <p className="text-zinc-500">Please go back and enter a valid Chess.com username.</p>
        <Button onClick={() => router.push("/")}>Go Back</Button>
      </div>
    )
  }

  const getPlayerColor = (game: any) => {
    return game.white.username.toLowerCase() === username.toLowerCase() ? "white" : "black"
  }

  const getResult = (game: any) => {
    const color = getPlayerColor(game)
    const myResult = game[color].result
    if (["win"].includes(myResult)) return "win"
    if (["checkmated", "timeout", "resigned", "lose", "abandoned"].includes(myResult)) return "loss"
    return "draw"
  }

  const filteredGames = games.filter(game => {
    if (timeControlFilter !== "all" && game.time_class !== timeControlFilter) return false
    if (colorFilter !== "all" && getPlayerColor(game) !== colorFilter) return false
    if (resultFilter !== "all" && getResult(game) !== resultFilter) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Recent Games</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Showing games for <span className="font-semibold text-foreground">{username}</span>
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && games.length > 0 && (
        <div className="flex flex-wrap gap-4 items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Time Control</label>
            <select 
              className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={timeControlFilter}
              onChange={(e) => setTimeControlFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="bullet">Bullet</option>
              <option value="blitz">Blitz</option>
              <option value="rapid">Rapid</option>
              <option value="daily">Daily</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Color</label>
            <select 
              className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Result</label>
            <select 
              className="block w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="draw">Draw</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !error && filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500">No games found matching the criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGames.map((game, i) => {
            const myColor = getPlayerColor(game)
            const opponentColor = myColor === "white" ? "black" : "white"
            const opponent = game[opponentColor]
            const result = getResult(game)
            
            const resultColors = {
              win: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50",
              loss: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50",
              draw: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
            }

            return (
              <Card key={game.url || i} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className={`w-2 sm:w-3 shrink-0 ${result === "win" ? "bg-green-500" : result === "loss" ? "bg-red-500" : "bg-zinc-400"}`} />
                  <CardContent className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={resultColors[result as keyof typeof resultColors]}>
                          {result.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">
                          vs {opponent.username} ({opponent.rating})
                        </span>
                      </div>
                      <div className="text-sm text-zinc-500 flex items-center gap-2">
                        <span className="capitalize">{game.time_class}</span>
                        <span>•</span>
                        <span>{new Date(game.end_time * 1000).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">Played as {myColor}</span>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      <Button onClick={() => {
                        localStorage.setItem("temp_pgn", game.pgn || "")
                        router.push(`/review/custom?source=chesscom&gameUrl=${encodeURIComponent(game.url)}`)
                      }}>
                        Analyze
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
