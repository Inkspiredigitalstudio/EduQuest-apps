// Vercel serverless function (Node runtime) — admin-only CRUD + bulk import
// for uasa_subjects/uasa_chapters/uasa_questions/uasa_choices.
//
// WHY THIS EXISTS (not a direct client insert): uasa_questions/uasa_choices
// RLS only grants public SELECT — no insert/update/delete policy for
// anon/authenticated. That's deliberate: this repo's PKSK tables
// (pksk_questions/pksk_choices) carry a "Public can insert/update/delete"
// policy with qual=true, meaning ANY anon key holder can write PKSK content
// with no admin check at all. That's a real, pre-existing risk — not
// something I introduced — and I'm not repeating it here. All UASA content
// writes go through this endpoint with the service role key instead.
//
// ADMIN CHECK — honest limits: this endpoint trusts the admin_user_id the
// client sends, then looks up that id's role in `users` (service role,
// bypasses RLS) and requires role === 'admin'. That stops a random anon
// visitor, but not a student who already knows another user's id, since
// there's no real server-side session/JWT verification backing it — same
// hybrid-auth ceiling as the rest of this app (see api/uasa-attempts.ts).
//
// Required Vercel env vars — same ones as api/uasa-attempts.ts:
//   VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, UASA_API_KEY

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const apiKey = (process.env.UASA_API_KEY || '').trim();

function getServiceClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('UASA content endpoint belum configured: SUPABASE_SERVICE_ROLE_KEY atau VITE_SUPABASE_URL tiada di Vercel env vars.');
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

async function requireAdmin(sb: SupabaseClient, adminUserId: string) {
  if (!adminUserId) throw new Error('admin_user_id diperlukan.');
  const { data, error } = await sb.from('users').select('role').eq('id', adminUserId).single();
  if (error || !data || data.role !== 'admin') {
    const err: any = new Error('Akses ditolak: akaun ini bukan admin.');
    err.statusCode = 403;
    throw err;
  }
}

interface ChoiceInput {
  option_text: string;
  is_correct: boolean;
}

interface QuestionInput {
  chapter_id: string;
  subject_id: string;
  year: number;
  question_text: string;
  explanation?: string;
  bahagian: 'A' | 'B' | 'C';
  difficulty?: number;
  is_kbat?: boolean;
  marks?: number;
  image_url?: string;
  status?: string;
  choices: ChoiceInput[];
}

// Server-side validation — defense in depth, not just trusting the client
// validator. Per spec: exactly 4 choices, exactly 1 correct, non-empty
// text/explanation. "Balanced answer distribution" and "no duplicates" are
// batch-level checks, done separately in bulk_import below (a single
// create_question call has no batch to check balance/duplicates against).
function validateQuestionShape(q: QuestionInput): string[] {
  const errors: string[] = [];
  if (!q.question_text || !q.question_text.trim()) errors.push('Teks soalan kosong.');
  if (!q.explanation || !q.explanation.trim()) errors.push('Penerangan kosong.');
  if (!q.chapter_id) errors.push('chapter_id diperlukan.');
  if (!['A', 'B', 'C'].includes(q.bahagian)) errors.push('Bahagian mesti A, B atau C.');
  if (!Array.isArray(q.choices) || q.choices.length !== 4) errors.push(`Mesti tepat 4 pilihan (dapat ${q.choices?.length ?? 0}).`);
  else {
    const correctCount = q.choices.filter((c) => c.is_correct).length;
    if (correctCount !== 1) errors.push(`Mesti tepat 1 jawapan betul (dapat ${correctCount}).`);
    q.choices.forEach((c, i) => {
      if (!c.option_text || !c.option_text.trim()) errors.push(`Pilihan ${i + 1} kosong.`);
    });
  }
  return errors;
}

async function insertQuestionWithChoices(sb: SupabaseClient, q: QuestionInput) {
  const { data: question, error: qErr } = await sb
    .from('uasa_questions')
    .insert({
      chapter_id: q.chapter_id,
      subject_id: q.subject_id,
      year: q.year,
      question_text: q.question_text,
      explanation: q.explanation,
      bahagian: q.bahagian,
      difficulty: q.difficulty ?? 1,
      is_kbat: q.is_kbat ?? false,
      marks: q.marks ?? 1,
      image_url: q.image_url || null,
      status: q.status ?? 'draft',
    })
    .select()
    .single();
  if (qErr) throw qErr;

  const { error: cErr } = await sb.from('uasa_choices').insert(
    q.choices.map((c, idx) => ({ question_id: question.id, option_text: c.option_text, is_correct: c.is_correct, order_index: idx }))
  );
  if (cErr) throw cErr;

  return question;
}

interface ActionResult {
  status: number;
  body: unknown;
}

async function runAction(action: string, payload: any): Promise<ActionResult> {
  const sb = getServiceClient();

  switch (action) {
    case 'create_subject': {
      await requireAdmin(sb, payload.admin_user_id);
      const { data, error } = await sb.from('uasa_subjects').insert(payload.subject).select().single();
      if (error) throw error;
      return { status: 200, body: data };
    }

    case 'update_subject': {
      await requireAdmin(sb, payload.admin_user_id);
      const { data, error } = await sb.from('uasa_subjects').update(payload.patch).eq('id', payload.subject_id).select().single();
      if (error) throw error;
      return { status: 200, body: data };
    }

    case 'create_chapter': {
      await requireAdmin(sb, payload.admin_user_id);
      const { data, error } = await sb.from('uasa_chapters').insert(payload.chapter).select().single();
      if (error) throw error;
      return { status: 200, body: data };
    }

    case 'update_chapter': {
      await requireAdmin(sb, payload.admin_user_id);
      const { data, error } = await sb.from('uasa_chapters').update(payload.patch).eq('id', payload.chapter_id).select().single();
      if (error) throw error;
      return { status: 200, body: data };
    }

    case 'create_question': {
      await requireAdmin(sb, payload.admin_user_id);
      const errors = validateQuestionShape(payload.question);
      if (errors.length > 0) return { status: 400, body: { error: errors.join(' ') } };
      const question = await insertQuestionWithChoices(sb, payload.question);
      return { status: 200, body: question };
    }

    case 'update_question': {
      await requireAdmin(sb, payload.admin_user_id);
      const { question_id, patch, choices } = payload;
      if (choices) {
        const errors = validateQuestionShape({ ...patch, choices } as QuestionInput);
        if (errors.length > 0) return { status: 400, body: { error: errors.join(' ') } };
      }

      const { data: updated, error: updErr } = await sb.from('uasa_questions').update(patch).eq('id', question_id).select().single();
      if (updErr) throw updErr;

      if (choices) {
        // Update the 4 existing choice rows IN PLACE by order_index, rather
        // than delete+reinsert — a past attempt's
        // uasa_attempt_answers.selected_choice_id references a choice row,
        // and that FK has no ON DELETE behaviour, so deleting choices out
        // from under a historical attempt would break it.
        const { data: existing, error: exErr } = await sb
          .from('uasa_choices')
          .select('id, order_index')
          .eq('question_id', question_id)
          .order('order_index');
        if (exErr) throw exErr;

        if (existing && existing.length === choices.length) {
          for (let i = 0; i < choices.length; i++) {
            const { error: cUpdErr } = await sb
              .from('uasa_choices')
              .update({ option_text: choices[i].option_text, is_correct: choices[i].is_correct })
              .eq('id', existing[i].id);
            if (cUpdErr) throw cUpdErr;
          }
        } else {
          // Choice count mismatch (shouldn't happen once validator ran) —
          // fall back to replace, but only reachable if no existing rows
          // conflict in shape.
          await sb.from('uasa_choices').delete().eq('question_id', question_id);
          await sb.from('uasa_choices').insert(choices.map((c: ChoiceInput, idx: number) => ({ question_id, option_text: c.option_text, is_correct: c.is_correct, order_index: idx })));
        }
      }

      return { status: 200, body: updated };
    }

    case 'delete_question': {
      await requireAdmin(sb, payload.admin_user_id);
      const { question_id } = payload;
      const { error: cErr } = await sb.from('uasa_choices').delete().eq('question_id', question_id);
      if (cErr) throw cErr;
      const { error: qErr } = await sb.from('uasa_questions').delete().eq('id', question_id);
      if (qErr) throw qErr;
      return { status: 200, body: { ok: true } };
    }

    case 'bulk_import': {
      await requireAdmin(sb, payload.admin_user_id);
      const items: QuestionInput[] = payload.items || [];
      if (!Array.isArray(items) || items.length === 0) {
        return { status: 400, body: { error: 'Tiada item untuk import.' } };
      }

      // Batch-level checks: duplicates within the batch, and against
      // existing active/draft questions already in the same chapter.
      const perItemErrors: Record<number, string[]> = {};
      items.forEach((q, idx) => {
        perItemErrors[idx] = validateQuestionShape(q);
      });

      const seenText = new Map<string, number>();
      items.forEach((q, idx) => {
        const key = `${q.chapter_id}::${(q.question_text || '').trim().toLowerCase()}`;
        if (seenText.has(key)) {
          perItemErrors[idx].push(`Duplicate dengan item #${seenText.get(key)! + 1} dalam batch ini.`);
        } else {
          seenText.set(key, idx);
        }
      });

      const chapterIds = Array.from(new Set(items.map((q) => q.chapter_id).filter(Boolean)));
      if (chapterIds.length > 0) {
        const { data: existingQs } = await sb.from('uasa_questions').select('chapter_id, question_text').in('chapter_id', chapterIds);
        const existingKeys = new Set((existingQs || []).map((r: any) => `${r.chapter_id}::${(r.question_text || '').trim().toLowerCase()}`));
        items.forEach((q, idx) => {
          const key = `${q.chapter_id}::${(q.question_text || '').trim().toLowerCase()}`;
          if (existingKeys.has(key)) perItemErrors[idx].push('Soalan ini (teks sama) sudah wujud dalam bab ini.');
        });
      }

      // Balanced answer distribution — flag (not block) if one choice
      // POSITION (A/B/C/D) holds the correct answer for more than 50% of
      // this batch's questions.
      const positionCounts = [0, 0, 0, 0];
      items.forEach((q) => {
        const correctIdx = q.choices?.findIndex((c) => c.is_correct);
        if (correctIdx != null && correctIdx >= 0 && correctIdx < 4) positionCounts[correctIdx] += 1;
      });
      const warnings: string[] = [];
      positionCounts.forEach((count, idx) => {
        if (items.length >= 4 && count / items.length > 0.5) {
          warnings.push(`Taburan jawapan tidak seimbang: ${Math.round((count / items.length) * 100)}% jawapan betul berada di pilihan ${String.fromCharCode(65 + idx)}.`);
        }
      });

      const hasBlockingErrors = Object.values(perItemErrors).some((errs) => errs.length > 0);
      if (hasBlockingErrors) {
        return { status: 400, body: { errors: perItemErrors, warnings } };
      }

      let inserted = 0;
      const insertErrors: Record<number, string> = {};
      for (let i = 0; i < items.length; i++) {
        try {
          await insertQuestionWithChoices(sb, items[i]);
          inserted += 1;
        } catch (e) {
          insertErrors[i] = e instanceof Error ? e.message : String(e);
        }
      }

      return { status: 200, body: { inserted, total: items.length, insertErrors, warnings } };
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
  } catch (e: any) {
    console.error('uasa-content error:', e);
    res.status(e?.statusCode || 502).json({ error: e instanceof Error ? e.message : 'Ralat tidak dijangka.' });
  }
}
