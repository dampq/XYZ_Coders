import { OpenAI } from 'openai';
import { AGENT_PROMPTS, AGENT_TEMPERATURE } from '../config/agentPrompts';

// Lazy initialization - create client only when first used
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('❌ OPENAI_API_KEY is not set in environment variables');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized with API key');
  }
  return openai;
}

type AgentType = 'emotional' | 'technical' | 'expert' | 'critic';

export interface AgentResponse {
  agent: AgentType;
  role: string;
  response: string;
  confidence: 'Low' | 'Medium' | 'High';
  stance: 'supporting' | 'opposing' | 'neutral';
  keyPoints: string[];
}

export async function callAgent(
  agentType: AgentType,
  query: string
): Promise<AgentResponse> {
  const config = AGENT_PROMPTS[agentType];
  const temperature = AGENT_TEMPERATURE[agentType];

  try {
    console.log(`  → Calling ${config.name}...`);

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: config.systemPrompt,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: temperature,
      max_tokens: 800,
    });

    const responseText = response.choices[0].message.content || '';

    const stance = extractStance(responseText);
    const confidence = extractConfidence(responseText);
    const keyPoints = extractKeyPoints(responseText);

    console.log(`  ✅ ${config.name} responded - Stance: ${stance}`);

    return {
      agent: agentType,
      role: config.role,
      response: responseText,
      confidence,
      stance,
      keyPoints,
    };
  } catch (error) {
    console.error(`❌ Error calling ${config.name}:`, error);
    throw error;
  }
}

function extractStance(text: string): 'supporting' | 'opposing' | 'neutral' {
  const lower = text.toLowerCase();
  if (lower.includes('agree') || lower.includes('support') || lower.includes('positive')) {
    return 'supporting';
  }
  if (lower.includes('disagree') || lower.includes('oppose') || lower.includes('concern')) {
    return 'opposing';
  }
  return 'neutral';
}

function extractConfidence(text: string): 'Low' | 'Medium' | 'High' {
  const lower = text.toLowerCase();
  if (lower.includes('high confidence') || lower.includes('strongly')) return 'High';
  if (lower.includes('low confidence') || lower.includes('uncertain')) return 'Low';
  return 'Medium';
}

function extractKeyPoints(text: string): string[] {
  const points = text
    .split(/\n\d+\.|\n•|\n-/)
    .filter((p) => p.trim().length > 20)
    .slice(0, 3)
    .map((p) => p.trim().substring(0, 100));
  return points;
}