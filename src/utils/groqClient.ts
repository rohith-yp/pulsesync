// PulseSync AI — Groq API Client
// Model: llama-3.1-8b-instant

// API key is loaded from the VITE_GROQ_API_KEY environment variable.
// Set it in a .env file in the project root (see .env.example).
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;

if (!GROQ_API_KEY) {
  console.error(
    '[PulseSync] VITE_GROQ_API_KEY is not set. ' +
    'Create a .env file in the project root and add:\n' +
    '  VITE_GROQ_API_KEY=your_groq_api_key_here'
  );
}

const GROQ_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '/api-groq/openai/v1/chat/completions'
  : 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const groqChat = async (messages: GroqMessage[]): Promise<string> => {
  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'No response from AI.';
};

// Preset system prompts for each feature
export const SYSTEM_PROMPTS = {
  assistant: `You are PulseSync AI, an intelligent hospital operations assistant. 
You help hospital administrators and department heads with real-time clinical intelligence.
Keep answers concise (under 120 words), actionable, and clinically relevant.
You have access to live hospital data including patient inflow, staff burnout scores, bed occupancy, and AI alerts.
Always speak in present-tense about current hospital conditions.`,

  inflowAnalysis: `You are a hospital surge prediction AI. 
Analyze the given department data and provide exactly 3 bullet-point actionable recommendations.
Each bullet should be under 20 words. Focus on staff allocation, bed management, and patient flow.
Format: • [Action]: [Reason]`,

  crisisNarrative: `You are a hospital emergency response coordinator AI.
Given a crisis scenario, provide a concise 3-step response protocol.
Each step should be under 25 words. Be direct and operational.`,

  alertRecommendation: `You are a hospital AI alert system. 
Given an alert, provide 2 concise recommended actions (under 15 words each).
Format as numbered list.`,
};
