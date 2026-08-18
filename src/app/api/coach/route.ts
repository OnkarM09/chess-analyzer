import { NextRequest, NextResponse } from "next/server";
import { getCoachingAdvice } from "@/lib/coaching/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fenBefore, playedMove, bestMove, evalBefore, evalAfter, playerColor } = body;

    if (!fenBefore || !playedMove || !bestMove || playerColor === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const advice = await getCoachingAdvice(
      fenBefore,
      playedMove,
      bestMove,
      evalBefore,
      evalAfter,
      playerColor
    );

    return NextResponse.json(advice);
  } catch (error: any) {
    console.error("Coaching API Error:", error);
    return NextResponse.json({ error: "Failed to generate coaching advice" }, { status: 500 });
  }
}
