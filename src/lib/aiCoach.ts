// Client wrapper around /api/articulation-ai (the Vercel serverless Gemini
// proxy). GEMINI_API_KEY never appears here — everything is a fetch() to
// our own server. Practice Mode only, except evaluateEssay which both
// Practice and Exam Mode call after submission (plan #9.1 Bahagian 20).

import { ArticulationLevel, EssayAiFeedback, EssaySections } from '../types';

async function callCoach<T>(action: string, payload: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch('/api/articulation-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    if (!res.ok) {
      console.warn(`AI coach action "${action}" failed with status ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.warn(`AI coach action "${action}" failed:`, e);
    return null;
  }
}

export interface FahamSoalanResult {
  topik: string;
  kehendak_soalan: string;
  sasaran: string;
  jenis_soalan: string;
  cadangan_bilangan_isi: number;
}

export function fetchFahamSoalan(question: string, topic: string, level: ArticulationLevel) {
  return callCoach<FahamSoalanResult>('faham_soalan', { question, topic, level });
}

export function fetchHint(question: string, level: ArticulationLevel, section: string, currentText: string) {
  return callCoach<{ text: string }>('hint', { question, level, section, currentText });
}

export function fetchSoalanPanduan(question: string, level: ArticulationLevel, section: string, currentText: string) {
  return callCoach<{ text: string }>('soalan_panduan', { question, level, section, currentText });
}

export function fetchIdea(question: string, topic: string, level: ArticulationLevel, section: string) {
  return callCoach<{ ideas: string[] }>('idea', { question, topic, level, section });
}

export function fetchKosaKata(word: string, level: ArticulationLevel, context?: string) {
  return callCoach<{ suggestions: string[] }>('kosa_kata', { word, level, context });
}

export function fetchPeribahasa(context: string, level: ArticulationLevel) {
  return callCoach<{ suggestions: string[] }>('peribahasa', { context, level });
}

export function fetchBaikiAyat(sentence: string, level: ArticulationLevel) {
  return callCoach<{ text: string }>('baiki_ayat', { sentence, level });
}

export function evaluateEssay(
  question: string,
  level: ArticulationLevel,
  wordTarget: number | undefined,
  sections: EssaySections
) {
  return callCoach<EssayAiFeedback>('evaluate', { question, level, wordTarget, sections });
}
