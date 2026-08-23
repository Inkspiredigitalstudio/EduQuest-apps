// Supabase data layer for PKSK Artikulasi Karangan (Track B) — separate
// from the SPPIM/PKSK-objective functions in supabase.ts. Writes to
// exam_attempts -> essay_answers -> essay_feedback_rounds, reusing the
// tables created during the exam_attempts generalization (plan #9.0)
// rather than creating duplicate tables. Round-based multiple attempts:
// each Practice submission is a new essay_feedback_rounds row under the
// SAME essay_answers row, not a new attempt (plan #9.0 recommendation).

import { supabase, isSupabaseConfigured } from './supabase';
import {
  ArticulationQuestion,
  ArticulationLevel,
  ArticulationMode,
  EssayAnswer,
  EssaySections,
  EssayFeedbackRound,
  EssayAiFeedback,
} from '../types';

const EXAM_DURATION_MS = 45 * 60 * 1000;

export function wordCount(sections: EssaySections): number {
  const text = [sections.pengenalan, ...(sections.isi || []), sections.penutup].join(' ');
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
}

export function encodeSections(sections: EssaySections): string {
  return JSON.stringify(sections);
}

export function decodeSections(raw: string | null | undefined, isiCount: number): EssaySections {
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          pengenalan: parsed.pengenalan || '',
          isi: Array.isArray(parsed.isi) && parsed.isi.length > 0 ? parsed.isi : Array(isiCount).fill(''),
          penutup: parsed.penutup || '',
        };
      }
    } catch {
      // fall through to blank default below
    }
  }
  return { pengenalan: '', isi: Array(isiCount).fill(''), penutup: '' };
}

export async function fetchArticulationQuestions(level?: ArticulationLevel): Promise<ArticulationQuestion[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase.from('articulation_questions').select('*').eq('is_active', true);
    if (level) query = query.eq('level', level);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as ArticulationQuestion[];
  } catch (e) {
    console.warn('Failed to fetch articulation questions:', e);
    return [];
  }
}

// Creates the exam_attempts row (module='PKSK', mode='practice'|'exam') and
// the essay_answers row that hangs off it. For Exam Mode, exam_start_time/
// exam_end_time are stamped here — the ONE moment that decides the
// deadline, so a page refresh recomputes remaining time from these
// server-stored timestamps rather than resetting the clock.
export async function startEssayAnswer(params: {
  userId: string;
  tingkatan: string;
  mode: ArticulationMode;
  question: ArticulationQuestion;
}): Promise<EssayAnswer | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { userId, tingkatan, mode, question } = params;

    const { data: attemptData, error: attemptErr } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: userId,
        module: 'PKSK',
        mode,
        tingkatan,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (attemptErr || !attemptData) throw attemptErr || new Error('Tiada attempt data dikembalikan.');

    const now = new Date();
    const examStart = mode === 'exam' ? now.toISOString() : null;
    const examEnd = mode === 'exam' ? new Date(now.getTime() + EXAM_DURATION_MS).toISOString() : null;

    const blankSections: EssaySections = { pengenalan: '', isi: [''], penutup: '' };
    const { data: essayData, error: essayErr } = await supabase
      .from('essay_answers')
      .insert({
        attempt_id: attemptData.id,
        articulation_question_id: question.id,
        tajuk_esei: question.question,
        draf_semasa: encodeSections(blankSections),
        jumlah_perkataan: 0,
        status: 'draf',
        exam_start_time: examStart,
        exam_end_time: examEnd,
      })
      .select()
      .single();
    if (essayErr || !essayData) throw essayErr || new Error('Tiada essay_answers data dikembalikan.');

    return essayData as EssayAnswer;
  } catch (e) {
    console.warn('Failed to start essay answer:', e);
    return null;
  }
}

export async function updateEssayDraft(essayAnswerId: string, sections: EssaySections): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('essay_answers')
      .update({ draf_semasa: encodeSections(sections), jumlah_perkataan: wordCount(sections) })
      .eq('id', essayAnswerId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn('Failed to save essay draft:', e);
    return false;
  }
}

// One Practice submission = one new round under the SAME essay_answers row
// (plan #9.0 round-based model) — never a new attempt/essay_answers row.
export async function submitFeedbackRound(
  essayAnswerId: string,
  sections: EssaySections,
  feedback: EssayAiFeedback
): Promise<EssayFeedbackRound | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { count } = await supabase
      .from('essay_feedback_rounds')
      .select('id', { count: 'exact', head: true })
      .eq('essay_answer_id', essayAnswerId);
    const pusingan = (count || 0) + 1;

    const { data, error } = await supabase
      .from('essay_feedback_rounds')
      .insert({
        essay_answer_id: essayAnswerId,
        pusingan,
        draf_dihantar: encodeSections(sections),
        maklum_balas_ai: JSON.stringify(feedback),
      })
      .select()
      .single();
    if (error || !data) throw error || new Error('Tiada round data dikembalikan.');

    await supabase
      .from('essay_answers')
      .update({
        draf_semasa: encodeSections(sections),
        jumlah_perkataan: wordCount(sections),
        skor_akhir: feedback.score,
      })
      .eq('id', essayAnswerId);

    return data as EssayFeedbackRound;
  } catch (e) {
    console.warn('Failed to submit feedback round:', e);
    return null;
  }
}

export async function lockFinalEssay(essayAnswerId: string, attemptId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('essay_answers')
      .update({ status: 'dikunci', dikunci_pada: new Date().toISOString() })
      .eq('id', essayAnswerId);
    if (error) throw error;

    // Non-fatal — exam_attempts.completed_at is a nice-to-have for
    // reporting, shouldn't block the lock itself if this update fails.
    await supabase.from('exam_attempts').update({ completed_at: new Date().toISOString() }).eq('id', attemptId);

    return true;
  } catch (e) {
    console.warn('Failed to lock final essay:', e);
    return false;
  }
}

export async function fetchFeedbackRounds(essayAnswerId: string): Promise<EssayFeedbackRound[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('essay_feedback_rounds')
      .select('*')
      .eq('essay_answer_id', essayAnswerId)
      .order('pusingan', { ascending: true });
    if (error) throw error;
    return (data || []) as EssayFeedbackRound[];
  } catch (e) {
    console.warn('Failed to fetch feedback rounds:', e);
    return [];
  }
}
