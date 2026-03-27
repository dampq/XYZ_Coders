import express, { Request, Response } from 'express';
import { callAgent } from '../services/llmHandler';

const router = express.Router();

type AgentType = 'emotional' | 'technical' | 'expert' | 'critic';

router.post('/', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query required' });
    }

    console.log('\n' + '═'.repeat(70));
    console.log('🎯 NEW DEBATE SESSION STARTED');
    console.log('═'.repeat(70));
    console.log(`\n📝 Query: "${query}"\n`);

    const agents: AgentType[] = ['emotional', 'technical', 'expert', 'critic'];

    console.log('📤 Calling All Agents:\n');

    const responses = await Promise.all(
      agents.map((agent) => callAgent(agent, query))
    );

    console.log('\n✅ All agents responded!\n');

    res.json({
      success: true,
      query,
      responses: responses.map((r) => ({
        agent: r.agent,
        role: r.role,
        stance: r.stance,
        confidence: r.confidence,
        response: r.response,
        keyPoints: r.keyPoints,
      })),
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;