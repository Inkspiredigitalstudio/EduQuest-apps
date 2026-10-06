// Vercel serverless function (Node runtime, auto-detected from /api) — the
// "Edge Function" equivalent for UASA attempts per the architecture decision
// in this module's build: the app's own auth is hybrid (some sessions carry
// a real Supabase JWT, some run on a localStorage/demo fallback with none),
// so RLS's auth.uid()=user_id can silently block writes for the latter.
// Every uasa_attempts/uasa_attempt_answers WRITE goes through here with the
// service role key (bypasses RLS) instead of a client-side insert.
//
// SECURITY NOTE (read before relying on this): this endpoint trusts the
// user_id the client sends — same trust level the rest of this app already
// has (SPPIM/PKSK attempts, coin/xp updates) given the hybrid auth model.
// It is NOT a real per-user authorization check. The UASA_API_KEY shared
// secret below only filters out requests that didn't come through this app
// at all; it does not stop one logged-in student from samples claiming
// another student's user_id. Tightening that further needs a real auth
// overhaul of the whole app, out of scope here — flagging it honestly
// rather than pretending this header is full auth.
//
// Required Vercel env vars (Preview + Production):
//   VITE_SUPABASE_URL            (already set — reused here, not secret)
//   SUPABASE_SERVICE_ROLE_KEY    (NEW — Supabase Dashboard > Project Settings > API > service_role key.
//                                  NEVER prefix this with VITE_ — that would ship it to the browser.)
//   UASA_API_KEY                 (NEW — any random string; same value the client sends back, see src/lib/uasa.ts)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const apiKey = (process.env.UASA_API_KEY || '').trim();

function getServiceClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('UASA attempts endpoint belum configured: SUPABASE_SERVICE_ROLE_KEY atau VITE_SUPABASE_URL tiada di Vercel env vars.');
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

const EXAM_DURATION_MINUTES = 75;
const EXAM_COUNTS: Record<'A' | 'B' | 'C', number> = { A: 20, B: 20, C: 5 };
const BAHAGIAN_MAX_MARKS: Record<'A' | 'B' | 'C', number> = { A: 20, B: 20, C: 10 };

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface ActionResult {
  status: number;
  body: unknown;
}

async function drawExamQuestionSet(sb: SupabaseClient, subjectId: string, year: number) {
  const drawn: { id: string; bahagian: 'A' | 'B' | 'C'; marks: number }[] = [];

  for (const bahagian of ['A', 'B', 'C'] as const) {
    const need = EXAM_COUNTS[bahagian];
    const query = sb
      .from('uasa_questions')
      .select('id, marks')
      .eq('subject_id', subjectId)
      .eq('year', year)
      .eq('bahagian', bahagian)
      .eq('status', 'active');

    const { data, error } = bahagian === 'C' ? await query.eq('is_kbat', true) : await query;
    if (error) throw error;
    if (!data || data.length < need) {
      throw new Error(`Bank soalan Bahagian ${bahagian} tidak cukup (${data?.length || 0}/${need}) untuk subjek/tahun ini.`);
    }
    const picked = shuffle(data).slice(0, need);
    picked.forEach((q: any) => drawn.push({ id: q.id, bahagian, marks: q.marks }));
  }

  return drawn;
}

async function finalizeAttempt(sb: SupabaseClient, attemptId: string) {
  const { data: answers, error: ansErr } = await sb
    .from('uasa_attempt_answers')
    .select('id, bahagian, marks, is_correct, selected_choice_id')
    .eq('attempt_id', attemptId);
  if (ansErr) throw ansErr;

  const marksByBahagian: Record<'A' | 'B' | 'C', number> = { A: 0, B: 0, C: 0 };
  (answers || []).forEach((a: any) => {
    if (a.is_correct) marksByBahagian[a.bahagian as 'A' | 'B' | 'C'] += a.marks;
  });

  const totalMarks = marksByBahagian.A + marksByBahagian.B + marksByBahagian.C;
  const totalMax = BAHAGIAN_MAX_MARKS.A + BAHAGIAN_MAX_MARKS.B + BAHAGIAN_MAX_MARKS.C;

  const patch = {
    status: 'completed' as const,
    completed_at: new Date().toISOString(),
    marks_bahagian_a: marksByBahagian.A,
    marks_bahagian_b: marksByBahagian.B,
    marks_bahagian_c: marksByBahagian.C,
    total_marks: totalMarks,
    percent: Math.round((totalMarks / totalMax) * 100),
    percent_bahagian_a: Math.round((marksByBahagian.A / BAHAGIAN_MAX_MARKS.A) * 100),
    percent_bahagian_b: Math.round((marksByBahagian.B / BAHAGIAN_MAX_MARKS.B) * 100),
    percent_bahagian_c: Math.round((marksByBahagian.C / BAHAGIAN_MAX_MARKS.C) * 100),
  };

  const { data: attempt, error: updErr } = await sb
    .from('uasa_attempts')
    .update(patch)
    .eq('id', attemptId)
    .select()
    .single();
  if (updErr) throw updErr;

  // Wrong-answers-only review, with explanation — per spec, exam review never
  // shows the correct answers the student already got right.
  const { data: wrongRows, error: wrongErr } = await sb
    .from('uasa_attempt_answers')
    .select('question_id, bahagian, selected_choice_id, is_correct, uasa_questions(question_text, explanation, uasa_choices(id, option_text, is_correct))')
    .eq('attempt_id', attemptId)
    .or('is_correct.eq.false,is_correct.is.null');
  if (wrongErr) throw wrongErr;

  const wrongAnswers = (wrongRows || []).map((row: any) => {
    const q = row.uasa_questions;
    const correctChoice = q?.uasa_choices?.find((c: any) => c.is_correct);
    const selectedChoice = q?.uasa_choices?.find((c: any) => c.id === row.selected_choice_id);
    return {
      question_id: row.question_id,
      bahagian: row.bahagian,
      question_text: q?.question_text,
      explanation: q?.explanation,
      selected_option_text: selectedChoice?.option_text ?? null,
      correct_option_text: correctChoice?.option_text ?? null,
    };
  });

  return { attempt, wrongAnswers };
}

async function abandonAttempt(sb: SupabaseClient, attemptId: string) {
  const { error } = await sb
    .from('uasa_attempts')
    .update({ status: 'abandoned', completed_at: new Date().toISOString() })
    .eq('id', attemptId);
  if (error) throw error;
}

// Closes a leftover attempt without showing it to the student: one with real
// answers is scored like a normal finish (the record stays), an untouched one
// is marked abandoned so it doesn't appear as a 0% exam.
async function closeStaleAttempt(sb: SupabaseClient, attemptId: string) {
  const { count, error } = await sb
    .from('uasa_attempt_answers')
    .select('id', { count: 'exact', head: true })
    .eq('attempt_id', attemptId)
    .not('selected_choice_id', 'is', null);
  if (error) throw error;
  if (count) await finalizeAttempt(sb, attemptId);
  else await abandonAttempt(sb, attemptId);
}

async function runAction(action: string, payload: any): Promise<ActionResult> {
  const sb = getServiceClient();

  switch (action) {
    case 'start_exam': {
      const { user_id, year, subject_id, restart } = payload;
      if (!user_id || !year || !subject_id) {
        return { status: 400, body: { error: 'user_id, year, subject_id diperlukan.' } };
      }

      // Every open attempt for this exam, newest first. There can be more than
      // one (double-fired starts, old sittings nobody finished), and each one
      // left open would otherwise block the next start.
      const { data: openAttempts, error: openErr } = await sb
        .from('uasa_attempts')
        .select('*')
        .eq('user_id', user_id)
        .eq('subject_id', subject_id)
        .eq('year', year)
        .eq('module', 'exam')
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false });
      if (openErr) throw openErr;

      const now = Date.now();
      const isExpired = (a: any) => Boolean(a.deadline_at) && new Date(a.deadline_at).getTime() <= now;
      const expired = (openAttempts || []).filter(isExpired);
      const active = (openAttempts || []).filter((a: any) => !isExpired(a));

      if (restart) {
        // "Mula Semula": clear everything still open, then fall through to a fresh set.
        for (const a of active) await abandonAttempt(sb, a.id);
        for (const a of expired) await closeStaleAttempt(sb, a.id);
      } else if (active.length > 0) {
        const existing = active[0];
        for (const a of active.slice(1)) await abandonAttempt(sb, a.id);
        for (const a of expired) await closeStaleAttempt(sb, a.id);

        const { data: answerRows, error: answerErr } = await sb
          .from('uasa_attempt_answers')
          .select('order_index, bahagian, selected_choice_id, uasa_questions(id, question_text, explanation, image_url, uasa_choices(id, option_text, is_correct, order_index))')
          .eq('attempt_id', existing.id)
          .order('order_index', { ascending: true });
        if (answerErr) throw answerErr;

        const questions = (answerRows || []).map((row: any) => ({
          ...row.uasa_questions,
          bahagian: row.bahagian,
          choices: (row.uasa_questions?.uasa_choices || []).sort((a: any, b: any) => a.order_index - b.order_index),
        }));

        return {
          status: 200,
          body: {
            resumed: true,
            attempt_id: existing.id,
            deadline_at: existing.deadline_at,
            questions,
            answersMap: Object.fromEntries(
              (answerRows || []).filter((r: any) => r.selected_choice_id).map((r: any) => [r.uasa_questions.id, r.selected_choice_id])
            ),
          },
        };
      } else if (expired.length > 0) {
        // Time ran out while the app was closed: show that result once (the
        // result screen offers "Mula Semula"), and close the other leftovers
        // so the next start is a fresh exam.
        for (const a of expired.slice(1)) await closeStaleAttempt(sb, a.id);
        const result = await finalizeAttempt(sb, expired[0].id);
        return { status: 200, body: { expired: true, ...result } };
      }

      const drawn = await drawExamQuestionSet(sb, subject_id, year);
      const startedAt = new Date();
      const deadlineAt = new Date(startedAt.getTime() + EXAM_DURATION_MINUTES * 60 * 1000);

      const { data: attempt, error: attemptErr } = await sb
        .from('uasa_attempts')
        .insert({
          user_id,
          module: 'exam',
          year,
          subject_id,
          status: 'in_progress',
          total_questions: drawn.length,
          started_at: startedAt.toISOString(),
          deadline_at: deadlineAt.toISOString(),
        })
        .select()
        .single();
      if (attemptErr) throw attemptErr;

      const answerRowsToInsert = drawn.map((q, idx) => ({
        attempt_id: attempt.id,
        question_id: q.id,
        order_index: idx,
        bahagian: q.bahagian,
        marks: q.marks,
      }));
      const { error: insErr } = await sb.from('uasa_attempt_answers').insert(answerRowsToInsert);
      if (insErr) throw insErr;

      const { data: questionRows, error: qErr } = await sb
        .from('uasa_questions')
        .select('id, question_text, explanation, image_url, bahagian, uasa_choices(id, option_text, is_correct, order_index)')
        .in('id', drawn.map((q) => q.id));
      if (qErr) throw qErr;

      const byId = new Map((questionRows || []).map((q: any) => [q.id, q]));
      const questions = drawn.map((d) => {
        const q = byId.get(d.id);
        return { ...q, choices: (q?.uasa_choices || []).sort((a: any, b: any) => a.order_index - b.order_index) };
      });

      return { status: 200, body: { resumed: false, attempt_id: attempt.id, deadline_at: attempt.deadline_at, questions, answersMap: {} } };
    }

    case 'answer': {
      const { attempt_id, question_id, choice_id } = payload;
      if (!attempt_id || !question_id) return { status: 400, body: { error: 'attempt_id, question_id diperlukan.' } };

      const { data: attempt, error: attErr } = await sb.from('uasa_attempts').select('status, deadline_at').eq('id', attempt_id).single();
      if (attErr) throw attErr;
      if (attempt.status !== 'in_progress') return { status: 409, body: { error: 'Attempt ini sudah tamat.' } };
      if (attempt.deadline_at && new Date(attempt.deadline_at).getTime() <= Date.now()) {
        const result = await finalizeAttempt(sb, attempt_id);
        return { status: 200, body: { expired: true, ...result } };
      }

      let isCorrect: boolean | null = null;
      if (choice_id) {
        const { data: choice, error: choiceErr } = await sb.from('uasa_choices').select('is_correct').eq('id', choice_id).single();
        if (choiceErr) throw choiceErr;
        isCorrect = Boolean(choice.is_correct);
      }

      const { error: upErr } = await sb
        .from('uasa_attempt_answers')
        .update({ selected_choice_id: choice_id || null, is_correct: isCorrect, answered_at: new Date().toISOString() })
        .eq('attempt_id', attempt_id)
        .eq('question_id', question_id);
      if (upErr) throw upErr;

      return { status: 200, body: { ok: true } };
    }

    case 'finish_exam': {
      const { attempt_id } = payload;
      if (!attempt_id) return { status: 400, body: { error: 'attempt_id diperlukan.' } };
      const result = await finalizeAttempt(sb, attempt_id);
      return { status: 200, body: result };
    }

    case 'save_practice': {
      const { user_id, year, subject_id, chapter_id, answers } = payload;
      if (!user_id || !year || !subject_id || !chapter_id || !Array.isArray(answers)) {
        return { status: 400, body: { error: 'user_id, year, subject_id, chapter_id, answers[] diperlukan.' } };
      }

      const questionIds = answers.map((a: any) => a.question_id);
      const { data: choiceRows, error: choiceErr } = await sb
        .from('uasa_choices')
        .select('id, question_id, is_correct')
        .in('question_id', questionIds);
      if (choiceErr) throw choiceErr;

      let correctCount = 0;
      const answerRowsToInsert = answers.map((a: any, idx: number) => {
        const choice = (choiceRows || []).find((c: any) => c.id === a.choice_id && c.question_id === a.question_id);
        const isCorrect = Boolean(choice?.is_correct);
        if (isCorrect) correctCount += 1;
        return {
          question_id: a.question_id,
          order_index: idx,
          bahagian: 'A' as const, // practice is single-bab, bahagian not meaningful for scoring here
          marks: 1,
          selected_choice_id: a.choice_id || null,
          is_correct: isCorrect,
          answered_at: new Date().toISOString(),
        };
      });

      const percent = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

      const { data: attempt, error: attemptErr } = await sb
        .from('uasa_attempts')
        .insert({
          user_id,
          module: 'practice',
          year,
          subject_id,
          chapter_id,
          status: 'completed',
          total_questions: answers.length,
          total_marks: correctCount,
          percent,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (attemptErr) throw attemptErr;

      const { error: insErr } = await sb
        .from('uasa_attempt_answers')
        .insert(answerRowsToInsert.map((r) => ({ ...r, attempt_id: attempt.id })));
      if (insErr) console.warn('uasa_attempt_answers insert (practice) failed, attempt itself still saved:', insErr);

      return { status: 200, body: { attempt_id: attempt.id, percent } };
    }

    default:
      return { status: 400, body: { error: `Tindakan tidak dikenali: ${action}` } };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (apiKey) {
    const provided = req.headers['x-uasa-api-key'];
    if (provided !== apiKey) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const { action, payload } = body || {};

  if (!action || !payload) {
    res.status(400).json({ error: 'Permintaan tidak lengkap.' });
    return;
  }

  try {
    const result = await runAction(action, payload);
    res.status(result.status).json(result.body);
  } catch (e) {
    console.error('uasa-attempts error:', e);
    res.status(502).json({ error: e instanceof Error ? e.message : 'Ralat tidak dijangka.' });
  }
}
