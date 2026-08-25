// Centralized Inky AI Engine — Gemini-backed, server-side only.
//
// Every AI Coach/Evaluator/Explain call across EduQuest should go through
// this one module instead of each feature wiring its own Gemini client.
// PKSK Artikulasi (api/articulation-ai.ts) is the first caller; future
// modules (Math/Science/BM/BI Coach, other exam banks) reuse the same
// inkyAsk() helper rather than duplicating the Gemini integration.
//
// GEMINI_API_KEY never leaves the server — Vercel picks this file up only
// as a shared library (the `_` prefix excludes it from routing), never as
// its own route, and it's never imported from src/.

import { GoogleGenAI, Type, Schema } from '@google/genai';

// gemini-2.5-flash returned 404 for this API key ("no longer available to
// new users") — Google's own error pointed at gemini-3.6-flash as the
// replacement. Pin here and swap this one constant if Google moves the
// line again. Do not point production at a "-latest" alias.
const MODEL = 'gemini-3.6-flash';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY belum dikonfigurasi di server.');
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export { Type };
export type { Schema };

// Generic structured-JSON call — every Inky action funnels through this.
// `systemInstruction` carries the coach/evaluator persona and rules;
// `schema` constrains the JSON shape so callers get predictable data
// instead of parsing free text.
export async function inkyAsk<T>(params: {
  systemInstruction: string;
  prompt: string;
  schema: Schema;
}): Promise<T> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: params.prompt,
    config: {
      systemInstruction: params.systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: params.schema,
    },
  });
  const text = response.text;
  if (!text) throw new Error('AI tidak mengembalikan output.');
  return JSON.parse(text) as T;
}
