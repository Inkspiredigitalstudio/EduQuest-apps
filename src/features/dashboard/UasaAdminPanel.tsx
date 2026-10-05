import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../../types';
import { UasaSubject, UasaChapter, UasaQuestion, UasaYear, UasaBahagian } from '../../types';
import {
  adminListUasaSubjects,
  adminListUasaChapters,
  adminListUasaQuestions,
  adminCreateUasaSubject,
  adminCreateUasaChapter,
  adminCreateUasaQuestion,
  adminUpdateUasaQuestion,
  adminDeleteUasaQuestion,
  adminBulkImportUasaQuestions,
  AdminQuestionInput,
  AdminBulkImportResult,
} from '../../lib/uasa';
import { soundManager } from '../../lib/audio';
import { Plus, Upload, Pencil, Trash2, X, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, FileUp } from 'lucide-react';

const IMPORT_PLACEHOLDER = `[
  {
    "chapter_id": "<uuid bab>",
    "subject_id": "<uuid subjek>",
    "year": 6,
    "bahagian": "A",
    "difficulty": 1,
    "is_kbat": false,
    "marks": 1,
    "question_text": "Apakah hasil tambah 25 + 17?",
    "explanation": "25 + 17 = 42.",
    "image_url": "",
    "choices": [
      { "option_text": "42", "is_correct": true },
      { "option_text": "41", "is_correct": false },
      { "option_text": "40", "is_correct": false },
      { "option_text": "43", "is_correct": false }
    ]
  }
]`;

const PAGE_SIZE = 10;

interface UasaAdminPanelProps {
  user: UserProfile;
}

function emptyQuestionForm(chapterId: string, subjectId: string, year: UasaYear): AdminQuestionInput {
  return {
    chapter_id: chapterId,
    subject_id: subjectId,
    year,
    bahagian: 'A',
    difficulty: 1,
    is_kbat: false,
    marks: 1,
    question_text: '',
    explanation: '',
    image_url: '',
    status: 'draft',
    choices: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
  };
}

export const UasaAdminPanel: React.FC<UasaAdminPanelProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'soalan' | 'import' | 'subjek'>('soalan');

  const [subjects, setSubjects] = useState<UasaSubject[]>([]);
  const [chapters, setChapters] = useState<UasaChapter[]>([]);

  const [filterYear, setFilterYear] = useState<UasaYear | ''>('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterChapterId, setFilterChapterId] = useState('');
  const [filterBahagian, setFilterBahagian] = useState<UasaBahagian | ''>('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<UasaQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingRows, setIsLoadingRows] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminQuestionInput | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<AdminBulkImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterYear, setNewChapterYear] = useState<UasaYear>(6);
  const [newChapterSubjectId, setNewChapterSubjectId] = useState('');

  useEffect(() => {
    adminListUasaSubjects().then(setSubjects);
  }, []);

  useEffect(() => {
    adminListUasaChapters(filterSubjectId || undefined, filterYear || undefined).then(setChapters);
  }, [filterSubjectId, filterYear]);

  const refreshRows = async () => {
    setIsLoadingRows(true);
    const result = await adminListUasaQuestions(
      {
        year: filterYear || undefined,
        subjectId: filterSubjectId || undefined,
        chapterId: filterChapterId || undefined,
        bahagian: filterBahagian || undefined,
      },
      page,
      PAGE_SIZE
    );
    setRows(result.rows);
    setTotal(result.total);
    setIsLoadingRows(false);
  };

  useEffect(() => {
    refreshRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, filterSubjectId, filterChapterId, filterBahagian, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const chapterLabel = (id: string) => chapters.find((c) => c.id === id)?.name || id;
  const subjectLabel = (id: string) => subjects.find((s) => s.id === id)?.name || id;

  const validateFormLocal = (f: AdminQuestionInput): string | null => {
    if (!f.question_text.trim()) return 'Teks soalan kosong.';
    if (!f.explanation.trim()) return 'Penerangan kosong.';
    if (!f.chapter_id) return 'Pilih bab dahulu.';
    if (f.choices.length !== 4) return 'Mesti tepat 4 pilihan.';
    if (f.choices.filter((c) => c.is_correct).length !== 1) return 'Mesti tepat 1 jawapan betul.';
    if (f.choices.some((c) => !c.option_text.trim())) return 'Semua pilihan mesti ada teks.';
    return null;
  };

  const handleStartCreate = () => {
    if (!filterChapterId || !filterSubjectId || !filterYear) {
      alert('Pilih Tahun, Subjek dan Bab dahulu (di penapis atas) sebelum cipta soalan baru.');
      return;
    }
    setEditingId(null);
    setForm(emptyQuestionForm(filterChapterId, filterSubjectId, filterYear));
    setFormError(null);
  };

  const handleStartEdit = (q: UasaQuestion) => {
    setEditingId(q.id);
    setForm({
      chapter_id: q.chapter_id,
      subject_id: q.subject_id,
      year: q.year,
      bahagian: q.bahagian,
      difficulty: q.difficulty,
      is_kbat: q.is_kbat,
      marks: q.marks,
      question_text: q.question_text,
      explanation: q.explanation || '',
      image_url: q.image_url || '',
      status: q.status,
      choices: q.choices.map((c) => ({ option_text: c.option_text, is_correct: c.is_correct })),
    });
    setFormError(null);
  };

  const handleSaveForm = async () => {
    if (!form) return;
    const err = validateFormLocal(form);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    try {
      if (editingId) {
        await adminUpdateUasaQuestion(user.id, editingId, form, form.choices);
      } else {
        await adminCreateUasaQuestion(user.id, form);
      }
      soundManager.playCorrect();
      setForm(null);
      setEditingId(null);
      refreshRows();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Gagal simpan soalan.');
    }
  };

  const handleDelete = async (q: UasaQuestion) => {
    if (!confirm(`Padam soalan ini? "${q.question_text.slice(0, 60)}..."`)) return;
    try {
      await adminDeleteUasaQuestion(user.id, q.id);
      refreshRows();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal padam soalan.');
    }
  };

  const handleImport = async () => {
    let items: AdminQuestionInput[];
    try {
      items = JSON.parse(importText);
      if (!Array.isArray(items)) throw new Error('JSON mesti berupa array.');
    } catch (e) {
      setImportResult({ errors: { 0: [e instanceof Error ? e.message : 'JSON tidak sah.'] } });
      return;
    }
    setIsImporting(true);
    try {
      const result = await adminBulkImportUasaQuestions(user.id, items);
      setImportResult(result);
      if (result.inserted) {
        soundManager.playCorrect();
        refreshRows();
      }
    } catch (e) {
      setImportResult({ errors: { 0: [e instanceof Error ? e.message : 'Import gagal.'] } });
    } finally {
      setIsImporting(false);
    }
  };

  // Reads the .json file directly via FileReader instead of relying on
  // copy-paste — copy-paste through some apps (Notes, Word, some mobile
  // keyboards) silently swaps straight quotes (") for smart/curly quotes
  // ("" / '' ), which breaks JSON.parse with cryptic "Expected
  // double-quoted property name" errors. Reading the file bytes directly
  // sidesteps that entirely.
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImportText(String(reader.result || ''));
      setImportResult(null);
    };
    reader.onerror = () => {
      alert('Gagal baca fail. Cuba lagi atau guna paste manual.');
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    await adminCreateUasaSubject(user.id, { name: newSubjectName.trim(), icon: 'BookOpen', color: 'from-mist-400 to-mist-500', status: 'active' });
    setNewSubjectName('');
    adminListUasaSubjects().then(setSubjects);
  };

  const handleCreateChapter = async () => {
    if (!newChapterName.trim() || !newChapterSubjectId) return;
    await adminCreateUasaChapter(user.id, { subject_id: newChapterSubjectId, year: newChapterYear, name: newChapterName.trim(), order_index: chapters.length, status: 'active' });
    setNewChapterName('');
    adminListUasaChapters(filterSubjectId || undefined, filterYear || undefined).then(setChapters);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 bg-cream-200 p-1 rounded-2xl">
        {[
          { id: 'soalan', label: 'Soalan', icon: Pencil },
          { id: 'import', label: 'Import Pukal', icon: Upload },
          { id: 'subjek', label: 'Subjek & Bab', icon: Plus },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === tab.id ? 'bg-cream-50 text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'soalan' && (
        <div className="space-y-4">
          {/* Filters: Tahun -> Subjek -> Bab -> Bahagian */}
          <div className="bg-cream-50 border border-sand-200 rounded-3xl p-4 flex flex-wrap gap-2">
            <select value={filterYear} onChange={(e) => { setFilterYear((e.target.value ? Number(e.target.value) : '') as any); setPage(1); }} className="px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold bg-white">
              <option value="">Semua Tahun</option>
              {[3, 5, 6].map((y) => <option key={y} value={y}>Tahun {y}</option>)}
            </select>
            <select value={filterSubjectId} onChange={(e) => { setFilterSubjectId(e.target.value); setFilterChapterId(''); setPage(1); }} className="px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold bg-white">
              <option value="">Semua Subjek</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filterChapterId} onChange={(e) => { setFilterChapterId(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold bg-white">
              <option value="">Semua Bab</option>
              {chapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterBahagian} onChange={(e) => { setFilterBahagian(e.target.value as any); setPage(1); }} className="px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold bg-white">
              <option value="">Semua Bahagian</option>
              {(['A', 'B', 'C'] as const).map((b) => <option key={b} value={b}>Bahagian {b}</option>)}
            </select>
            <button onClick={handleStartCreate} className="ml-auto px-4 py-2 bg-mist-500 hover:bg-mist-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Soalan Baru
            </button>
          </div>

          {form && (
            <div className="bg-cream-50 border border-mist-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-mist-600">{editingId ? 'Kemas Kini Soalan' : 'Cipta Soalan'}</h3>
                <button onClick={() => { setForm(null); setEditingId(null); }} className="p-1.5 rounded-lg hover:bg-cream-200"><X className="w-4 h-4" /></button>
              </div>
              {formError && (
                <div className="bg-clay-100 border border-clay-200 text-clay-500 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <select value={form.bahagian} onChange={(e) => setForm({ ...form, bahagian: e.target.value as UasaBahagian })} className="px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold">
                  {(['A', 'B', 'C'] as const).map((b) => <option key={b} value={b}>Bahagian {b}</option>)}
                </select>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })} className="px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold">
                  {[1, 2, 3].map((d) => <option key={d} value={d}>Aras {d}</option>)}
                </select>
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold">
                  <input type="checkbox" checked={form.is_kbat} onChange={(e) => setForm({ ...form, is_kbat: e.target.checked, marks: e.target.checked ? 2 : 1 })} />
                  KBAT (2 markah)
                </label>
              </div>
              <textarea
                value={form.question_text}
                onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                placeholder="Teks soalan"
                className="w-full px-3 py-2.5 rounded-xl border border-sand-200 text-sm min-h-[80px]"
              />
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="Penerangan (dipaparkan selepas jawab)"
                className="w-full px-3 py-2.5 rounded-xl border border-sand-200 text-sm min-h-[60px]"
              />
              <div className="space-y-2">
                {form.choices.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-choice"
                      checked={c.is_correct}
                      onChange={() => setForm({ ...form, choices: form.choices.map((cc, i) => ({ ...cc, is_correct: i === idx })) })}
                    />
                    <input
                      value={c.option_text}
                      onChange={(e) => setForm({ ...form, choices: form.choices.map((cc, i) => (i === idx ? { ...cc, option_text: e.target.value } : cc)) })}
                      placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 px-3 py-2 rounded-xl border border-sand-200 text-sm"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSaveForm} className="w-full py-3 bg-sage-500 hover:bg-sage-600 text-white font-bold text-sm rounded-xl">
                Simpan
              </button>
            </div>
          )}

          <div className="bg-cream-50 border border-sand-200 rounded-3xl overflow-hidden">
            {isLoadingRows ? (
              <div className="p-8 text-center text-xs text-ink-500">Memuatkan...</div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-500">Tiada soalan sepadan dengan penapis.</div>
            ) : (
              rows.map((q) => (
                <div key={q.id} className="p-4 border-b border-sand-200 last:border-0 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-ink-500 mb-1">
                      <span className="bg-mist-100 text-mist-600 px-2 py-0.5 rounded-full">Bahagian {q.bahagian}</span>
                      <span>{subjectLabel(q.subject_id)}</span>
                      <span>•</span>
                      <span>{chapterLabel(q.chapter_id)}</span>
                      <span className="bg-cream-200 px-2 py-0.5 rounded-full">{q.status}</span>
                    </div>
                    <p className="text-sm font-semibold text-ink-900 line-clamp-2">{q.question_text}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleStartEdit(q)} className="p-2 rounded-lg hover:bg-cream-200 text-ink-500"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(q)} className="p-2 rounded-lg hover:bg-clay-100 text-clay-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg bg-cream-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs font-bold text-ink-500">Halaman {page}/{totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg bg-cream-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'import' && (
        <div className="space-y-4">
          <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-mist-600">Import Pukal (JSON)</h3>
            <p className="text-xs text-ink-500">
              Validator automatik semak: tepat 4 pilihan, tepat 1 jawapan betul, teks/penerangan tidak kosong, duplicate dalam bab yang sama, dan amaran taburan jawapan tidak seimbang.
            </p>
            <label className="w-full flex items-center justify-center gap-2 py-3 bg-cream-100 hover:bg-cream-200 border-2 border-dashed border-sand-300 text-ink-700 font-bold text-sm rounded-xl cursor-pointer transition-colors">
              <FileUp className="w-4 h-4" />
              <span>Upload Fail .json</span>
              <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
            </label>
            <p className="text-[11px] text-ink-500 text-center">— atau paste JSON terus di bawah (elak paste dari Notes/Word, tanda petik boleh rosak) —</p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={IMPORT_PLACEHOLDER}
              className="w-full font-mono text-xs px-3 py-2.5 rounded-xl border border-sand-200 min-h-[240px]"
            />
            <button onClick={handleImport} disabled={isImporting} className="w-full py-3 bg-mist-500 hover:bg-mist-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl">
              {isImporting ? 'Mengimport...' : 'Import'}
            </button>
          </div>

          {importResult && (
            <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-3">
              {importResult.warnings && importResult.warnings.length > 0 && (
                <div className="bg-honey-100 border border-honey-200 text-honey-500 text-xs font-semibold rounded-xl p-3 space-y-1">
                  {importResult.warnings.map((w, i) => <div key={i} className="flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{w}</div>)}
                </div>
              )}
              {Object.entries(importResult.errors || {}).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-clay-500">Item bermasalah (tidak diimport sehingga dibetulkan):</p>
                  {Object.entries(importResult.errors || {}).map(([idx, errs]) => (
                    <div key={idx} className="bg-clay-100 border border-clay-200 rounded-xl p-3 text-xs">
                      <span className="font-bold text-clay-500">Item #{Number(idx) + 1}:</span> {(errs as string[]).join(' ')}
                    </div>
                  ))}
                </div>
              )}
              {typeof importResult.inserted === 'number' && (
                <div className="bg-sage-100 border border-sage-200 text-sage-600 text-sm font-bold rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {importResult.inserted}/{importResult.total} soalan berjaya diimport.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'subjek' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-mist-600">Subjek</h3>
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2 bg-cream-100 rounded-xl text-sm font-semibold">
                <span>{s.name}</span>
                <span className="text-[10px] font-bold text-ink-500 bg-cream-200 px-2 py-0.5 rounded-full">{s.status}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <input value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Nama subjek baru (cth: BM)" className="flex-1 px-3 py-2 rounded-xl border border-sand-200 text-sm" />
              <button onClick={handleCreateSubject} className="px-4 py-2 bg-mist-500 hover:bg-mist-600 text-white font-bold text-xs rounded-xl">Tambah</button>
            </div>
          </div>

          <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-mist-600">Bab</h3>
            {chapters.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-cream-100 rounded-xl text-sm font-semibold">
                <span>{c.name} <span className="text-xs text-ink-500">(Tahun {c.year})</span></span>
                <span className="text-[10px] font-bold text-ink-500 bg-cream-200 px-2 py-0.5 rounded-full">{c.status}</span>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <select value={newChapterSubjectId} onChange={(e) => setNewChapterSubjectId(e.target.value)} className="px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold">
                <option value="">Subjek...</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={newChapterYear} onChange={(e) => setNewChapterYear(Number(e.target.value) as UasaYear)} className="px-3 py-2 rounded-xl border border-sand-200 text-xs font-bold">
                {[3, 5, 6].map((y) => <option key={y} value={y}>Tahun {y}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input value={newChapterName} onChange={(e) => setNewChapterName(e.target.value)} placeholder="Nama bab baru" className="flex-1 px-3 py-2 rounded-xl border border-sand-200 text-sm" />
              <button onClick={handleCreateChapter} className="px-4 py-2 bg-mist-500 hover:bg-mist-600 text-white font-bold text-xs rounded-xl">Tambah</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
