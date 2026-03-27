import express, { Request, Response } from 'express';
import { debateEngine } from '../services/debateEngine';
import { AgentResponse } from '../services/llmHandler';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'responses array required' });
    }

    console.log('\n🔥 DEBATE PHASE STARTED\n');

    const agreement = debateEngine.detectAgreement(responses as AgentResponse[]);

    const counterarguments = await debateEngine.generateCounterarguments(
      responses as AgentResponse[],
      agreement
    );

    res.json({
      success: true,
      debateGroups: {
        supporting: agreement.groups.supporting.length,
        opposing: agreement.groups.opposing.length,
        neutral: agreement.groups.neutral.length,
      },
      majorityStance: agreement.majorityStance,
      agentAgreements: Object.fromEntries(agreement.agentPairs),
      counterarguments: Object.fromEntries(counterarguments),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;