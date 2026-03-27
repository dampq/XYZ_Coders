import { z } from "zod";

export const preferenceValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const memoryUpsertSchema = z.object({
  userId: z.string().min(1),
  notes: z.array(z.string()).optional(),
  pastQueries: z.array(z.string()).optional(),
  pastDecisions: z.array(z.string()).optional(),
  preferences: z.record(preferenceValueSchema).optional()
});

export const ai6RequestSchema = z.object({
  userId: z.string().min(1),
  query: z.string().min(1),
  currentNotes: z.array(z.string()).optional(),
  debate: z.array(
    z.object({
      aiName: z.string().min(1),
      role: z.string().min(1),
      opinion: z.string().min(1),
      reasoning: z.string().min(1),
      counterarguments: z.array(z.string()).optional()
    })
  ).min(1),
  debateSummary: z.object({
    consensusScore: z.number().min(0).max(100),
    agreements: z.array(z.string()),
    conflicts: z.array(z.string()),
    highlights: z.array(z.string()).optional()
  })
});
