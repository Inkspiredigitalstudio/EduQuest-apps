// Client wrapper around /api/articulation-ai (backed by the centralized
// Inky AI Engine — api/_lib/inkyEngine.ts, Gemini-powered). GEMINI_API_KEY
// never appears here — everything is a fetch() to our own server. Practice
// Mode only, except evaluateEssay which both Practice and Exam Mode call
// after submission (plan #9.1 Bahagian 20).

import { ArticulationLevel, EssayAiFeedback, EssaySections } from '../types';

// Why a coach call produced nothing. Shown to the student so a failure says
// what happened instead of leaving them looking at a spinner.
export type CoachFailureReason = 'masa' | 'kuota' | 'konfigurasi' | 'rangkaian' | 'lain';

export function coachFailureMessage(reason?: CoachFailureReason): string {
  switch (reason) {
    case 'masa':
      return 'AI mengambil masa terlalu lama untuk menjawab.';
    case 'kuota':
      return 'AI sedang sibuk (had penggunaan dicapai).';
    case 'konfigurasi':
      return 'AI belum disediakan dengan betul di pelayan.';
    case 'rangkaian':
      return 'Sambungan ke AI terputus. Semak internet anda.';
    default:
      return 'AI tidak dapat dihubungi buat masa ini.';
  }
}

// The server gives up on the model after 25s; this is a little longer so the
// server's own answer (with a reason) normally arrives first. Without a client
// limit a call that never returns left the student on "AI sedang menilai..."
// with no way out.
const CLIENT_TIMEOUT_MS = 40000;

async function callCoachRaw<T>(
  action: string,
  payload: Record<string, unknown>
): Promise<{ data: T | null; reason?: CoachFailureReason }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch('/api/articulation-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`AI coach action "${action}" failed with status ${res.status}`);
      let reason: CoachFailureReason = 'lain';
      try {
        const body = await res.json();
        if (body && typeof body.code === 'string') reason = body.code as CoachFailureReason;
      } catch {
        // non-JSON error page (e.g. a platform timeout) — keep the generic reason
      }
      if (res.status === 504) reason = 'masa';
      return { data: null, reason };
    }
    return { data: (await res.json()) as T };
  } catch (e) {
    console.warn(`AI coach action "${action}" failed:`, e);
    const aborted = e instanceof DOMException && e.name === 'AbortError';
    return { data: null, reason: aborted ? 'masa' : 'rangkaian' };
  } finally {
    clearTimeout(timer);
  }
}

async function callCoach<T>(action: string, payload: Record<string, unknown>): Promise<T | null> {
  return (await callCoachRaw<T>(action, payload)).data;
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

export async function evaluateEssay(
  question: string,
  level: ArticulationLevel,
  wordTarget: number | undefined,
  sections: EssaySections
): Promise<{ feedback: EssayAiFeedback | null; reason?: CoachFailureReason }> {
  const { data, reason } = await callCoachRaw<EssayAiFeedback>('evaluate', { question, level, wordTarget, sections });
  return { feedback: data, reason };
}
