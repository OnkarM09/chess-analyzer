import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Upload } from "lucide-react"

export default function Home() {
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
            <form className="flex flex-col gap-4">
              <Input placeholder="Enter username (e.g., hikaru)" />
              <Button type="submit" className="w-full">
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
            <form className="flex flex-col gap-4">
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300 resize-none"
                placeholder="[Event &quot;Live Chess&quot;]..."
                rows={4}
              />
              <Button type="submit" variant="secondary" className="w-full">
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
          <Button variant="outline" size="lg" className="rounded-full px-8">
            Try a Demo Game
          </Button>
        </div>
      </div>
    </div>
  )
}
