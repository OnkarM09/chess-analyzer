import { NextRequest, NextResponse } from "next/server";
import { getPlayer, ChesscomError } from "@/lib/chesscom/service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    const player = await getPlayer(username);
    return NextResponse.json(player);
  } catch (error) {
    if (error instanceof ChesscomError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
