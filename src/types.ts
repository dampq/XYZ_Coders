export type PreferenceMap = Record<string, string | number | boolean>;

export interface UserMemory {
  userId: string;
  notes: string[];
  pastQueries: string[];
  pastDecisions: string[];
  preferences: PreferenceMap;
  updatedAt: string;
}

export interface DebateMessage {
  aiName: string;
  role: string;
  opinion: string;
  reasoning: string;
  counterarguments?: string[];
}

export interface DebateSummary {
  consensusScore: number;
  agreements: string[];
  conflicts: string[];
  highlights?: string[];
}

export interface AI6Request {
  userId: string;
  query: string;
  currentNotes?: string[];
  debate: DebateMessage[];
  debateSummary: DebateSummary;
}

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
}

export interface AI6Decision {
  finalDecision: string;
  reasoning: string;
  riskAnalysis: string[];
  roadmap: RoadmapStep[];
  personalizationSummary: string;
}
