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

// Short machine-readable reason a call failed, so the student (and the logs)
// can tell "model overloaded" from "key missing" from "too slow".
export type InkyFailure = 'masa' | 'kuota' | 'konfigurasi' | 'rangkaian' | 'lain';

export function classifyInkyError(e: unknown): InkyFailure {
  const err = e as any;
  const text = `${err?.status ?? ''} ${err?.code ?? ''} ${err?.message ?? ''}`.toLowerCase();
  if (err?.name === 'TimeoutError' || text.includes('timeout') || text.includes('timed out') || text.includes('deadline')) return 'masa';
  if (text.includes('429') || text.includes('quota') || text.includes('resource_exhausted') || text.includes('rate')) return 'kuota';
  if (
    text.includes('404') || text.includes('not found') || text.includes('no longer available') || text.includes('model') ||
    text.includes('401') || text.includes('403') || text.includes('api key') || text.includes('api_key') ||
    text.includes('permission') || text.includes('belum dikonfigurasi')
  ) return 'konfigurasi';
  if (text.includes('fetch') || text.includes('econn') || text.includes('enotfound') || text.includes('network') || text.includes('503') || text.includes('502') || text.includes('500')) return 'rangkaian';
  return 'lain';
}

// Rejects with a TimeoutError if the model has not answered within `ms`.
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(Object.assign(new Error(`timeout ${ms}ms`), { name: 'TimeoutError' })), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}
