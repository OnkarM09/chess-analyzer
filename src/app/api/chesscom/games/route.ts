import { NextRequest, NextResponse } from "next/server";
import { getRecentGames, ChesscomError } from "@/lib/chesscom/service";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");
  const countParam = searchParams.get("count");
  const count = countParam ? parseInt(countParam, 10) : 20;

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    const games = await getRecentGames(username, count);
    return NextResponse.json({ games });
  } catch (error) {
    if (error instanceof ChesscomError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
