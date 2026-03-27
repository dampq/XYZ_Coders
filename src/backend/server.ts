import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local FIRST
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Debug: Check if API key is loaded
console.log('🔑 API Key Status:', process.env.OPENAI_API_KEY ? '✅ LOADED' : '❌ NOT FOUND');
console.log('📁 Looking for .env at:', path.resolve(__dirname, '../../.env.local'));

import askRouter from './routes/ask';
import debateRouter from './routes/debate';
import finalRouter from './routes/final';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log(`\n╔═══════════════════════════════════════════════════════╗`);
console.log(`║  🧠 AI ORCHESTRATION ENGINE - Backend Server         ║`);
console.log(`║  Starting on port ${PORT}...                          ║`);
console.log(`╚═══════════════════════════════════════════════════════╝\n`);

// Routes
app.use('/api/ask', askRouter);
app.use('/api/debate', debateRouter);
app.use('/api/final', finalRouter);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: '✅ AI Orchestration Backend Running',
    agents: ['emotional', 'technical', 'expert', 'critic'],
    timestamp: new Date(),
  });
});

// Info
app.get('/api/info', (req: Request, res: Response) => {
  res.json({
    service: 'Multi-Agent AI Debate System',
    description: 'Multiple AI agents collaborate and debate to reach intelligent decisions',
    version: '1.0.0',
    agents: 4,
    endpoints: [
      'POST /api/ask - Submit query to all agents',
      'POST /api/debate - Analyze debate and agreements',
      'POST /api/final - Generate final consensus',
    ],
  });
});

// Error Handler
app.use((err: any, req: Request, res: Response) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════════════╗`);
  console.log(`║  ✅ Server is running on http://localhost:${PORT}       ║`);
  console.log(`║  🧠 Agents: Emotional, Technical, Expert, Critic     ║`);
  console.log(`║  Ready to orchestrate multi-agent debates!           ║`);
  console.log(`╚═══════════════════════════════════════════════════════╝\n`);
});

export default app;