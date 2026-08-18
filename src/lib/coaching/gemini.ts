import { GoogleGenAI } from "@google/genai";
import { CoachingResponse } from "./schema";

// Initialize the Gemini client
// Note: This relies on GEMINI_API_KEY being set in the environment
const ai = new GoogleGenAI({});

export async function getCoachingAdvice(
  fenBefore: string,
  playedMove: string,
  bestMove: string,
  evalBefore: number,
  evalAfter: number,
  playerColor: "White" | "Black"
): Promise<CoachingResponse> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const prompt = `
You are a beginner-friendly chess coach.
The player (${playerColor}) just made a mistake.
Here is the situation:
- FEN before move: ${fenBefore}
- Move played: ${playedMove}
- Engine's best move: ${bestMove}
- Evaluation before: ${evalBefore} centipawns (positive means White is winning)
- Evaluation after: ${evalAfter} centipawns

Explain WHY this was a mistake and WHY the best move works. 
Do not invent variations. Just explain the immediate consequences.
Keep the tone encouraging but clear.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            explanation: { type: "STRING" },
            whatYouMissed: { type: "STRING" },
            immediateThreat: { type: "STRING" },
            whyBestMoveWorks: { type: "STRING" },
            lesson: { type: "STRING" },
            difficulty: { type: "STRING", enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"] },
            tags: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["title", "explanation", "whatYouMissed", "whyBestMoveWorks", "lesson", "difficulty", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    const parsed = JSON.parse(text);
    return parsed as CoachingResponse;
  } catch (error) {
    console.error("Gemini Coaching Error:", error);
    // Deterministic fallback
    return {
      title: "Tactical Oversight",
      explanation: "You played a move that significantly worsened your position.",
      whatYouMissed: `The move ${playedMove} allows your opponent to gain an advantage.`,
      whyBestMoveWorks: `The engine prefers ${bestMove} because it maintains or improves your position.`,
      lesson: "Always look for your opponent's most forcing replies (checks, captures, threats).",
      difficulty: "INTERMEDIATE",
      tags: ["Tactics"]
    };
  }
}
