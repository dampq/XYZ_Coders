import { RoadmapStep } from "../types";

export function generateFallbackRoadmap(query: string, decision: string): RoadmapStep[] {
  return [
    {
      step: 1,
      title: "Clarify the target",
      description: `Turn the decision into a specific outcome for: ${query}`
    },
    {
      step: 2,
      title: "Reduce uncertainty",
      description: "Validate the biggest assumption with one small low-risk action."
    },
    {
      step: 3,
      title: "Commit to execution",
      description: `Start acting on this direction: ${decision}`
    }
  ];
}
