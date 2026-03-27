import { AgentResponse } from './llmHandler';

export interface DebateGroup {
  supporting: AgentResponse[];
  opposing: AgentResponse[];
  neutral: AgentResponse[];
}

export interface AgreementAnalysis {
  agentPairs: Map<string, number>;
  groups: DebateGroup;
  majorityStance: 'supporting' | 'opposing' | 'neutral';
}

export class DebateEngine {
  /**
   * Detect agreement/disagreement between agents
   */
  detectAgreement(responses: AgentResponse[]): AgreementAnalysis {
    console.log('\n📊 Analyzing Agreement Levels...');

    const groups: DebateGroup = {
      supporting: responses.filter((r) => r.stance === 'supporting'),
      opposing: responses.filter((r) => r.stance === 'opposing'),
      neutral: responses.filter((r) => r.stance === 'neutral'),
    };

    const agentPairs = new Map<string, number>();

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const r1 = responses[i];
        const r2 = responses[j];

        let score = 0;

        if (r1.stance === r2.stance) {
          score = 0.8;
        } else if (r1.stance === 'neutral' || r2.stance === 'neutral') {
          score = 0.5;
        } else {
          score = 0.2;
        }

        const key = `${r1.agent}-${r2.agent}`;
        agentPairs.set(key, score);
      }
    }

    const stanceCounts = {
      supporting: groups.supporting.length,
      opposing: groups.opposing.length,
      neutral: groups.neutral.length,
    };

    let majorityStance: 'supporting' | 'opposing' | 'neutral' = 'neutral';
    let maxCount = 0;

    for (const [stance, count] of Object.entries(stanceCounts)) {
      if (count > maxCount) {
        maxCount = count;
        majorityStance = stance as 'supporting' | 'opposing' | 'neutral';
      }
    }

    console.log(`\n  ✅ Supporting: ${groups.supporting.length} agents`);
    console.log(`  ❌ Opposing: ${groups.opposing.length} agents`);
    console.log(`  ⚪ Neutral: ${groups.neutral.length} agents`);
    console.log(`\n  Majority Stance: ${majorityStance.toUpperCase()}`);

    return {
      agentPairs,
      groups,
      majorityStance,
    };
  }

  /**
   * Generate counterarguments for opposing views
   */
  async generateCounterarguments(
    responses: AgentResponse[],
    agreement: AgreementAnalysis
  ): Promise<Map<string, string>> {
    console.log('\n🔄 Generating Counterarguments...');

    const counterarguments = new Map<string, string>();

    for (const response of responses) {
      if (response.stance === agreement.majorityStance) {
        const counter = `The opposing view might argue: "${response.response.substring(0, 100)}..." is incomplete because it doesn't consider multiple perspectives.`;
        counterarguments.set(`${response.agent}-counter`, counter);
      }
    }

    return counterarguments;
  }
}

export const debateEngine = new DebateEngine();