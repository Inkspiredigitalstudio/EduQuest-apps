import React, { useState, useEffect } from 'react';
import { UserProfile, Subject, Paper, Section, Question, Choice } from '../../types';
import { isSupabaseConfigured, getAllRegisteredUsers, resetUserPassword, updateUserProfileFields, deleteUserAccount, registerUser, testSupabaseConnection, supabaseDiagnostic } from '../../lib/supabase';
import { SUPABASE_SQL_SETUP_DDL } from '../../data/seedData';
import { soundManager } from '../../lib/audio';
import {
  Shield, Database, Plus, CheckCircle2, Code2, Copy, LogOut, Sun, Moon,
  Pencil, Trash2, X, AlertCircle, Upload, ListChecks, Lock, Users, Search, KeyRound, RefreshCw,
  Image as ImageIcon, Phone, Mail,
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserProfile;
  subjects: Subject[];
  papers: Paper[];
  sections: Section[];
  questions: Question[];
  pkskSubjects?: Subject[];
  pkskPapers?: Paper[];
  pkskSections?: Section[];
  pkskQuestions?: Question[];
  activeModuleTab: 'sppim' | 'pksk' | 'uasa';
  onModuleTabChange: (tab: 'sppim' | 'pksk' | 'uasa') => void;
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onBulkAddQuestions: (qs: Question[]) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  mudah: 'Mudah',
  sederhana: 'Sederhana',
  sukar: 'Sukar',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  mudah: 'bg-sage-100 text-sage-600',
  sederhana: 'bg-honey-100 text-honey-500',
  sukar: 'bg-clay-100 text-clay-500',
};

const ANSWER_FORMAT_OPTIONS: { value: NonNullable<Question['answer_format']>; label: string }[] = [
  { value: 'mcq', label: 'Aneka Pilihan (MCQ)' },
  { value: 'ya_tidak', label: 'Ya / Tidak' },
  { value: 'betul_salah', label: 'Betul / Salah' },
  { value: 'frekuensi3', label: 'Frekuensi (3 skala)' },
  { value: 'likert5', label: 'Likert (5 skala)' },
];

const IMPORT_PLACEHOLDER = `[
  {
    "section_id": "sec-fekah-2024-A",
    "question_text": "Apakah hukum solat fardu bagi orang Islam yang baligh?",
    "explanation": "Solat fardu adalah wajib ke atas setiap Muslim yang baligh dan berakal.",
    "difficulty": "mudah",
    "image_url": "",
    "choices": [
      { "text": "Wajib", "correct": true },
      { "text": "Sunat", "correct": false },
      { "text": "Harus", "correct": false }
    ]
  }
]`;

const PKSK_IMPORT_PLACEHOLDER = `[
  {
    "section_id": "sec-pksk-insaniah-a",
    "question_text": "Saya suka membantu rakan yang menghadapi masalah.",
    "explanation": "",
    "answer_format": "likert5",
    "dimensi_personaliti": "Empati",
    "aras_kesukaran": 1,
    "image_url": "",
    "choices": [
      { "text": "Sangat Setuju", "correct": true, "nilai_skala": 5 },
      { "text": "Setuju", "correct": false, "nilai_skala": 4 },
      { "text": "Tidak Pasti", "correct": false, "nilai_skala": 3 },
      { "text": "Tidak Setuju", "correct": false, "nilai_skala": 2 },
      { "text": "Sangat Tidak Setuju", "correct": false, "nilai_skala": 1 }
    ]
  }
]`;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  subjects,
  papers,
  sections,
  questions,
  pkskSubjects,
  pkskPapers,
  pkskSections,
  pkskQuestions,
  activeModuleTab,
  onModuleTabChange,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onBulkAddQuestions,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'import' | 'participants' | 'setup'>('manual');

  // Module-aware data — everything below (form dropdowns, question list,
  // filters) reads from these instead of the raw SPPIM props directly, so
  // the same admin UI works for both modules without duplicating it.
  const isPkskModule = activeModuleTab === 'pksk';
  const moduleSubjects = isPkskModule ? (pkskSubjects || []) : subjects;
  const modulePapers = isPkskModule ? (pkskPapers || []) : papers;
  const moduleSections = isPkskModule ? (pkskSections || []) : sections;
  const moduleQuestions = isPkskModule ? (pkskQuestions || []) : questions;

  // ---- Participants (list / search / reset password) ----
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [resetResult, setResetResult] = useState<{ userId: string; password: string } | null>(null);

  // ---- Manual Add / Update form state ----
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || '');

  // Sections now arrive asynchronously from Supabase (may be empty at mount) —
  // pick a default once they're actually available, and if the selection is
  // never made (e.g. resetForm reset it to something unset), fall back safely.
  useEffect(() => {
    if (!selectedSectionId && moduleSections.length > 0) {
      setSelectedSectionId(moduleSections[0].id);
    }
  }, [moduleSections, selectedSectionId]);

  // Switching module tabs mid-edit would otherwise leave a section id from
  // the other module selected — reset the form (and pick that module's
  // first section) whenever the tab changes.
  useEffect(() => {
    setEditingId(null);
    setSelectedSectionId(moduleSections[0]?.id || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleTab]);

  const [qText, setQText] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOptIndex, setCorrectOptIndex] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'mudah' | 'sederhana' | 'sukar'>('sederhana');
  const [answerFormat, setAnswerFormat] = useState<NonNullable<Question['answer_format']>>('mcq');
  const [dimensiPersonaliti, setDimensiPersonaliti] = useState('');
  const [arasKesukaran, setArasKesukaran] = useState<1 | 2 | 3>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [formMsg, setFormMsg] = useState('');

  // ---- Bulk import state ----
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---- Setup / DDL tab state ----
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    soundManager.playClick();
    setTestingConnection(true);
    setConnectionTestResult(null);
    const result = await testSupabaseConnection();
    setConnectionTestResult(result);
    setTestingConnection(false);
    soundManager.playCoin();
  };

  const inputCls = 'w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-xl p-3 outline-none transition-colors';

  const resetForm = () => {
    setEditingId(null);
    setQText('');
    setQExplanation('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectOptIndex(0);
    setDifficulty('sederhana');
    setAnswerFormat('mcq');
    setDimensiPersonaliti('');
    setArasKesukaran(1);
    setImageUrl('');
    setSelectedSectionId(moduleSections[0]?.id || '');
  };

  const handleEditClick = (q: Question) => {
    soundManager.playClick();
    setActiveTab('manual');
    setEditingId(q.id);
    setSelectedSectionId(q.section_id);
    setQText(q.question_text);
    setQExplanation(q.explanation || '');
    setDifficulty(q.difficulty || 'sederhana');
    setAnswerFormat(q.answer_format || 'mcq');
    setDimensiPersonaliti(q.dimensi_personaliti || '');
    setArasKesukaran(q.aras_kesukaran || 1);
    setImageUrl(q.image_url || '');
    const opts = q.choices || [];
    setOptA(opts[0]?.option_text || '');
    setOptB(opts[1]?.option_text || '');
    setOptC(opts[2]?.option_text || '');
    setOptD(opts[3]?.option_text || '');
    const correctIdx = opts.findIndex((c) => c.is_correct);
    setCorrectOptIndex(correctIdx >= 0 ? correctIdx : 0);
    setFormMsg('');
  };

  // ---- Question bank search / filter (helps find one question among many) ----
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState<string>('all');
  const [questionPaperFilter, setQuestionPaperFilter] = useState<string>('all');
  const [questionSectionFilter, setQuestionSectionFilter] = useState<string>('all');
  // PKSK-only: Bahagian A/B isn't a stored column — derived from the same
  // nilai_skala-presence signal savePkskMixedExamAttempt uses for scoring
  // (weighted choices = Bahagian A, binary is_correct = Bahagian B), so this
  // filter can never drift out of sync with how exam attempts actually get
  // scored. Aras Kesukaran is a real column, filtered directly.
  const [questionBahagianFilter, setQuestionBahagianFilter] = useState<'all' | 'A' | 'B'>('all');
  const [questionArasFilter, setQuestionArasFilter] = useState<'all' | 1 | 2 | 3>('all');

  const getBahagianForQuestion = (q: Question): 'A' | 'B' =>
    q.choices.some((c) => c.nilai_skala != null) ? 'A' : 'B';

  const getSubjectForQuestion = (q: Question): Subject | undefined => {
    const sec = moduleSections.find((s) => s.id === q.section_id);
    if (!sec) return undefined;
    const paper = modulePapers.find((p) => p.id === sec.paper_id);
    if (!paper) return undefined;
    return moduleSubjects.find((s) => s.id === paper.subject_id);
  };

  const getPaperForQuestion = (q: Question): Paper | undefined => {
    const sec = moduleSections.find((s) => s.id === q.section_id);
    if (!sec) return undefined;
    return modulePapers.find((p) => p.id === sec.paper_id);
  };

  // Tahun (Paper) options scoped to the chosen Subjek; Bahagian options
  // scoped to the chosen Tahun — each level only makes sense once its parent
  // is picked, so the dropdowns cascade Subjek → Tahun → Bahagian.
  const papersForSubjectFilter = questionSubjectFilter === 'all'
    ? []
    : modulePapers.filter((p) => p.subject_id === questionSubjectFilter).sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  const sectionsForPaperFilter = questionPaperFilter === 'all'
    ? []
    : moduleSections.filter((s) => s.paper_id === questionPaperFilter);

  const handleQuestionSubjectFilterChange = (value: string) => {
    setQuestionSubjectFilter(value);
    setQuestionPaperFilter('all');
    setQuestionSectionFilter('all');
  };

  const handleQuestionPaperFilterChange = (value: string) => {
    setQuestionPaperFilter(value);
    setQuestionSectionFilter('all');
  };

  // Sort key for the question list: group by Subjek → Tahun → Bahagian, then
  // by each question's own `order` within its Bahagian — so the list always
  // reads 1, 2, 3, 4... matching the real exam paper, instead of whatever
  // order Supabase happened to return.
  const compareQuestionsForDisplay = (a: Question, b: Question) => {
    const subjA = getSubjectForQuestion(a);
    const subjB = getSubjectForQuestion(b);
    const subjCmp = (subjA?.name || '').localeCompare(subjB?.name || '');
    if (subjCmp !== 0) return subjCmp;

    const paperA = getPaperForQuestion(a);
    const paperB = getPaperForQuestion(b);
    const yearCmp = (paperA?.year ?? 0) - (paperB?.year ?? 0);
    if (yearCmp !== 0) return yearCmp;

    const secA = moduleSections.find((s) => s.id === a.section_id);
    const secB = moduleSections.find((s) => s.id === b.section_id);
    const secOrderCmp = (secA?.order ?? 0) - (secB?.order ?? 0);
    if (secOrderCmp !== 0) return secOrderCmp;

    return (a.order ?? 0) - (b.order ?? 0);
  };

  const filteredQuestions = moduleQuestions
    .filter((q) => {
      if (questionSubjectFilter !== 'all') {
        const subj = getSubjectForQuestion(q);
        if (subj?.id !== questionSubjectFilter) return false;
      }
      if (questionPaperFilter !== 'all') {
        const paper = getPaperForQuestion(q);
        if (paper?.id !== questionPaperFilter) return false;
      }
      if (questionSectionFilter !== 'all' && q.section_id !== questionSectionFilter) {
        return false;
      }
      if (isPkskModule && questionBahagianFilter !== 'all' && getBahagianForQuestion(q) !== questionBahagianFilter) {
        return false;
      }
      if (isPkskModule && questionArasFilter !== 'all' && q.aras_kesukaran !== questionArasFilter) {
        return false;
      }
      if (questionSearch.trim()) {
        return q.question_text.toLowerCase().includes(questionSearch.trim().toLowerCase());
      }
      return true;
    })
    .sort(compareQuestionsForDisplay);

  const handleDeleteClick = (q: Question) => {
    if (!confirm(`Padam soalan ini secara kekal?\n\n"${q.question_text.slice(0, 60)}..."`)) return;
    soundManager.playClick();
    onDeleteQuestion(q.id);
    if (editingId === q.id) resetForm();
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim() || !selectedSectionId) return;

    soundManager.playClick();

    const qId = editingId || `q-custom-${Date.now()}`;
    const optionsText = [optA, optB, optC, optD].filter((opt) => opt.trim().length > 0);

    const choices: Choice[] = optionsText.map((text, idx) => ({
      id: `c-custom-${Date.now()}-${idx}`,
      question_id: qId,
      option_text: text,
      is_correct: idx === correctOptIndex,
    }));

    const question: Question = {
      id: qId,
      section_id: selectedSectionId,
      question_text: qText.trim(),
      explanation: qExplanation.trim() || 'Soalan latihan tambahan oleh Pentadbir.',
      order: editingId ? (moduleQuestions.find((q) => q.id === editingId)?.order ?? moduleQuestions.length + 1) : moduleQuestions.length + 1,
      choices,
      image_url: imageUrl.trim() || undefined,
      ...(isPkskModule
        ? {
            answer_format: answerFormat,
            dimensi_personaliti: dimensiPersonaliti.trim() || undefined,
            aras_kesukaran: arasKesukaran,
          }
        : { difficulty }),
    };

    if (editingId) {
      onUpdateQuestion(question);
      setFormMsg('Soalan berjaya dikemas kini!');
      soundManager.playLevelUp();
    } else {
      onAddQuestion(question);
      setFormMsg('Soalan baru berjaya ditambah!');
      soundManager.playLevelUp();
    }

    resetForm();
    setTimeout(() => setFormMsg(''), 3000);
  };

  const handleImport = () => {
    setImportMsg(null);
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Data mesti berbentuk senarai (array) soalan — sila rujuk format contoh.');
      }

      const validAnswerFormats = ['mcq', 'ya_tidak', 'frekuensi3', 'likert5', 'betul_salah'];

      const newQuestions: Question[] = parsed.map((item: any, idx: number) => {
        if (!item.section_id || !item.question_text || !Array.isArray(item.choices) || item.choices.length < 2) {
          throw new Error(`Soalan #${idx + 1} tidak lengkap (perlukan section_id, question_text, dan sekurang-kurangnya 2 choices).`);
        }
        const qId = `q-import-${Date.now()}-${idx}`;
        const choices: Choice[] = item.choices.map((c: any, cIdx: number) => ({
          id: `c-import-${Date.now()}-${idx}-${cIdx}`,
          question_id: qId,
          option_text: c.text || c.option_text || '',
          is_correct: Boolean(c.correct ?? c.is_correct),
          ...(isPkskModule && c.nilai_skala !== undefined ? { nilai_skala: Number(c.nilai_skala) } : {}),
        }));

        const answerFormatItem = isPkskModule && validAnswerFormats.includes(item.answer_format) ? item.answer_format : 'mcq';
        // Scale-style formats (Likert/frekuensi) score by nilai_skala per
        // choice, not a single "correct" answer — only require one for the
        // MCQ-shaped formats.
        const needsCorrectFlag = !isPkskModule || answerFormatItem === 'mcq' || answerFormatItem === 'ya_tidak' || answerFormatItem === 'betul_salah';
        if (needsCorrectFlag && !choices.some((c) => c.is_correct)) {
          throw new Error(`Soalan #${idx + 1} tiada jawapan betul ditanda (correct: true).`);
        }

        return {
          id: qId,
          section_id: item.section_id,
          question_text: item.question_text,
          explanation: item.explanation || '',
          order: moduleQuestions.length + idx + 1,
          choices,
          image_url: item.image_url && String(item.image_url).trim() ? String(item.image_url).trim() : undefined,
          ...(isPkskModule
            ? {
                answer_format: answerFormatItem,
                dimensi_personaliti: item.dimensi_personaliti ? String(item.dimensi_personaliti).trim() : undefined,
                aras_kesukaran: [1, 2, 3].includes(item.aras_kesukaran) ? item.aras_kesukaran : undefined,
              }
            : { difficulty: ['mudah', 'sederhana', 'sukar'].includes(item.difficulty) ? item.difficulty : undefined }),
        } as Question;
      });

      soundManager.playLevelUp();
      onBulkAddQuestions(newQuestions);
      setImportMsg({ type: 'success', text: `${newQuestions.length} soalan berjaya diimport ke bank soalan!` });
      setImportText('');
    } catch (err: any) {
      soundManager.playClick();
      setImportMsg({ type: 'error', text: err.message || 'Format data tidak sah. Sila semak semula JSON anda.' });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_DDL);
    setCopiedSql(true);
    soundManager.playCoin();
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const loadParticipants = async () => {
    setLoadingParticipants(true);
    try {
      const all = await getAllRegisteredUsers();
      setParticipants(all.filter((u) => u.role !== 'admin'));
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'participants') {
      loadParticipants();
    }
  }, [activeTab]);

  const handleResetPassword = (participant: UserProfile) => {
    if (!confirm(`Reset kata laluan untuk ${participant.name} (${participant.login_id})?\n\nKata laluan lama akan tidak sah lagi.`)) return;
    soundManager.playClick();
    const newPassword = resetUserPassword(participant.id);
    setResetResult({ userId: participant.id, password: newPassword });
    soundManager.playLevelUp();
  };

  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [savingParticipant, setSavingParticipant] = useState(false);
  const [participantEditError, setParticipantEditError] = useState('');

  const handleStartEditParticipant = (participant: UserProfile) => {
    setEditingParticipantId(participant.id);
    setEditForm({ name: participant.name, phone: participant.phone || '', email: participant.contact_email || '' });
    setParticipantEditError('');
  };

  const handleSaveParticipant = async (participant: UserProfile) => {
    if (!editForm.name.trim()) {
      setParticipantEditError('Nama tidak boleh kosong.');
      return;
    }
    setSavingParticipant(true);
    setParticipantEditError('');
    const result = await updateUserProfileFields(participant.id, {
      name: editForm.name,
      phone: editForm.phone,
      contact_email: editForm.email,
    });
    setSavingParticipant(false);
    if (result.success) {
      soundManager.playClick();
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participant.id
            ? { ...p, name: editForm.name.trim(), phone: editForm.phone.trim() || undefined, contact_email: editForm.email.trim() || undefined }
            : p
        )
      );
      setEditingParticipantId(null);
    } else {
      setParticipantEditError(result.error || 'Gagal simpan. Sila cuba lagi.');
    }
  };

  const handleDeleteParticipant = async (participant: UserProfile) => {
    if (!confirm(`Padam akaun ${participant.name} (${participant.login_id}) secara kekal?\n\nSemua rekod kemajuan akan turut dipadam. Tindakan ini TIDAK boleh diundur.`)) return;
    soundManager.playClick();
    const result = await deleteUserAccount(participant.id);
    if (result.success) {
      setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
      if (editingParticipantId === participant.id) setEditingParticipantId(null);
    } else {
      alert(result.error || 'Gagal padam akaun.');
    }
  };

  // ---- Add new participant (admin-created, no self-registration needed) ----
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    name: '', username: '', password: '', role: 'student' as 'student' | 'parent', phone: '', email: '',
  });
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [addParticipantError, setAddParticipantError] = useState('');

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.name.trim() || !newParticipant.username.trim() || !newParticipant.password.trim()) {
      setAddParticipantError('Nama, ID Username, dan Kata Laluan wajib diisi.');
      return;
    }
    setAddingParticipant(true);
    setAddParticipantError('');
    const res = await registerUser(
      newParticipant.name.trim(),
      newParticipant.password.trim(),
      newParticipant.role,
      newParticipant.phone.trim(),
      newParticipant.username.trim()
    );
    if (res.error) {
      setAddingParticipant(false);
      setAddParticipantError(res.error);
      return;
    }
    if (newParticipant.email.trim()) {
      await updateUserProfileFields(res.profile.id, { contact_email: newParticipant.email.trim() });
    }
    setAddingParticipant(false);
    soundManager.playLevelUp();
    setNewParticipant({ name: '', username: '', password: '', role: 'student', phone: '', email: '' });
    setShowAddParticipant(false);
    loadParticipants();
  };

  const filteredParticipants = participants.filter((p) => {
    const q = participantSearch.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.login_id.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header — dedicated protected-route shell, same pattern as Parent portal */}
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-sand-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-ink-900 flex items-center justify-center shrink-0">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-display font-bold text-ink-900 leading-tight">EduQuest</span>
                <span className="text-[9px] font-bold uppercase bg-mist-100 text-mist-600 px-1.5 py-0.5 rounded-md">Modul SPPIM</span>
              </div>
              <span className="text-[11px] text-ink-500 font-semibold">Admin Dashboard • {user.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-ink-500 border border-sand-200 transition-colors"
              title={isDarkMode ? 'Tukar ke Mod Cerah' : 'Tukar ke Mod Gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-honey-400" /> : <Moon className="w-4 h-4 text-mist-500" />}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onLogout();
              }}
              className="p-2.5 rounded-xl bg-cream-100 hover:bg-clay-100 hover:text-clay-500 text-ink-500 border border-sand-200 transition-colors"
              title="Log Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-14">
        {/* Module selector — SPPIM & PKSK active, UASA reserved for a future module */}
        <div className="space-y-2">
          <h1 className="text-lg font-display font-bold text-ink-900">Pengurusan Bank Soalan</h1>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'sppim', name: 'SPPIM', active: true },
              { id: 'pksk', name: 'PKSK', active: true },
              { id: 'uasa', name: 'UASA', active: false },
            ].map((mod) => {
              const isSelected = activeModuleTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => mod.active && onModuleTabChange(mod.id as any)}
                  disabled={!mod.active}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 border transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-ink-900 text-white border-ink-900'
                      : mod.active
                      ? 'bg-cream-50 hover:bg-cream-100 text-ink-500 border-sand-200'
                      : 'bg-cream-100 text-ink-300 border-sand-200 cursor-not-allowed'
                  }`}
                >
                  <span>{mod.name}</span>
                  {!mod.active && (
                    <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-cream-200">
                      <Lock className="w-2.5 h-2.5" /> Akan Datang
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeModuleTab === 'uasa' ? (
          <div className="bg-cream-50 border border-sand-200 rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto text-ink-500">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-display font-bold text-ink-900">Modul Ini Belum Aktif</h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              Kerangka navigasi untuk modul ini sudah disediakan supaya senang dikembangkan kelak, tetapi bank soalan &amp; struktur kertas untuk modul ini belum dibina.
            </p>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="grid grid-cols-4 bg-cream-200 p-1 rounded-2xl">
              {[
                { id: 'manual', label: 'Borang Manual', icon: Plus },
                { id: 'import', label: 'Import Pukal', icon: Upload },
                { id: 'participants', label: 'Peserta', icon: Users },
                { id: 'setup', label: 'Skrip SQL Setup', icon: Database },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    soundManager.playClick();
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id ? 'bg-cream-50 text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: Manual Add / Update */}
            {activeTab === 'manual' && (
              <div className="space-y-6">
                <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-mist-600 flex items-center gap-2">
                      {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingId ? 'Kemas Kini Soalan' : 'Cipta Soalan Baru'}</span>
                    </h3>
                    {editingId && (
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          resetForm();
                        }}
                        className="text-xs font-semibold text-ink-500 hover:text-ink-700 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Batal Edit
                      </button>
                    )}
                  </div>

                  {formMsg && (
                    <div className="p-3 bg-sage-100 rounded-xl text-sage-600 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{formMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitForm} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1">Pilih Bahagian Soalan</label>
                      <select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} className={inputCls}>
                        {moduleSections.map((s) => {
                          const paper = modulePapers.find((p) => p.id === s.paper_id);
                          return (
                            <option key={s.id} value={s.id}>
                              {paper ? `${paper.title} — ` : ''}{s.title}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1">Teks Soalan Utama</label>
                      <textarea rows={2} value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Contoh: Apakah hukum bersuci daripada hadas sebelum mendirikan solat?" className={inputCls} required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">Pilihan A</label>
                        <input type="text" value={optA} onChange={(e) => setOptA(e.target.value)} placeholder="Pilihan A" className={inputCls} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">Pilihan B</label>
                        <input type="text" value={optB} onChange={(e) => setOptB(e.target.value)} placeholder="Pilihan B" className={inputCls} required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">Pilihan C (pilihan)</label>
                        <input type="text" value={optC} onChange={(e) => setOptC(e.target.value)} placeholder="Pilihan C" className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">Pilihan D (pilihan)</label>
                        <input type="text" value={optD} onChange={(e) => setOptD(e.target.value)} placeholder="Pilihan D" className={inputCls} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">Jawapan Betul Adalah</label>
                        <select value={correctOptIndex} onChange={(e) => setCorrectOptIndex(Number(e.target.value))} className={`${inputCls} text-honey-500 font-bold`}>
                          <option value={0}>Pilihan A</option>
                          <option value={1}>Pilihan B</option>
                          <option value={2}>Pilihan C</option>
                          <option value={3}>Pilihan D</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">Tahap Kesukaran</label>
                        {isPkskModule ? (
                          <select value={arasKesukaran} onChange={(e) => setArasKesukaran(Number(e.target.value) as 1 | 2 | 3)} className={inputCls}>
                            <option value={1}>Aras 1</option>
                            <option value={2}>Aras 2</option>
                            <option value={3}>Aras 3</option>
                          </select>
                        ) : (
                          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className={inputCls}>
                            <option value="mudah">Mudah</option>
                            <option value="sederhana">Sederhana</option>
                            <option value="sukar">Sukar</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {isPkskModule && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-ink-700 mb-1">Format Jawapan</label>
                          <select value={answerFormat} onChange={(e) => setAnswerFormat(e.target.value as any)} className={inputCls}>
                            {ANSWER_FORMAT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-ink-700 mb-1">Dimensi Personaliti (pilihan)</label>
                          <input
                            type="text"
                            value={dimensiPersonaliti}
                            onChange={(e) => setDimensiPersonaliti(e.target.value)}
                            placeholder="Contoh: Empati, Kepimpinan"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-mist-500" />
                        <span>Gambar Soalan (Pilihan)</span>
                      </label>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://... (link gambar dari Supabase Storage)"
                        className={inputCls}
                      />
                      <p className="text-[10px] text-ink-500 mt-1">
                        Upload gambar dalam Supabase → Storage → bucket "question-images", salin "Public URL", paste di sini. Cadangan: JPG/PNG, lebar maks ~1000px, bawah 500KB supaya cepat load.
                      </p>
                      {imageUrl.trim() && (
                        <div className="mt-2 rounded-xl border border-sand-200 overflow-hidden bg-cream-100 p-2">
                          <img
                            src={imageUrl.trim()}
                            alt="Pratonton gambar soalan"
                            className="max-h-40 mx-auto rounded-lg object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1">Nota Penerangan / Dalil</label>
                      <input type="text" value={qExplanation} onChange={(e) => setQExplanation(e.target.value)} placeholder="Penerangan hukum untuk jawapan betul..." className={inputCls} />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingId ? 'Simpan Perubahan' : 'Simpan & Tambah Soalan Ini'}</span>
                    </button>
                  </form>
                </div>

                {/* Existing question bank list — Edit / Delete */}
                <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-ink-700 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-mist-500" />
                    <span>Bank Soalan Sedia Ada ({filteredQuestions.length} / {moduleQuestions.length})</span>
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[140px]">
                      <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        placeholder="Cari teks soalan..."
                        className="w-full pl-8 pr-3 py-2 bg-cream-100 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-xl outline-none transition-colors"
                      />
                    </div>
                    <select
                      value={questionSubjectFilter}
                      onChange={(e) => handleQuestionSubjectFilterChange(e.target.value)}
                      className="w-full sm:w-36 bg-cream-100 border border-sand-300 text-ink-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-mist-400 truncate"
                    >
                      <option value="all">Semua Subjek</option>
                      {moduleSubjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <select
                      value={questionPaperFilter}
                      onChange={(e) => handleQuestionPaperFilterChange(e.target.value)}
                      disabled={questionSubjectFilter === 'all'}
                      className="w-full sm:w-32 bg-cream-100 border border-sand-300 text-ink-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-mist-400 disabled:opacity-50 disabled:cursor-not-allowed truncate"
                    >
                      <option value="all">
                        {questionSubjectFilter === 'all' ? 'Pilih Subjek' : 'Semua Tahun'}
                      </option>
                      {papersForSubjectFilter.map((p) => (
                        <option key={p.id} value={p.id}>{p.year}</option>
                      ))}
                    </select>
                    <select
                      value={questionSectionFilter}
                      onChange={(e) => setQuestionSectionFilter(e.target.value)}
                      disabled={questionPaperFilter === 'all'}
                      className="w-full sm:w-40 bg-cream-100 border border-sand-300 text-ink-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-mist-400 disabled:opacity-50 disabled:cursor-not-allowed truncate"
                    >
                      <option value="all">
                        {questionPaperFilter === 'all' ? 'Pilih Tahun' : 'Semua Bahagian'}
                      </option>
                      {sectionsForPaperFilter.map((s) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                    {isPkskModule && (
                      <>
                        <select
                          value={questionBahagianFilter}
                          onChange={(e) => setQuestionBahagianFilter(e.target.value as 'all' | 'A' | 'B')}
                          className="w-full sm:w-32 bg-cream-100 border border-sand-300 text-ink-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-mist-400 truncate"
                        >
                          <option value="all">Semua Bahagian</option>
                          <option value="A">Bahagian A</option>
                          <option value="B">Bahagian B</option>
                        </select>
                        <select
                          value={questionArasFilter}
                          onChange={(e) => setQuestionArasFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3))}
                          className="w-full sm:w-36 bg-cream-100 border border-sand-300 text-ink-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-mist-400 truncate"
                        >
                          <option value="all">Semua Aras</option>
                          <option value="1">Aras 1 (Mudah)</option>
                          <option value="2">Aras 2 (Sederhana)</option>
                          <option value="3">Aras 3 (Sukar)</option>
                        </select>
                      </>
                    )}
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {filteredQuestions.length === 0 ? (
                      <div className="text-center py-6 text-xs text-ink-500">Tiada soalan sepadan carian.</div>
                    ) : (
                      filteredQuestions.map((q) => {
                        const subj = getSubjectForQuestion(q);
                        return (
                          <div key={q.id} className="p-3 bg-cream-100 rounded-xl border border-sand-200 text-xs flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-mist-600">Soalan #{q.order ?? '-'}</span>
                                {subj && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-mist-100 text-mist-600">{subj.name}</span>
                                )}
                                <span className="text-ink-700 truncate">{q.question_text.split('\n')[0]}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-ink-500 bg-cream-200 px-2 py-0.5 rounded">{q.choices.length} Pilihan</span>
                                {q.image_url && (
                                  <span className="text-[10px] text-mist-600 bg-mist-100 px-2 py-0.5 rounded flex items-center gap-1">
                                    <ImageIcon className="w-2.5 h-2.5" /> Ada Gambar
                                  </span>
                                )}
                                {q.difficulty && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${DIFFICULTY_COLOR[q.difficulty]}`}>
                                    {DIFFICULTY_LABEL[q.difficulty]}
                                  </span>
                                )}
                                {isPkskModule && q.answer_format && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-100 text-sage-600">
                                    {ANSWER_FORMAT_OPTIONS.find((o) => o.value === q.answer_format)?.label || q.answer_format}
                                  </span>
                                )}
                                {isPkskModule && q.dimensi_personaliti && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-honey-100 text-honey-500">
                                    {q.dimensi_personaliti}
                                  </span>
                                )}
                                {isPkskModule && q.aras_kesukaran && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-clay-100 text-clay-500">
                                    Aras {q.aras_kesukaran}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => handleEditClick(q)} className="p-2 rounded-lg bg-cream-50 hover:bg-mist-100 text-mist-600 border border-sand-200 transition-colors" title="Kemas Kini">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteClick(q)} className="p-2 rounded-lg bg-cream-50 hover:bg-clay-100 text-clay-500 border border-sand-200 transition-colors" title="Padam">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Bulk Import */}
            {activeTab === 'import' && (
              <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-start gap-3 bg-mist-100 border border-mist-200 rounded-2xl p-4">
                  <AlertCircle className="w-4 h-4 text-mist-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-ink-700 leading-relaxed">
                    Ruang ini menerima <strong>format data berstruktur (JSON)</strong>, bukan SQL mentah — menjalankan SQL sebarangan terus dari pelayar bukan amalan selamat (kunci Supabase awam anda tidak dibenarkan buat operasi tulis sebegitu). Tampal senarai soalan mengikut format di bawah, untuk mana-mana modul (SPPIM, PKSK atau UASA kelak).
                  </p>
                </div>

                {importMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${importMsg.type === 'success' ? 'bg-sage-100 text-sage-600' : 'bg-clay-100 text-clay-500'}`}>
                    {importMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{importMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">Data Soalan (Format JSON)</label>
                  <textarea
                    rows={14}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={isPkskModule ? PKSK_IMPORT_PLACEHOLDER : IMPORT_PLACEHOLDER}
                    className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 font-mono text-xs rounded-2xl p-4 outline-none resize-none leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="w-full py-3 px-4 bg-mist-500 hover:bg-mist-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Soalan Ke Bank Soalan</span>
                </button>
              </div>
            )}

            {/* TAB 3: Participants — search, view, add, edit, delete, reset password */}
            {activeTab === 'participants' && (
              <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-mist-500" />
                    <span>Senarai Peserta ({participants.length})</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setShowAddParticipant((v) => !v); setAddParticipantError(''); }}
                      className="p-2 rounded-lg bg-cream-100 hover:bg-mist-100 text-mist-600 transition-colors"
                      title="Tambah Peserta Baru"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={loadParticipants}
                      className="p-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-ink-500 transition-colors"
                      title="Muat Semula"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingParticipants ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {showAddParticipant && (
                  <form onSubmit={handleAddParticipant} className="p-4 bg-mist-50 border border-mist-200 rounded-2xl space-y-2.5">
                    <h4 className="text-xs font-bold text-ink-700">Tambah Peserta Baru</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                        placeholder="Nama Penuh"
                        className="col-span-2 bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-2 outline-none"
                      />
                      <input
                        type="text"
                        value={newParticipant.username}
                        onChange={(e) => setNewParticipant({ ...newParticipant, username: e.target.value.toUpperCase() })}
                        placeholder="ID Username"
                        className="bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-2 outline-none font-mono"
                      />
                      <input
                        type="text"
                        value={newParticipant.password}
                        onChange={(e) => setNewParticipant({ ...newParticipant, password: e.target.value })}
                        placeholder="Kata Laluan / PIN"
                        className="bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-2 outline-none"
                      />
                      <select
                        value={newParticipant.role}
                        onChange={(e) => setNewParticipant({ ...newParticipant, role: e.target.value as 'student' | 'parent' })}
                        className="bg-cream-50 border border-sand-300 text-ink-900 text-xs rounded-lg px-2.5 py-2 outline-none"
                      >
                        <option value="student">Pelajar</option>
                        <option value="parent">Ibu Bapa</option>
                      </select>
                      <input
                        type="tel"
                        value={newParticipant.phone}
                        onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
                        placeholder="No. Telefon (Pilihan)"
                        className="bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-2 outline-none"
                      />
                      <input
                        type="email"
                        value={newParticipant.email}
                        onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                        placeholder="Emel (Pilihan)"
                        className="bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-2 outline-none"
                      />
                    </div>
                    {addParticipantError && <p className="text-[11px] text-clay-500">{addParticipantError}</p>}
                    <button
                      type="submit"
                      disabled={addingParticipant}
                      className="w-full py-2.5 bg-mist-500 hover:bg-mist-600 text-white text-xs font-bold rounded-xl disabled:opacity-60"
                    >
                      {addingParticipant ? 'Mencipta...' : 'Cipta Akaun'}
                    </button>
                  </form>
                )}

                <div className="relative">
                  <Search className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Cari nama atau ID Username..."
                    className="w-full pl-10 pr-4 py-2.5 bg-cream-100 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm rounded-xl outline-none transition-colors"
                  />
                </div>

                {resetResult && (
                  <div className="p-4 bg-sage-100 border border-sage-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-2 text-sage-600 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kata Laluan Baru Berjaya Dijana</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-700">Bagitahu pelajar PIN baru ini:</span>
                      <span className="font-mono font-bold text-lg text-sage-600 bg-cream-50 px-3 py-1 rounded-lg tracking-widest">
                        {resetResult.password}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {loadingParticipants ? (
                    <div className="text-center py-8 text-xs text-ink-500">Memuatkan senarai peserta...</div>
                  ) : filteredParticipants.length === 0 ? (
                    <div className="text-center py-8 text-xs text-ink-500">Tiada peserta dijumpai.</div>
                  ) : (
                    filteredParticipants.map((p) => (
                      <div key={p.id} className="p-3.5 bg-cream-100 border border-sand-200 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-mist-100 text-mist-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-ink-900 truncate">{p.name}</div>
                              <div className="flex items-center gap-2 text-[11px] text-ink-500">
                                <span className="font-mono">{p.login_id}</span>
                                <span className="capitalize px-1.5 py-0.5 bg-cream-200 rounded text-[10px] font-bold">{p.role || 'student'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => (editingParticipantId === p.id ? setEditingParticipantId(null) : handleStartEditParticipant(p))}
                              className="p-2 bg-cream-50 hover:bg-mist-100 text-mist-600 border border-sand-200 hover:border-mist-300 rounded-xl transition-colors"
                              title="Kemas Kini Profil"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(p)}
                              className="px-3 py-2 bg-cream-50 hover:bg-honey-100 text-honey-500 border border-sand-200 hover:border-honey-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="Reset Kata Laluan"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reset PIN</span>
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(p)}
                              className="p-2 bg-cream-50 hover:bg-clay-100 text-clay-500 border border-sand-200 hover:border-clay-300 rounded-xl transition-colors"
                              title="Padam Akaun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {editingParticipantId === p.id ? (
                          <div className="pl-12 space-y-2">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              placeholder="Nama Penuh"
                              className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-1.5 outline-none"
                            />
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              placeholder="No. Telefon"
                              className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-1.5 outline-none"
                            />
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              placeholder="Emel"
                              className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-xs rounded-lg px-2.5 py-1.5 outline-none"
                            />
                            {participantEditError && <p className="text-[10px] text-clay-500">{participantEditError}</p>}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveParticipant(p)}
                                disabled={savingParticipant}
                                className="px-3 py-1.5 bg-mist-500 hover:bg-mist-600 text-white text-xs font-bold rounded-lg disabled:opacity-60"
                              >
                                {savingParticipant ? '...' : 'Simpan'}
                              </button>
                              <button
                                onClick={() => setEditingParticipantId(null)}
                                className="px-3 py-1.5 bg-cream-50 hover:bg-cream-200 text-ink-500 text-xs font-bold rounded-lg"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pl-12 space-y-1 text-[11px] text-ink-500">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-ink-300 shrink-0" />
                              <span>{p.phone || 'Tiada nombor telefon'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-ink-300 shrink-0" />
                              <span className="truncate">{p.contact_email || 'Tiada emel'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <p className="text-[11px] text-ink-500">
                  Nota: Reset PIN menjana kata laluan 6-digit baru serta-merta. Padam akaun turut memadam semua rekod kemajuan dan tidak boleh diundur.
                </p>
              </div>
            )}

            {/* TAB 4: SQL Setup Script (Supabase table setup — separate from question import) */}
            {activeTab === 'setup' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isSupabaseConfigured ? 'bg-sage-100 border-sage-200 text-sage-600' : 'bg-honey-100 border-honey-200 text-honey-500'}`}>
                  <Database className="w-6 h-6 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold">
                      {isSupabaseConfigured ? 'Env Var Dikesan & Format Sah' : 'Mod Hibrid Aktif (Local Fallback)'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {isSupabaseConfigured
                        ? 'Format URL & kunci nampak betul — tapi ini belum confirm sambungan sebenar. Klik "Test Sambungan" di bawah.'
                        : supabaseDiagnostic || 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tidak dikesan.'}
                    </p>
                  </div>
                </div>

                <div className="bg-cream-50 border border-sand-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-ink-900">Test Sambungan Sebenar</h4>
                    <button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="px-3 py-1.5 bg-mist-500 hover:bg-mist-600 disabled:opacity-60 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                      <span>{testingConnection ? 'Menguji...' : 'Test Sambungan'}</span>
                    </button>
                  </div>
                  {connectionTestResult && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${connectionTestResult.ok ? 'bg-sage-100 text-sage-600' : 'bg-clay-100 text-clay-500'}`}>
                      {connectionTestResult.message}
                    </div>
                  )}
                  <p className="text-[11px] text-ink-500">
                    Ini menguji sambungan betul-betul (buat query sebenar ke Supabase), bukan setakat semak format env var.
                  </p>
                </div>

                <div className="bg-cream-50 border border-sand-200 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-mist-500" />
                      <h3 className="text-sm font-bold text-ink-900">Skrip DDL Postgres (Sekali Jalani Di Supabase SQL Editor)</h3>
                    </div>
                    <button onClick={handleCopySql} className="py-1.5 px-3 bg-mist-500 hover:bg-mist-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedSql ? 'Berjaya Disalin!' : 'Salin Skrip SQL'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={12}
                    value={SUPABASE_SQL_SETUP_DDL}
                    className="w-full bg-ink-900 border border-sand-300 text-mist-200 font-mono text-xs rounded-2xl p-4 outline-none resize-none leading-relaxed"
                  />
                  <p className="text-[11px] text-ink-500">
                    Ini untuk persediaan struktur jadual pangkalan data sekali sahaja (bukan untuk import soalan harian — guna tab &quot;Import Pukal&quot; untuk itu).
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
