import fs from "fs";
import path from "path";
import { config } from "../config";
import { PreferenceMap, UserMemory } from "../types";

type MemoryStoreData = Record<string, UserMemory>;

export class MemoryStore {
  private readonly storePath: string;

  constructor(storePath = config.memoryStorePath) {
    this.storePath = path.resolve(storePath);
    this.ensureStore();
  }

  getUserMemory(userId: string): UserMemory {
    const allMemory = this.readStore();
    return (
      allMemory[userId] ?? {
        userId,
        notes: [],
        pastQueries: [],
        pastDecisions: [],
        preferences: {},
        updatedAt: new Date().toISOString()
      }
    );
  }

  upsertUserMemory(input: {
    userId: string;
    notes?: string[];
    pastQueries?: string[];
    pastDecisions?: string[];
    preferences?: PreferenceMap;
  }): UserMemory {
    const allMemory = this.readStore();
    const existing = this.getUserMemory(input.userId);

    const merged: UserMemory = {
      userId: input.userId,
      notes: this.mergeUnique(existing.notes, input.notes),
      pastQueries: this.mergeUnique(existing.pastQueries, input.pastQueries),
      pastDecisions: this.mergeUnique(existing.pastDecisions, input.pastDecisions),
      preferences: {
        ...existing.preferences,
        ...(input.preferences ?? {})
      },
      updatedAt: new Date().toISOString()
    };

    allMemory[input.userId] = merged;
    this.writeStore(allMemory);
    return merged;
  }

  appendDecisionTrail(userId: string, query: string, decision: string, notes: string[] = []): UserMemory {
    return this.upsertUserMemory({
      userId,
      notes,
      pastQueries: [query],
      pastDecisions: [decision]
    });
  }

  private mergeUnique(existing: string[], next?: string[]): string[] {
    return Array.from(new Set([...(existing ?? []), ...(next ?? [])]));
  }

  private ensureStore(): void {
    const dirPath = path.dirname(this.storePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(this.storePath)) {
      fs.writeFileSync(this.storePath, JSON.stringify({}, null, 2), "utf-8");
    }
  }

  private readStore(): MemoryStoreData {
    const content = fs.readFileSync(this.storePath, "utf-8");
    return JSON.parse(content) as MemoryStoreData;
  }

  private writeStore(data: MemoryStoreData): void {
    fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2), "utf-8");
  }
}
