import express from "express";
import { createAi6Routes } from "./routes/ai6Routes";
import { createMemoryRoutes } from "./routes/memoryRoutes";
import { MemoryStore } from "./services/memoryStore";
import { PersonalAiService } from "./services/personalAiService";

export function createApp() {
  const app = express();
  const memoryStore = new MemoryStore();
  const personalAiService = new PersonalAiService();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", module: "person3-memory-ai6" });
  });

  app.use("/api/memory", createMemoryRoutes(memoryStore));
  app.use("/api/ai6", createAi6Routes(memoryStore, personalAiService));

  return app;
}
