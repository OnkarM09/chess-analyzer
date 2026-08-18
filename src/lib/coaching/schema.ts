import { z } from "zod";

export const coachingSchema = z.object({
  title: z.string().describe("A short, catchy title for this lesson"),
  explanation: z.string().describe("1-2 sentences explaining what happened generally"),
  whatYouMissed: z.string().describe("Explanation of the specific tactic or idea missed"),
  immediateThreat: z.string().optional().describe("If the move blundered into a threat, describe it"),
  whyBestMoveWorks: z.string().describe("Why the engine's suggested move is better"),
  lesson: z.string().describe("A general rule of thumb to remember for the future"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).describe("How hard this concept is"),
  tags: z.array(z.string()).describe("1-3 short tags like 'Fork', 'Hanging Piece', 'King Safety'")
});

export type CoachingResponse = z.infer<typeof coachingSchema>;
