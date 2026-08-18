"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Upload } from "lucide-react"
import { Chess } from "chess.js"

export default function Home() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [pgn, setPgn] = useState("")
  const [pgnError, setPgnError] = useState("")

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      router.push(`/games?username=${encodeURIComponent(username.trim())}`)
    }
  }

  const handlePgnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPgnError("")
    if (pgn.trim()) {
      try {
        const chess = new Chess()
        chess.loadPgn(pgn.trim())
        
        if (chess.history().length === 0) {
          setPgnError("PGN contains no moves.")
          return
        }

        localStorage.setItem("temp_pgn", pgn.trim())
        router.push("/review/custom")
      } catch (err) {
        setPgnError("Invalid PGN format. Please check and try again.")
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:px-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          Understand Your Chess Games
        </h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          Stockfish tells you <span className="font-semibold text-foreground">what</span> went wrong.{" "}
          Gemini AI explains <span className="font-semibold text-foreground">why</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Chess.com Username
            </CardTitle>
            <CardDescription>
              Fetch your recent games directly from Chess.com.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleUsernameSubmit}>
              <Input 
                placeholder="Enter username (e.g., hikaru)" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={!username.trim()}>
                Find Games
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Paste PGN
            </CardTitle>
            <CardDescription>
              Review a game from any platform using a PGN.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handlePgnSubmit}>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 resize-none"
                placeholder='[Event "Live Chess"]...'
                rows={4}
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
              />
              {pgnError && <p className="text-sm text-red-500 font-medium">{pgnError}</p>}
              <Button type="submit" variant="secondary" className="w-full" disabled={!pgn.trim()}>
                Analyze PGN
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-4">
          <div className="h-px w-16 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-medium">Or</span>
          <div className="h-px w-16 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="mt-6">
          <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => router.push("/review/demo")}>
            Try a Demo Game
          </Button>
        </div>
      </div>
    </div>
  )
}
