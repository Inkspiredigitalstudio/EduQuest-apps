// Vercel serverless function — "Petunjuk" step-by-step hints for UASA
// Matematik Practice. Each call returns ONE next hint, never the answer.
//
// Where a hint comes from, in order — a student always gets one:
//   1. Written hints stored on the question (uasa_questions.hints): instant,
//      free, reviewed by a teacher. The Nth press returns hints[N].
//   2. Inky (Gemini) generates the next step.
//   3. Fallback built from the question's own explanation, with every result
//      after an "=" masked so the working is shown but never the answer.
// The question, answer and explanation are read here with the service role
// key, not taken from the client. Every hint from (2) and (3) is checked
// against the correct answer before it is sent.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { inkyAsk, Type, Schema } from './_lib/inkyEngine.js';
import { leaksAnswer } from './_lib/hintLeak.js';

const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const apiKey = (process.env.UASA_API_KEY || '').trim();

const MAX_HINTS = 5;
const LLM_TIMEOUT_MS = 12000;

// Short machine-readable reason a hint couldn't be produced, so the next
// failure tells us what broke instead of just "not reachable".
type FailureCode = 'kuota' | 'model' | 'kunci' | 'masa' | 'rangkaian' | 'format' | 'bocor' | 'lain';

function classifyError(e: unknown): FailureCode {
  const err = e as any;
  const text = `${err?.status ?? ''} ${err?.code ?? ''} ${err?.message ?? ''}`.toLowerCase();
  if (err?.name === 'TimeoutError' || text.includes('timeout') || text.includes('timed out') || text.includes('deadline')) return 'masa';
  if (text.includes('429') || text.includes('quota') || text.includes('resource_exhausted') || text.includes('rate')) return 'kuota';
  if (text.includes('404') || text.includes('not found') || text.includes('no longer available') || text.includes('model')) return 'model';
  if (text.includes('401') || text.includes('403') || text.includes('api key') || text.includes('api_key') || text.includes('permission') || text.includes('belum dikonfigurasi')) return 'kunci';
  if (text.includes('json') || text.includes('tidak mengembalikan output')) return 'format';
  if (text.includes('fetch') || text.includes('econn') || text.includes('enotfound') || text.includes('network') || text.includes('503') || text.includes('502') || text.includes('500')) return 'rangkaian';
  return 'lain';
}

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(Object.assign(new Error(`timeout ${ms}ms`), { name: 'TimeoutError' })), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });

// One retry for transient failures (overload, brief network blip) after a
// short pause; permanent ones (bad key, retired model) fail straight away.
async function askInky(params: Parameters<typeof inkyAsk>[0]) {
  try {
    return await withTimeout(inkyAsk<{ hint: string; selesai: boolean }>(params), LLM_TIMEOUT_MS);
  } catch (e) {
    const code = classifyError(e);
    if (code !== 'kuota' && code !== 'rangkaian' && code !== 'masa') throw e;
    await new Promise((r) => setTimeout(r, 700));
    return await withTimeout(inkyAsk<{ hint: string; selesai: boolean }>(params), LLM_TIMEOUT_MS);
  }
}

function getServiceClient(): SupabaseClient {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('UASA tutor belum configured: SUPABASE_SERVICE_ROLE_KEY atau VITE_SUPABASE_URL tiada.');
  }
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

const TUTOR_RULES = `
Anda ialah tutor Matematik yang sabar untuk murid sekolah rendah di Malaysia (UASA, KSSR).
Murid sedang buat latihan dan menekan butang "Petunjuk" kerana tidak tahu langkah seterusnya.
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

// Worked steps taken from the question's own explanation. Anything after an
// "=" is replaced by "?" so the student sees what to calculate but not the
// result; a step is dropped if it still contains the answer, and the last
// sentence is never used since it normally states the conclusion.
function stepsFromExplanation(explanation: string, answer: string, questionText: string): string[] {
  const sentences = (explanation || '')
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9])/)
    .map((x) => x.trim())
    .filter(Boolean);
  const usable = sentences.length > 1 ? sentences.slice(0, -1) : sentences;
  const steps: string[] = [];
  for (const sent of usable) {
    const eq = sent.lastIndexOf('=');
    const masked = eq >= 0 ? `${sent.slice(0, eq + 1).trim()} ?` : sent;
    if (leaksAnswer(masked, answer, questionText)) continue;
    steps.push(masked.replace(/\s+/g, ' ').replace(/\.$/, ''));
  }
  return steps.slice(0, MAX_HINTS);
}

interface HintBody {
  hint: string;
  done: boolean;
  source: 'bertulis' | 'inky' | 'penerangan';
}

async function nextHint(questionId: string, previousHints: string[]) {
  const sb = getServiceClient();
  const { data: q, error } = await sb
    .from('uasa_questions')
    .select('question_text, explanation, hints, year, status, uasa_choices(option_text, is_correct, order_index), uasa_subjects(name)')
    .eq('id', questionId)
    .single();
  if (error || !q || q.status !== 'active') return { status: 404, body: { error: 'Soalan tidak dijumpai.' } };

  const subjectName = ((q as any).uasa_subjects?.name || '').trim().toLowerCase();
  if (subjectName !== 'matematik') return { status: 400, body: { error: 'Petunjuk hanya untuk Matematik.' } };

  const choices = ((q as any).uasa_choices || []).sort((a: any, b: any) => a.order_index - b.order_index);
  const correct = choices.find((c: any) => c.is_correct)?.option_text || '';
  const step = previousHints.length;

  // 1. Written hints — a teacher wrote these, so they are trusted as-is.
  const written: string[] = Array.isArray((q as any).hints)
    ? (q as any).hints.filter((h: unknown) => typeof h === 'string' && h.trim()).map((h: string) => h.trim())
    : [];
  if (written.length > 0) {
    if (step >= written.length) return { status: 200, body: { hint: null, done: true } };
    const body: HintBody = { hint: written[step], done: step + 1 >= written.length, source: 'bertulis' };
    return { status: 200, body };
  }

  // 2. Inky (Gemini)
  let failure: FailureCode = 'lain';
  const prompt = [
    `Tahap murid: Tahun ${q.year}.`,
    `Soalan: ${q.question_text}`,
    `Pilihan jawapan: ${choices.map((c: any) => c.option_text).join(' | ')}`,
    `Jawapan betul (RAHSIA, untuk rujukan anda sahaja — jangan dedahkan): ${correct}`,
    `Penerangan rujukan (RAHSIA): ${q.explanation || '(tiada)'}`,
    step
      ? `Petunjuk yang sudah diberi kepada murid:\n${previousHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
      : 'Belum ada petunjuk diberi. Ini petunjuk pertama.',
    `Beri petunjuk ke-${step + 1} sahaja.`,
  ].join('\n\n');

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await askInky({
        systemInstruction:
          attempt === 0
            ? TUTOR_RULES
            : `${TUTOR_RULES}\n\nAMARAN: Petunjuk anda sebelum ini mendedahkan jawapan akhir. Tulis semula TANPA nilai jawapan akhir.`,
        prompt,
        schema: hintSchema,
      });
      const hint = (result.hint || '').trim();
      if (hint && !leaksAnswer(hint, correct, q.question_text)) {
        const body: HintBody = { hint, done: Boolean(result.selesai) || step + 1 >= MAX_HINTS, source: 'inky' };
        return { status: 200, body };
      }
      failure = 'bocor';
    }
  } catch (e) {
    failure = classifyError(e);
    console.error(`uasa-tutor: Inky gagal (${failure}) soalan=${questionId}`, e);
  }

  // 3. Fallback from the explanation (masked)
  const fallback = stepsFromExplanation(q.explanation || '', correct, q.question_text);
  if (fallback.length > 0) {
    if (step >= fallback.length) return { status: 200, body: { hint: null, done: true } };
    console.warn(`uasa-tutor: guna penerangan (sebab=${failure}) soalan=${questionId}`);
    const body: HintBody = { hint: fallback[step], done: step + 1 >= fallback.length, source: 'penerangan' };
    return { status: 200, body };
  }

  return { status: 502, body: { error: 'Inky tak jumpa petunjuk kali ini. Cuba tekan sekali lagi.', code: failure } };
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
    const code = classifyError(e);
    console.error(`uasa-tutor error (${code}):`, e);
    res.status(502).json({ error: 'Inky tidak dapat dihubungi buat masa ini. Sila cuba lagi.', code });
  }
}
