import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(1).max(100)
});

export const matchSchema = z.object({
  teamId: z.string().min(1),
  title: z.string().min(1).max(100),
  opponent: z.string().max(100).optional().nullable(),
  playedAt: z.string().min(1),
  memo: z.string().max(500).optional().nullable()
});

export const videoSchema = z.object({
  matchId: z.string().min(1),
  storageUrl: z.string().min(1),
  durationSec: z.number().int().positive()
});

export const eventSchema = z.object({
  teamId: z.string().min(1),
  matchId: z.string().min(1),
  videoId: z.string().min(1),
  type: z.enum(["SPIKE", "SERVE", "RECEPTION"]),
  outcome: z.enum([
    "POINT",
    "IN_PLAY",
    "ERROR",
    "BLOCKED",
    "ACE",
    "MISS",
    "SUCCESS_A",
    "SUCCESS_B",
    "SUCCESS_C"
  ]),
  playerId: z.string().optional().nullable(),
  rotation: z.number().int().min(1).max(6).optional().nullable(),
  zone: z.number().int().min(1).max(18).optional().nullable(),
  videoTimeSec: z.number().int().min(0),
  confidence: z.number().min(0).max(1).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable()
});
