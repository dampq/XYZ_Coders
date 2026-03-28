import { Router } from "express";
import { memoryUpsertSchema } from "../validators";
import { MemoryStore } from "../services/memoryStore";

export function createMemoryRoutes(memoryStore: MemoryStore): Router {
  const router = Router();

  router.get("/:userId", (req, res) => {
    const memory = memoryStore.getUserMemory(req.params.userId);
    res.json(memory);
  });

  router.post("/", (req, res) => {
    const parsed = memoryUpsertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const memory = memoryStore.upsertUserMemory(parsed.data);
    return res.status(201).json(memory);
  });

  return router;
}
