// ─── foliService.ts ───────────────────────────────────────────────────────────
// All Anthropic API calls for Foli go through here.
// Drop this in src/services/foliService.ts

import { buildFoliSystemPrompt, FoliUserContext } from './foliPrompt';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FoliResponse {
  message: string;
  error?: string;
}

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

// ─── Main chat function ───────────────────────────────────────────────────────
// Pass the full conversation history so Foli remembers context across turns.
export async function sendToFoli(
  userMessage: string,
  history: ChatMessage[],
  userContext: FoliUserContext
): Promise<FoliResponse> {
  const systemPrompt = buildFoliSystemPrompt(userContext);

  // Build messages array — history + new message
  const messages: ChatMessage[] = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Foli API error:', err);
      return { message: '', error: 'Foli is unavailable right now. Try again in a moment.' };
    }

    const data = await response.json();
    const message = data.content?.[0]?.text ?? '';
    return { message };

  } catch (err) {
    console.error('Foli network error:', err);
    return { message: '', error: 'Connection issue. Check your internet and try again.' };
  }
}

// ─── Generate a personalised check-in insight ────────────────────────────────
// Called after user completes a scalp check-in. Returns a short insight.
export async function generateCheckinInsight(
  checkinData: {
    symptoms: string[];
    notes: string;
    rating: number; // 1–5 scalp feel rating
  },
  userContext: FoliUserContext
): Promise<FoliResponse> {
  const systemPrompt = buildFoliSystemPrompt(userContext);

  const prompt = `
The user just completed a scalp check-in. Here's what they logged:
- Symptoms today: ${checkinData.symptoms.join(', ') || 'none'}
- Their note: "${checkinData.notes || 'no note added'}"
- Scalp feel rating: ${checkinData.rating}/5

Give them a brief, personalised insight (2–3 sentences max) based on:
1. What they logged today vs their known concerns
2. How long their current style has been in
3. One specific thing they can do in the next 24 hours

Do not repeat back what they said. Give them something new and useful.
`.trim();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return { message: data.content?.[0]?.text ?? '' };
  } catch {
    return { message: '', error: 'Could not generate insight.' };
  }
}

// ─── Generate product recommendations ────────────────────────────────────────
// Takes user concerns + hair type, returns structured reco text.
// Will be replaced once products Supabase table is built.
export async function generateProductRecommendations(
  userContext: FoliUserContext,
  specificIssue?: string
): Promise<FoliResponse> {
  const systemPrompt = buildFoliSystemPrompt(userContext);

  const prompt = `
The user wants product recommendations${specificIssue ? ` specifically for: ${specificIssue}` : ''}.

Based on their profile, recommend 3 product TYPES (not brands yet) they should look for.
For each:
- Name the product type
- Explain in one sentence why it suits their specific hair type and concerns
- Give one ingredient to look for and one to avoid

Format as a clean list. Be specific to ${userContext.hairType} hair. No generic advice.
`.trim();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return { message: data.content?.[0]?.text ?? '' };
  } catch {
    return { message: '', error: 'Could not generate recommendations.' };
  }
}