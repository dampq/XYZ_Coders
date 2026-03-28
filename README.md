# Person 3 Module: Memory + Personal AI (AI6)

This package implements only the Person 3 responsibilities for the Multi-Agent Decision Engine:

- User memory system
- Personal AI (AI6)
- Final decision synthesis
- Personalized roadmap generation

It is built as a standalone backend service so it can be pushed to GitHub now and merged later with the rest of the team project.

## What this module does

### 1. Memory System

Stores:

- User notes
- Past queries
- Past decisions
- User preferences

The default storage is a local JSON file for quick team development. You can later replace it with MongoDB or Supabase without changing the route contract.

### 2. Personal AI (AI6)

Accepts:

- User history from the memory store
- Current user query
- Current notes
- Debate panel outputs from the other teammates' modules

Returns:

- Final personalized decision
- Reasoning summary
- Risk analysis
- Step-by-step roadmap

If `OPENAI_API_KEY` is not configured, the service still works using a fallback local synthesizer so your module can be demoed immediately.

### 3. Roadmap Generator

Generates a practical sequence of next steps from the final AI6 decision.

## Project structure

```text
src/
  app.ts
  config.ts
  server.ts
  types.ts
  validators.ts
  routes/
    ai6Routes.ts
    memoryRoutes.ts
  services/
    memoryStore.ts
    personalAiService.ts
    roadmapGenerator.ts
```

## Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set values if you want live LLM synthesis.

## Environment variables

```env
PORT=4000
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
MEMORY_STORE_PATH=./data/memory-store.json
```

## API contract

### Health check

`GET /health`

### Upsert user memory

`POST /api/memory`

```json
{
  "userId": "user-123",
  "notes": ["I prefer stability before risk."],
  "pastQueries": ["Should I freelance full time?"],
  "pastDecisions": ["Keep freelancing as a side income first."],
  "preferences": {
    "riskTolerance": "medium",
    "careerGoal": "build a startup later"
  }
}
```

### Get user memory

`GET /api/memory/:userId`

### Generate AI6 final decision

`POST /api/ai6/decision`

```json
{
  "userId": "user-123",
  "query": "Should I start a startup or take a job?",
  "currentNotes": [
    "I need income soon.",
    "I still want to build my own company."
  ],
  "debate": [
    {
      "aiName": "AI1",
      "role": "Emotional",
      "opinion": "Follow your passion and start now.",
      "reasoning": "You care deeply about the idea."
    },
    {
      "aiName": "AI2",
      "role": "Technical",
      "opinion": "A job gives you runway and skills first.",
      "reasoning": "Resources are limited and execution risk is high."
    },
    {
      "aiName": "AI4",
      "role": "Critic",
      "opinion": "Starting immediately is too risky.",
      "reasoning": "There is not enough validation yet.",
      "counterarguments": [
        "Passion alone does not reduce market risk."
      ]
    }
  ],
  "debateSummary": {
    "consensusScore": 67,
    "agreements": [
      "Financial stability matters before taking a large risk."
    ],
    "conflicts": [
      "Passion-driven urgency conflicts with practical stability."
    ],
    "highlights": [
      "A phased approach may satisfy both ambition and safety."
    ]
  }
}
```

## Expected response shape

```json
{
  "userMemory": {
    "userId": "user-123",
    "notes": [],
    "pastQueries": [],
    "pastDecisions": [],
    "preferences": {},
    "updatedAt": "2026-03-28T00:00:00.000Z"
  },
  "decision": {
    "finalDecision": "Take the job first while building the startup gradually.",
    "reasoning": "The debate favored stability and the user's notes support that path.",
    "riskAnalysis": [
      "Starting immediately may create financial pressure.",
      "Waiting too long could reduce momentum."
    ],
    "roadmap": [
      {
        "step": 1,
        "title": "Secure income",
        "description": "Take the job that strengthens your skills and stability."
      }
    ],
    "personalizationSummary": "Used notes and stored preferences to tailor the answer."
  }
}
```

## How teammates can integrate this

- Debate engine team sends the debate transcript and summary to `POST /api/ai6/decision`.
- Frontend team can call memory routes when the user saves notes or preferences.
- AI6 response can be displayed as the final decision card and roadmap section.

## GitHub-ready notes

- This module is independent and safe to commit on its own.
- The data store is local by default, so no database setup is required for first push.
- When the team is ready, swap the `MemoryStore` implementation with MongoDB or Supabase and keep the same API routes.
