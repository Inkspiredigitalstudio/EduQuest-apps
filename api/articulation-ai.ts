// Vercel serverless function (Node runtime, auto-detected from /api).
// Thin dispatcher over the centralized Inky AI Engine (./_lib/inkyEngine) —
// holds no AI provider details itself. All AI Writing Coach calls for PKSK
// Artikulasi Karangan go through here.
//
// EduQuest Artikulasi is an AI WRITING COACH, not an AI ESSAY GENERATOR
// (plan #9.1 Bahagian 9/24/32) — every prompt below enforces that.

import { inkyAsk, Type, Schema } from './_lib/inkyEngine';

const COACH_RULES = `
Anda ialah AI WRITING COACH untuk EduQuest Artikulasi Karangan — BUKAN AI Essay Generator.
Peraturan wajib:
1. Bimbing pelajar berfikir dan membina karangan sendiri — JANGAN tulis karangan penuh untuk pelajar dalam apa jua keadaan.
2. Bertindak sebagai pembimbing: tanya soalan dahulu sebelum terus memberi jawapan, jika sesuai untuk jenis bantuan diminta.
3. Beri hint/petunjuk apabila pelajar tersekat — bukan jawapan penuh.
4. Maksimum 3 fokus pembaikan pada satu masa.
5. Sesuaikan bahasa, kosa kata, kerumitan ayat, dan tahap huraian ikut tahap pelajar (Tahun 6 atau Tingkatan 3) — JANGAN nilai Tahun 6 ikut piawaian Tingkatan 3.
6. Pastikan bantuan/maklum balas menjawab kehendak soalan yang diberikan.
7. Jangan paksa peribahasa/simpulan bahasa; jangan cadangkan yang tidak tepat konteks.
8. Jangan overcorrect ayat yang sebenarnya sudah betul.
9. Galakkan pelajar mencuba semula, bukan berputus asa.
10. Jawab dalam Bahasa Melayu, nada mesra & menggalakkan, sesuai untuk kanak-kanak/remaja sekolah.
`.trim();

function levelContext(level: string): string {
  return level === 'Tahun 6'
    ? 'Tahap pelajar: Tahun 6 (sasaran ~100 patah perkataan). Fokus: ayat jelas, struktur asas (Pengenalan/Isi/Penutup), huraian ringkas dan mudah difahami.'
    : 'Tahap pelajar: Tingkatan 3 (sasaran ~250 patah perkataan). Fokus: kematangan idea, huraian, contoh, kesinambungan antara perenggan, kosa kata dan gaya bahasa yang lebih matang.';
}

function essayText(sections: { pengenalan?: string; isi?: string[]; penutup?: string }): string {
  const parts = [
    sections.pengenalan ? `Pengenalan:\n${sections.pengenalan}` : '',
    ...(sections.isi || []).map((isi, i) => (isi ? `Isi ${i + 1}:\n${isi}` : '')),
    sections.penutup ? `Penutup:\n${sections.penutup}` : '',
  ].filter(Boolean);
  return parts.join('\n\n') || '(Karangan masih kosong.)';
}

const fahamSoalanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topik: { type: Type.STRING },
    kehendak_soalan: { type: Type.STRING },
    sasaran: { type: Type.STRING },
    jenis_soalan: { type: Type.STRING },
    cadangan_bilangan_isi: { type: Type.NUMBER },
  },
  required: ['topik', 'kehendak_soalan', 'sasaran', 'jenis_soalan', 'cadangan_bilangan_isi'],
};

const textSchema: Schema = {
  type: Type.OBJECT,
  properties: { text: { type: Type.STRING } },
  required: ['text'],
};

const listSchema = (key: string): Schema => ({
  type: Type.OBJECT,
  properties: { [key]: { type: Type.ARRAY, items: { type: Type.STRING } } },
  required: [key],
});

const evaluateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    kekuatan: { type: Type.ARRAY, items: { type: Type.STRING } },
    perkara_dibaiki: { type: Type.ARRAY, items: { type: Type.STRING } },
    cadangan: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['score', 'kekuatan', 'perkara_dibaiki', 'cadangan'],
};

interface ActionResult {
  status: number;
  body: unknown;
}

async function runAction(action: string, payload: any): Promise<ActionResult> {
  switch (action) {
    case 'faham_soalan': {
      const { question, topic, level } = payload;
      const body = await inkyAsk(
        {
          systemInstruction: COACH_RULES,
          prompt: `Soalan karangan: "${question}"\nTopik: ${topic}\n${levelContext(level)}\n\nPecahkan soalan ini untuk membantu pelajar faham sebelum menulis.`,
          schema: fahamSoalanSchema,
        }
      );
      return { status: 200, body };
    }

    case 'hint':
    case 'soalan_panduan': {
      const { question, level, section, currentText } = payload;
      const instruction =
        action === 'hint'
          ? 'Pelajar tersekat dan minta HINT (petunjuk ringkas, bukan jawapan penuh) untuk bahagian ini.'
          : 'Beri SATU soalan panduan (bukan jawapan) untuk bantu pelajar berfikir sendiri tentang bahagian ini, ikut gaya soal-jawab bersiri (bukan borong).';
      const body = await inkyAsk({
        systemInstruction: COACH_RULES,
        prompt: `Soalan karangan: "${question}"\n${levelContext(level)}\nBahagian karangan: ${section}\nApa yang pelajar dah tulis setakat ini untuk bahagian ini:\n"${currentText || '(kosong)'}"\n\n${instruction}`,
        schema: textSchema,
      });
      return { status: 200, body };
    }

    case 'idea': {
      const { question, topic, level, section } = payload;
      const body = await inkyAsk({
        systemInstruction: COACH_RULES,
        prompt: `Soalan karangan: "${question}"\nTopik: ${topic}\n${levelContext(level)}\nBahagian: ${section}\n\nCadangkan 3-4 idea/isi ringkas (bukan ayat penuh) yang pelajar boleh pilih dan kembangkan SENDIRI untuk bahagian ini.`,
        schema: listSchema('ideas'),
      });
      return { status: 200, body };
    }

    case 'kosa_kata': {
      const { word, level, context } = payload;
      const body = await inkyAsk({
        systemInstruction: COACH_RULES,
        prompt: `${levelContext(level)}\nKonteks ayat: "${context || ''}"\nPerkataan yang pelajar guna: "${word}"\n\nCadangkan 3-4 perkataan/frasa lebih sesuai atau bervariasi (ikut tahap pelajar) untuk gantikan perkataan ni.`,
        schema: listSchema('suggestions'),
      });
      return { status: 200, body };
    }

    case 'peribahasa': {
      const { context, level } = payload;
      const body = await inkyAsk({
        systemInstruction: COACH_RULES,
        prompt: `${levelContext(level)}\nKonteks karangan pelajar: "${context || ''}"\n\nCadangkan 2-3 simpulan bahasa/peribahasa yang BENAR-BENAR relevan dengan konteks ni (bukan generik). Kalau tiada yang benar-benar sesuai, kembalikan senarai kosong — jangan paksa.`,
        schema: listSchema('suggestions'),
      });
      return { status: 200, body };
    }

    case 'baiki_ayat': {
      const { sentence, level } = payload;
      const body = await inkyAsk({
        systemInstruction: COACH_RULES,
        prompt: `${levelContext(level)}\nAyat pelajar: "${sentence}"\n\nKalau ayat ni sebenarnya sudah betul dan jelas, katakan begitu — jangan overcorrect. Kalau boleh dibaiki, cadangkan SATU versi lebih baik, tapi galakkan pelajar cuba tulis versi sendiri dahulu sebelum guna cadangan ni terus.`,
        schema: textSchema,
      });
      return { status: 200, body };
    }

    case 'evaluate': {
      const { question, level, wordTarget, sections } = payload;
      const body = await inkyAsk({
        systemInstruction: COACH_RULES,
        prompt: `Soalan karangan: "${question}"\n${levelContext(level)}\nSasaran perkataan: ~${wordTarget}\n\nKarangan pelajar:\n${essayText(sections || {})}\n\nNilai karangan ini sebagai AI Writing Coach. Beri markah anggaran 0-100 (INI BUKAN markah rasmi PKSK — label sebagai "AI Writing Score" sahaja), maksimum 3 kekuatan, maksimum 3 perkara perlu dibaiki, dan beberapa cadangan (hint, bukan jawapan penuh) untuk pelajar perbaiki.`,
        schema: evaluateSchema,
      });
      return { status: 200, body };
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
    console.error('articulation-ai error:', e);
    res.status(502).json({ error: 'AI tidak dapat dihubungi buat masa ini. Sila cuba lagi.' });
  }
}
