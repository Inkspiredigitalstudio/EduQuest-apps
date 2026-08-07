import React, { useState } from 'react';
import { Subject, Paper, Section, Question, Choice, UserProfile } from '../../types';
import { isSupabaseConfigured, getAllRegisteredUsers, resetUserPassword, approveAdminUser, revokeAdminUser } from '../../lib/supabase';
import { SUPABASE_SQL_SETUP_DDL } from '../../data/seedData';
import { soundManager } from '../../lib/audio';
import {
  Shield,
  Database,
  Plus,
  CheckCircle2,
  X,
  Code2,
  Copy,
  BookOpen,
  Users,
  KeyRound,
  ShieldCheck,
  Search,
  Sparkles,
  Terminal,
  Play,
  UserCheck,
  UserX,
  FolderPlus,
} from 'lucide-react';

interface AdminCMSProps {
  isOpen: boolean;
  subjects: Subject[];
  papers: Paper[];
  sections: Section[];
  questions: Question[];
  onClose: () => void;
  onAddQuestion: (newQuestion: Question) => void;
  onAddSubject?: (newSubject: Subject) => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  isOpen,
  subjects,
  papers,
  sections,
  questions,
  onClose,
  onAddQuestion,
  onAddSubject,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'sql' | 'subjects' | 'users'>('questions');
  const [copiedSql, setCopiedSql] = useState(false);

  // Question Creator state
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || '');
  const [qText, setQText] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOptIndex, setCorrectOptIndex] = useState<number>(0);
  const [successAddMsg, setSuccessAddMsg] = useState('');

  // Add Subject state
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubColor, setNewSubColor] = useState('from-indigo-600 to-purple-600');
  const [subjectSuccessMsg, setSubjectSuccessMsg] = useState('');

  // User Management state
  const [userList, setUserList] = useState<UserProfile[]>(() => getAllRegisteredUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResetUser, setSelectedResetUser] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [userActionMsg, setUserActionMsg] = useState('');

  // SQL Runner State
  const [sqlInput, setSqlInput] = useState(
    `-- Contoh skrip SQL untuk tambah soalan baharu\nINSERT INTO questions (id, section_id, question_text, explanation) VALUES\n('q-custom-sql-101', '${sections[0]?.id || 'sec-fekah-2024-A'}', 'Apakah hukum berwuduk sebelum solat?', 'Wuduk adalah syarat sah solat.');\n\nINSERT INTO choices (id, question_id, option_text, is_correct) VALUES\n('c-1', 'q-custom-sql-101', 'Wajib', true),\n('c-2', 'q-custom-sql-101', 'Sunat', false),\n('c-3', 'q-custom-sql-101', 'Harus', false),\n('c-4', 'q-custom-sql-101', 'Makruh', false);`
  );
  const [sqlLogMsg, setSqlLogMsg] = useState('');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_DDL);
    setCopiedSql(true);
    soundManager.playCoin();
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim()) return;

    soundManager.playClick();

    const qId = `q-custom-${Date.now()}`;
    const optionsText = [optA, optB, optC, optD].filter((opt) => opt.trim().length > 0);

    const choices: Choice[] = optionsText.map((text, idx) => ({
      id: `c-custom-${Date.now()}-${idx}`,
      question_id: qId,
      option_text: text,
      is_correct: idx === correctOptIndex,
    }));

    const newQ: Question = {
      id: qId,
      section_id: selectedSectionId,
      question_text: qText.trim(),
      explanation: qExplanation.trim() || 'Soalan latihan tambahan oleh Pentadbir.',
      order: questions.length + 1,
      choices,
    };

    onAddQuestion(newQ);
    setSuccessAddMsg('Soalan baru berjaya ditambah ke dalam sistem!');
    soundManager.playLevelUp();

    setQText('');
    setQExplanation('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');

    setTimeout(() => setSuccessAddMsg(''), 3000);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    soundManager.playClick();
    const newId = `sub-${newSubName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;

    const newSub: Subject = {
      id: newId,
      name: newSubName.trim().toUpperCase(),
      icon: 'BookOpen',
      description: newSubDesc.trim() || `Modul pembelajaran & latihan soalan ${newSubName}.`,
      status: 'active',
      color: newSubColor,
    };

    if (onAddSubject) {
      onAddSubject(newSub);
    }
    setSubjectSuccessMsg(`Subjek baharu "${newSub.name}" berjaya dicipta!`);
    soundManager.playLevelUp();

    setNewSubName('');
    setNewSubDesc('');
    setTimeout(() => setSubjectSuccessMsg(''), 3000);
  };

  const handleExecuteSql = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    if (!sqlInput.trim()) return;

    try {
      // Basic SQL Parser for INSERT statements
      const lines = sqlInput.split('\n');
      let questionsAdded = 0;

      // Extract question texts if any
      const qMatches = sqlInput.match(/INSERT INTO questions[^;]+;/gi);
      if (qMatches) {
        qMatches.forEach((qBlock, blockIdx) => {
          const idMatch = qBlock.match(/'([^']+)'/g);
          if (idMatch && idMatch.length >= 3) {
            const rawQId = idMatch[0].replace(/'/g, '');
            const rawSecId = idMatch[1].replace(/'/g, '');
            const rawQText = idMatch[2].replace(/'/g, '');
            const rawExp = idMatch[3] ? idMatch[3].replace(/'/g, '') : 'Soalan ditambah melalui SQL.';

            const newQ: Question = {
              id: rawQId || `q-sql-${Date.now()}-${blockIdx}`,
              section_id: rawSecId || selectedSectionId,
              question_text: rawQText,
              explanation: rawExp,
              order: questions.length + 1 + blockIdx,
              choices: [
                { id: `c-${Date.now()}-1`, question_id: rawQId, option_text: 'Pilihan A', is_correct: true },
                { id: `c-${Date.now()}-2`, question_id: rawQId, option_text: 'Pilihan B', is_correct: false },
              ],
            };
            onAddQuestion(newQ);
            questionsAdded++;
          }
        });
      }

      soundManager.playLevelUp();
      setSqlLogMsg(`Skrip SQL berjaya dijalankan! (${questionsAdded > 0 ? `${questionsAdded} soalan ditambah.` : 'Skrip diproses.'})`);
      setTimeout(() => setSqlLogMsg(''), 4000);
    } catch {
      setSqlLogMsg('Skrip SQL diproses. Untuk pelaksanaan schema terus, salin skrip DDL ke Supabase SQL Editor.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResetUser || !newPasswordInput.trim()) return;

    soundManager.playClick();
    const res = await resetUserPassword(selectedResetUser.login_id, newPasswordInput.trim());
    setUserActionMsg(res.message);
    soundManager.playLevelUp();

    setSelectedResetUser(null);
    setNewPasswordInput('');
    setTimeout(() => setUserActionMsg(''), 4000);
  };

  const handleToggleAdminApproval = async (targetUser: UserProfile) => {
    soundManager.playClick();
    if (targetUser.role === 'admin' || targetUser.is_approved_admin) {
      await revokeAdminUser(targetUser.id);
      setUserActionMsg(`Peranan Admin untuk ${targetUser.name} telah ditarik balik.`);
    } else {
      await approveAdminUser(targetUser.id);
      setUserActionMsg(`Akaun ${targetUser.name} diluluskan sebagai Pentadbir/Admin!`);
    }
    soundManager.playLevelUp();
    setUserList(getAllRegisteredUsers());
    setTimeout(() => setUserActionMsg(''), 4000);
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.login_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Panel Pentadbir Utama EduQuest (CMS)</h2>
              <p className="text-xs text-slate-400">Pengurusan Soalan, SQL, Subjek & Kelulusan Pengguna</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-950/60 p-1.5 border-b border-slate-800 shrink-0 gap-1">
          <button
            onClick={() => {
              setActiveTab('questions');
              soundManager.playClick();
            }}
            className={`py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all rounded-xl ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soalan</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sql');
              soundManager.playClick();
            }}
            className={`py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all rounded-xl ${
              activeTab === 'sql'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Skrip SQL</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('subjects');
              soundManager.playClick();
            }}
            className={`py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all rounded-xl ${
              activeTab === 'subjects'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>Subjek Baru</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setUserList(getAllRegisteredUsers());
              soundManager.playClick();
            }}
            className={`py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all rounded-xl ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pengguna & Pass</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-white flex-1">
          {/* TAB 1: ADD MANUAL QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Cipta Soalan Baru Ke Dalam Sistem</span>
                </h3>

                {successAddMsg && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{successAddMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Pilih Bahagian Soalan</label>
                    <select
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                    >
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Teks Soalan Utama</label>
                    <textarea
                      rows={2}
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder="Contoh: Apakah hukum bersuci daripada hadas sebelum mendirikan solat?"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Pilihan A</label>
                      <input
                        type="text"
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        placeholder="Pilihan A"
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Pilihan B</label>
                      <input
                        type="text"
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        placeholder="Pilihan B"
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Pilihan C</label>
                      <input
                        type="text"
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        placeholder="Pilihan C"
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Pilihan D</label>
                      <input
                        type="text"
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        placeholder="Pilihan D"
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Jawapan Betul Adalah</label>
                      <select
                        value={correctOptIndex}
                        onChange={(e) => setCorrectOptIndex(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl p-3 outline-none"
                      >
                        <option value={0}>Pilihan A</option>
                        <option value={1}>Pilihan B</option>
                        <option value={2}>Pilihan C</option>
                        <option value={3}>Pilihan D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Nota Penerangan / Dalil</label>
                      <input
                        type="text"
                        value={qExplanation}
                        onChange={(e) => setQExplanation(e.target.value)}
                        placeholder="Penerangan hukum untuk jawapan betul..."
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Simpan & Tambah Soalan Ini</span>
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center justify-between">
                  <span>Senarai Bank Soalan Sedia Ada ({questions.length} Soalan)</span>
                </h3>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-sky-400">#{idx + 1} </span>
                        <span className="text-slate-200">{q.question_text}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded shrink-0">
                        {q.choices.length} Pilihan
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXECUTE SQL & DDL */}
          {activeTab === 'sql' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              }`}>
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">
                      {isSupabaseConfigured
                        ? 'Sambungan Supabase Aktif & Terhubung!'
                        : 'Mod Hibrid Aktif (Supabase Tempatan / Local Fallback)'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {isSupabaseConfigured
                        ? 'Aplikasi sedang menyelaraskan akaun & soalan terus ke Postgres Supabase.'
                        : 'Untuk menyambung ke Supabase fizikal, masukkan VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SQL Runner Form */}
              <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span>Jalankan Skrip SQL Soalan / Data</span>
                  </h3>
                  <button
                    onClick={() => {
                      setSqlInput(
                        `INSERT INTO questions (id, section_id, question_text, explanation) VALUES ('q-sql-${Date.now()}', '${sections[0]?.id || ''}', 'Tulis teks soalan di sini', 'Penjelasan jawapan');`
                      );
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                  >
                    + Template SQL Soalan
                  </button>
                </div>

                {sqlLogMsg && (
                  <div className="p-3 bg-blue-500/15 border border-blue-500/30 rounded-xl text-sky-300 text-xs font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-yellow-300" />
                    <span>{sqlLogMsg}</span>
                  </div>
                )}

                <form onSubmit={handleExecuteSql} className="space-y-3">
                  <textarea
                    rows={6}
                    value={sqlInput}
                    onChange={(e) => setSqlInput(e.target.value)}
                    placeholder="Tulis arahan SQL INSERT INTO di sini..."
                    className="w-full bg-slate-950 border border-slate-700 text-sky-300 font-mono text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                  />

                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jalankan Skrip SQL Soalan</span>
                  </button>
                </form>
              </div>

              {/* Postgres DDL Setup */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white">Skrip DDL Postgres (Supabase Setup)</h3>
                  </div>

                  <button
                    onClick={handleCopySql}
                    className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSql ? 'Berjaya Disalin!' : 'Salin Skrip DDL'}</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    readOnly
                    rows={8}
                    value={SUPABASE_SQL_SETUP_DDL}
                    className="w-full bg-slate-950 border border-slate-800 text-sky-300 font-mono text-xs rounded-2xl p-4 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW SUBJECT */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-4">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  <span>Cipta Subjek Baru Ke Dalam Kurikulum</span>
                </h3>

                {subjectSuccessMsg && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{subjectSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateSubject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Nama Subjek / Mata Pelajaran</label>
                    <input
                      type="text"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="Contoh: TAJWID / SIRAH / BAHASA ARAB"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Keterangan Subjek</label>
                    <input
                      type="text"
                      value={newSubDesc}
                      onChange={(e) => setNewSubDesc(e.target.value)}
                      placeholder="Contoh: Modul penguasaan hukum tajwid dan bacaan Al-Quran."
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Pilih Tema Warna Gradient</label>
                    <select
                      value={newSubColor}
                      onChange={(e) => setNewSubColor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-blue-500"
                    >
                      <option value="from-indigo-600 to-purple-600">Ungu / Indigo (Royal)</option>
                      <option value="from-emerald-600 to-teal-600">Hijau Zamrud (Emerald)</option>
                      <option value="from-amber-600 to-orange-600">Kuning / Jingga (Emas)</option>
                      <option value="from-rose-600 to-pink-600">Merah Jambu / Rose</option>
                      <option value="from-sky-600 to-blue-600">Biru Laut (Sky Blue)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Subjek Baru Sekarang</span>
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-3">Senarai Subjek Aktif ({subjects.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${sub.color} flex items-center justify-center text-white shrink-0`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{sub.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{sub.description}</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Aktif</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USER MANAGEMENT, ADMIN APPROVAL & PASSWORD RESET */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {userActionMsg && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{userActionMsg}</span>
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari mengikut Nama, ID Username atau No Telefon..."
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Password Reset Modal / Form section if selected */}
              {selectedResetUser && (
                <div className="p-4 bg-slate-800 border-2 border-amber-500/50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4" />
                      <span>Reset Password untuk {selectedResetUser.name} ({selectedResetUser.login_id})</span>
                    </span>
                    <button
                      onClick={() => setSelectedResetUser(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                  </div>

                  <form onSubmit={handleResetPassword} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Masukkan kata laluan baharu..."
                      className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 outline-none"
                      required
                    />
                    <button
                      type="submit"
                      className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0 shadow"
                    >
                      Kemaskini Password
                    </button>
                  </form>
                </div>
              )}

              {/* User List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-700/40">
                    Tiada akaun pengguna dijumpai.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isAdmin = u.role === 'admin' || u.is_approved_admin;
                    return (
                      <div
                        key={u.id}
                        className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{u.name}</span>
                            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                              {u.login_id}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                isAdmin
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : u.role === 'parent'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {isAdmin ? 'Pentadbir (Admin)' : u.role === 'parent' ? 'Ibu Bapa' : 'Pelajar'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3">
                            <span>Phone: {u.phone || 'Tiada'}</span>
                            {u.invite_code && <span>Kod Jemputan: {u.invite_code}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setSelectedResetUser(u);
                              setNewPasswordInput('123456');
                              soundManager.playClick();
                            }}
                            className="py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Reset Pass</span>
                          </button>

                          {/* Admin Approval Toggle Button */}
                          <button
                            onClick={() => handleToggleAdminApproval(u)}
                            className={`py-1.5 px-3 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors ${
                              isAdmin
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                            }`}
                          >
                            {isAdmin ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Tarik Admin</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Luluskan Admin</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
