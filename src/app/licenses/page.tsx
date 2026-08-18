import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LicensesPage() {
  return (
    <div className="container mx-auto px-4 py-16 sm:px-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Open Source Licenses</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          ChessCoach is made possible by these incredible open-source projects.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stockfish</CardTitle>
            <CardDescription>GPLv3 License</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <p>
              Stockfish is an open-source chess engine developed by Marco Costalba, Joona Kiiski, Gary Linscott, Tord Romstad, Stéphane Nicolet, Stefan Gesing, and Sygamel.
            </p>
            <p>
              Stockfish is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>chess.js</CardTitle>
            <CardDescription>BSD-2-Clause License</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <p>Copyright (c) 2023, Jeff Hlywa</p>
            <p>
              Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.</li>
              <li>Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>react-chessboard</CardTitle>
            <CardDescription>MIT License</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <p>Copyright (c) 2021 Ryan Pyle</p>
            <p>
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
