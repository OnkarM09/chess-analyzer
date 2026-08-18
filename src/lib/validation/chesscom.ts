import { z } from "zod";

export const playerSchema = z.object({
  username: z.string(),
  url: z.string(),
  title: z.string().optional(),
  status: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  location: z.string().optional(),
  joined: z.number(),
  last_online: z.number(),
  followers: z.number(),
});

export const archivesSchema = z.object({
  archives: z.array(z.string()),
});

export const gameSchema = z.object({
  url: z.string(),
  pgn: z.string().optional(),
  time_control: z.string(),
  end_time: z.number(),
  rated: z.boolean(),
  tcn: z.string(),
  uuid: z.string(),
  initial_setup: z.string().optional(),
  fen: z.string().optional(),
  time_class: z.string(),
  rules: z.string(),
  white: z.object({
    rating: z.number(),
    result: z.string(),
    "@id": z.string(),
    username: z.string(),
    uuid: z.string(),
  }),
  black: z.object({
    rating: z.number(),
    result: z.string(),
    "@id": z.string(),
    username: z.string(),
    uuid: z.string(),
  }),
});

export const monthlyGamesSchema = z.object({
  games: z.array(gameSchema),
});

export type ChesscomPlayer = z.infer<typeof playerSchema>;
export type ChesscomGame = z.infer<typeof gameSchema>;
