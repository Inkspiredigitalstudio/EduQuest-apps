// Vercel serverless function — "Minta Diajar" step-by-step hints for UASA
// Matematik Practice. Each call returns ONE next hint, never the answer.
//
// The question, correct answer and explanation are looked up here with the
// service role key rather than taken from the client, so the model always
// works from the real question and a client can't feed it arbitrary text.
// The answer is given to the model only so its hints point the right way;
// a server-side check below refuses to send any hint that contains it.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { inkyAsk, Type, Schema } from './_lib/inkyEngine.js';

const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const apiKey = (process.env.UASA_API_KEY || '').trim();

const MAX_HINTS = 5;

function getServiceClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('UASA tutor belum configured: SUPABASE_SERVICE_ROLE_KEY atau VITE_SUPABASE_URL tiada.');
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

const TUTOR_RULES = `
Anda ialah tutor Matematik yang sabar untuk murid sekolah rendah di Malaysia (UASA, KSSR).
Murid sedang buat latihan dan menekan butang "Minta Diajar" kerana tidak tahu langkah seterusnya.
Peraturan wajib:
1. Beri SATU langkah seterusnya SAHAJA. Maksimum 2 ayat pendek, bahasa Melayu yang mudah difahami kanak-kanak.
2. JANGAN sekali-kali beri jawapan akhir, nilai jawapan akhir, atau sebut pilihan A/B/C/D.
3. Suruh murid buat pengiraan sendiri. Contoh baik: "Samakan penyebut dahulu." / "Sekarang tambah pengangka (nombor atas)." Contoh salah: "Jawapannya ialah 5/6."
4. Boleh sebut nombor yang ADA dalam soalan, tetapi jangan kira hasil langkah itu untuk murid.
5. Ikut kaedah dalam penerangan rujukan, satu langkah demi satu langkah, mengikut urutan.
6. Jangan ulang petunjuk yang sudah diberi. Mulakan dari tempat petunjuk sebelum ini berhenti.
7. Jika langkah ini ialah langkah terakhir sebelum murid boleh dapat jawapan sendiri, set "selesai" = true dan ajak murid kira lalu semak jawapannya dalam pilihan.
`.trim();

const hintSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hint: { type: Type.STRING },
    selesai: { type: Type.BOOLEAN },
  },
  required: ['hint', 'selesai'],
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Same spelling for both sides: "70 000" → "70000", "RM 6.80" → "rm6.80",
// "5 / 6" → "5/6", runs of spaces collapsed.
function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/(\d)\s+(?=\d{3}(?!\d))/g, '$1')
    .replace(/rm\s+/g, 'rm')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

// True when the hint states the correct answer. Number-aware boundaries so
// "15" doesn't match inside "150" or "1.5", while a sentence-ending "5/6." or
// "70 000," still counts. Single digits, and answers that already appear in
// the question itself (e.g. a median that is one of the data values), can't
// be told apart from legitimately quoting the question, so they're left to the
// prompt rules.
function leaksAnswer(hint: string, answer: string, questionText: string): boolean {
  const a = normalise(answer);
  if (!a || /^\d$/.test(a)) return false;
  const boundary = (x: string) => new RegExp(`(?<![0-9]|[0-9][.,/])${escapeRegex(x)}(?![0-9]|[.,/][0-9])`);
  if (boundary(a).test(normalise(questionText))) return false;
  return boundary(a).test(normalise(hint));
}

async function nextHint(questionId: string, previousHints: string[]) {
  const sb = getServiceClient();
  const { data: q, error } = await sb
    .from('uasa_questions')
    .select('question_text, explanation, year, status, uasa_choices(option_text, is_correct, order_index), uasa_subjects(name)')
    .eq('id', questionId)
    .single();
  if (error || !q || q.status !== 'active') return { status: 404, body: { error: 'Soalan tidak dijumpai.' } };

  const subjectName = ((q as any).uasa_subjects?.name || '').trim().toLowerCase();
  if (subjectName !== 'matematik') return { status: 400, body: { error: 'Minta Diajar hanya untuk Matematik.' } };

  const choices = ((q as any).uasa_choices || []).sort((a: any, b: any) => a.order_index - b.order_index);
  const correct = choices.find((c: any) => c.is_correct)?.option_text || '';

  const prompt = [
    `Tahap murid: Tahun ${q.year}.`,
    `Soalan: ${q.question_text}`,
    `Pilihan jawapan: ${choices.map((c: any) => c.option_text).join(' | ')}`,
    `Jawapan betul (RAHSIA, untuk rujukan anda sahaja — jangan dedahkan): ${correct}`,
    `Penerangan rujukan (RAHSIA): ${q.explanation || '(tiada)'}`,
    previousHints.length
      ? `Petunjuk yang sudah diberi kepada murid:\n${previousHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
      : 'Belum ada petunjuk diberi. Ini petunjuk pertama.',
    `Beri petunjuk ke-${previousHints.length + 1} sahaja.`,
  ].join('\n\n');

  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await inkyAsk<{ hint: string; selesai: boolean }>({
      systemInstruction:
        attempt === 0
          ? TUTOR_RULES
          : `${TUTOR_RULES}\n\nAMARAN: Petunjuk anda sebelum ini mendedahkan jawapan akhir. Tulis semula TANPA nilai jawapan akhir.`,
      prompt,
      schema: hintSchema,
    });
    const hint = (result.hint || '').trim();
    if (hint && !leaksAnswer(hint, correct, q.question_text)) {
      const done = Boolean(result.selesai) || previousHints.length + 1 >= MAX_HINTS;
      return { status: 200, body: { hint, done } };
    }
  }
  return { status: 502, body: { error: 'Petunjuk tidak dapat dijana. Sila cuba lagi.' } };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (apiKey && req.headers['x-uasa-api-key'] !== apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const questionId = body?.question_id;
  const previousHints: string[] = Array.isArray(body?.previous_hints)
    ? body.previous_hints.filter((h: unknown) => typeof h === 'string').slice(0, MAX_HINTS)
    : [];

  if (typeof questionId !== 'string' || !questionId) {
    res.status(400).json({ error: 'question_id diperlukan.' });
    return;
  }
  if (previousHints.length >= MAX_HINTS) {
    res.status(200).json({ hint: null, done: true });
    return;
  }

  try {
    const result = await nextHint(questionId, previousHints);
    res.status(result.status).json(result.body);
  } catch (e) {
    console.error('uasa-tutor error:', e);
    res.status(502).json({ error: 'AI tidak dapat dihubungi buat masa ini. Sila cuba lagi.' });
  }
}
