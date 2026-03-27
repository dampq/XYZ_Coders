import { Router } from "express";
import { PersonalAiService } from "../services/personalAiService";
import { MemoryStore } from "../services/memoryStore";
import { ai6RequestSchema } from "../validators";

export function createAi6Routes(memoryStore: MemoryStore, personalAiService: PersonalAiService): Router {
  const router = Router();

  router.post("/decision", async (req, res) => {
    const parsed = ai6RequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      const input = parsed.data;
      const userMemory = memoryStore.getUserMemory(input.userId);
      const decision = await personalAiService.synthesizeDecision(input, userMemory);

      const updatedMemory = memoryStore.appendDecisionTrail(
        input.userId,
        input.query,
        decision.finalDecision,
        input.currentNotes ?? []
      );

      return res.json({
        userMemory: updatedMemory,
        decision
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to generate AI6 decision.",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return router;
}
