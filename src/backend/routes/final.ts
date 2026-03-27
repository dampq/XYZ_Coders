import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { query, responses, debateData } = req.body;

    console.log('\n🏆 FINAL VERDICT GENERATION\n');

    const confidenceMap = { High: 0.8, Medium: 0.6, Low: 0.3 };
    
    const avgConfidence = responses.reduce(
      (sum: number, r: any) => sum + (confidenceMap[r.confidence as keyof typeof confidenceMap] || 0.5),
      0
    ) / responses.length;

    const consensus = {
      query,
      finalVerdict: debateData.majorityStance.toUpperCase(),
      confidenceLevel: `${(avgConfidence * 100).toFixed(1)}%`,
      supportingAgents: responses
        .filter((r: any) => r.stance === 'supporting')
        .map((r: any) => r.agent),
      opposingAgents: responses
        .filter((r: any) => r.stance === 'opposing')
        .map((r: any) => r.agent),
      summary: `Based on multi-agent debate analysis, the consensus is: ${debateData.majorityStance}`,
    };

    console.log(`\n✅ Final Verdict: ${consensus.finalVerdict}`);
    console.log(`Confidence: ${consensus.confidenceLevel}\n`);

    res.json({
      success: true,
      consensus,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;