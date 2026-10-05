// UASA module — fully independent of PKSK/SPPIM. Content reads go straight
// to Supabase (public SELECT RLS, same convention as subjects/pksk_subjects).
// All attempt WRITES go through /api/uasa-attempts (service role) instead of
// a direct client insert — see that file's header comment for why: this
// app's auth is hybrid (some sessions have a real Supabase JWT, some run on
// a localStorage/demo fallback with none), so RLS's auth.uid()=user_id would
// silently block writes for the latter.
import { supabase, isSupabaseConfigured } from './supabase';
import { UasaSubject, UasaChapter, UasaQuestion, UasaYear, UasaBahagian } from '../types';

// Client-exposed twin of the server's UASA_API_KEY. NOT a real secret (it's
// in the browser bundle) — it only filters out requests that never went
// through this app at all. Real trust boundary is documented in
// api/uasa-attempts.ts.
const UASA_API_KEY = (import.meta.env.VITE_UASA_API_KEY || '').trim();

async function callUasaApi<T = any>(action: string, payload: any): Promise<T> {
  const res = await fetch('/api/uasa-attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(UASA_API_KEY ? { 'x-uasa-api-key': UASA_API_KEY } : {}),
    },
    body: JSON.stringify({ action, payload }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || `UASA API gagal (status ${res.status}).`);
  }
  return body as T;
}

export async function fetchUasaSubjects(): Promise<UasaSubject[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('uasa_subjects').select('*').eq('status', 'active').order('name');
  if (error) {
    console.warn('fetchUasaSubjects failed:', error);
    return [];
  }
  return data || [];
}

export async function fetchUasaChapters(subjectId: string, year: UasaYear): Promise<UasaChapter[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('uasa_chapters')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('year', year)
    .eq('status', 'active')
    .order('order_index');
  if (error) {
    console.warn('fetchUasaChapters failed:', error);
    return [];
  }
  return data || [];
}

export async function fetchUasaQuestionsForChapter(chapterId: string): Promise<UasaQuestion[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('uasa_questions')
    .select('*, uasa_choices(*)')
    .eq('chapter_id', chapterId)
    .eq('status', 'active');
  if (error) {
    console.warn('fetchUasaQuestionsForChapter failed:', error);
    return [];
  }
  return (data || []).map((q: any) => ({
    ...q,
    choices: (q.uasa_choices || []).sort((a: any, b: any) => a.order_index - b.order_index),
  }));
}

// Checks whether at least one bab under this subject/year has active
// questions — used to decide whether to show "Belum ada soalan" instead of
// an empty chapter list.
export async function uasaSubjectHasContent(subjectId: string, year: UasaYear): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { count, error } = await supabase
    .from('uasa_questions')
    .select('id', { count: 'exact', head: true })
    .eq('subject_id', subjectId)
    .eq('year', year)
    .eq('status', 'active');
  if (error) return false;
  return (count || 0) > 0;
}

export interface UasaPracticeSaveResult {
  attempt_id: string;
  percent: number;
}

export async function saveUasaPracticeAttempt(params: {
  user_id: string;
  year: UasaYear;
  subject_id: string;
  chapter_id: string;
  answers: { question_id: string; choice_id: string | null }[];
}): Promise<UasaPracticeSaveResult> {
  return callUasaApi('save_practice', params);
}

export interface UasaExamQuestion extends UasaQuestion {
  bahagian: UasaBahagian;
}

export interface UasaStartExamResult {
  resumed: boolean;
  expired?: boolean;
  attempt_id: string;
  deadline_at: string;
  questions: UasaExamQuestion[];
  answersMap: Record<string, string>;
  attempt?: any;
  wrongAnswers?: any[];
}

export async function startOrResumeUasaExam(params: { user_id: string; year: UasaYear; subject_id: string }): Promise<UasaStartExamResult> {
  return callUasaApi('start_exam', params);
}

export async function submitUasaExamAnswer(params: { attempt_id: string; question_id: string; choice_id: string | null }): Promise<{ ok?: boolean; expired?: boolean; attempt?: any; wrongAnswers?: any[] }> {
  return callUasaApi('answer', params);
}

export interface UasaWrongAnswer {
  question_id: string;
  bahagian: UasaBahagian;
  question_text: string;
  explanation: string;
  selected_option_text: string | null;
  correct_option_text: string | null;
}

export interface UasaFinishExamResult {
  attempt: {
    id: string;
    percent: number;
    percent_bahagian_a: number;
    percent_bahagian_b: number;
    percent_bahagian_c: number;
    marks_bahagian_a: number;
    marks_bahagian_b: number;
    marks_bahagian_c: number;
    total_marks: number;
  };
  wrongAnswers: UasaWrongAnswer[];
}

export async function finishUasaExam(attemptId: string): Promise<UasaFinishExamResult> {
  return callUasaApi('finish_exam', { attempt_id: attemptId });
}
