"use client"

import { useEffect, useState } from "react"
import { getRecentSavedGames, getSavedMistakes, SavedGame, SavedMistake } from "@/lib/persistence/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const [games, setGames] = useState<SavedGame[]>([])
  const [mistakes, setMistakes] = useState<SavedMistake[]>([])

  useEffect(() => {
    async function loadData() {
      setGames(await getRecentSavedGames())
      setMistakes(await getSavedMistakes())
    }
    loadData()
  }, [])

  const averageWhiteAcc = games.reduce((acc, g) => acc + g.summary.accuracy.white, 0) / (games.length || 1)
  const averageBlackAcc = games.reduce((acc, g) => acc + g.summary.accuracy.black, 0) / (games.length || 1)

  // Calculate tag frequencies
  const tagCounts: Record<string, number> = {}
  mistakes.forEach(m => {
    m.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-5xl space-y-8">
      <h1 className="text-3xl font-bold">Player Profile & Intelligence</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Games Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{games.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg Accuracy (White)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{averageWhiteAcc.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Accuracy (Black)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{averageBlackAcc.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recurring Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(tagCounts).length === 0 ? (
              <p className="text-zinc-500">Not enough data to analyze weaknesses yet. Review more games!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(tagCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tag, count]) => (
                    <Badge key={tag} variant="outline" className="text-sm py-1">
                      {tag} <span className="ml-2 text-zinc-500">x{count}</span>
                    </Badge>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Mistakes (Training Mode)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-500 mb-4">You have {mistakes.length} mistakes saved for retry.</p>
            {mistakes.length > 0 && (
              <a href="/training" className="inline-block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
                Start Training Mode
              </a>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
