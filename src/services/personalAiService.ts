import OpenAI from "openai";
import { config } from "../config";
import { AI6Decision, AI6Request, UserMemory } from "../types";
import { generateFallbackRoadmap } from "./roadmapGenerator";

export class PersonalAiService {
  private client: OpenAI | null;

  constructor() {
    this.client = config.openAiApiKey ? new OpenAI({ apiKey: config.openAiApiKey }) : null;
  }

  async synthesizeDecision(input: AI6Request, memory: UserMemory): Promise<AI6Decision> {
    if (!this.client) {
      return this.buildFallbackDecision(input, memory);
    }

    const prompt = [
      "You are AI6, a personal decision engine.",
      "Use the user's memory, current notes, and the debate panel results to produce a final decision.",
      "Return JSON with keys: finalDecision, reasoning, riskAnalysis, roadmap, personalizationSummary.",
      "Each roadmap item must contain: step, title, description.",
      "",
      `User query: ${input.query}`,
      `User notes: ${JSON.stringify(input.currentNotes ?? [])}`,
      `Stored memory: ${JSON.stringify(memory)}`,
      `Debate panel: ${JSON.stringify(input.debate)}`,
      `Debate summary: ${JSON.stringify(input.debateSummary)}`
    ].join("\n");

    const response = await this.client.chat.completions.create({
      model: config.openAiModel,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You produce structured, concise, personalized decisions."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return this.buildFallbackDecision(input, memory);
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AI6Decision>;
      const finalDecision = parsed.finalDecision ?? this.buildFallbackDecision(input, memory).finalDecision;

      return {
        finalDecision,
        reasoning: parsed.reasoning ?? "AI6 generated a decision using debate context and stored memory.",
        riskAnalysis: Array.isArray(parsed.riskAnalysis) && parsed.riskAnalysis.length > 0
          ? parsed.riskAnalysis
          : ["No explicit risks were returned by the model."],
        roadmap: Array.isArray(parsed.roadmap) && parsed.roadmap.length > 0
          ? parsed.roadmap
          : generateFallbackRoadmap(input.query, finalDecision),
        personalizationSummary: parsed.personalizationSummary ?? "Used available notes, preferences, and debate results."
      };
    } catch {
      return this.buildFallbackDecision(input, memory);
    }
  }

  private buildFallbackDecision(input: AI6Request, memory: UserMemory): AI6Decision {
    const noteSignals = [...memory.notes, ...(input.currentNotes ?? [])].slice(0, 5);
    const topAgreement = input.debateSummary.agreements[0] ?? "The panel has mixed opinions.";
    const topConflict = input.debateSummary.conflicts[0] ?? "No major conflict was identified.";
    const preferenceKeys = Object.keys(memory.preferences);

    const finalDecision = `Proceed with the option that best matches the strongest panel agreement while staying aligned with the user's history and preferences. Priority signal: ${topAgreement}`;

    return {
      finalDecision,
      reasoning: `AI6 considered prior user context, the current question, and the debate panel. The main supporting signal was "${topAgreement}" while the biggest caution was "${topConflict}".`,
      riskAnalysis: [
        topConflict,
        "User preferences may be incomplete, so the recommendation should be refined as more history is stored.",
        "If real-world constraints change, the roadmap should be updated before full commitment."
      ],
      roadmap: generateFallbackRoadmap(input.query, finalDecision),
      personalizationSummary: `Used ${noteSignals.length} note signals and ${preferenceKeys.length} stored preference categories to personalize the conclusion.`
    };
  }
}
