import React, { useState } from 'react';
import { registerUser, loginUser } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { soundManager } from '../../lib/audio';
import { User, Lock, Phone, Sparkles, Key, CheckCircle2, Copy, AlertCircle, ArrowRight, X, GraduationCap, Heart, ShieldCheck, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [displayName, setDisplayName] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'parent' | 'admin'>('student');

  const [loginIdInput, setLoginIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Success Card state for displaying generated Login ID & info
  const [registeredProfile, setRegisteredProfile] = useState<UserProfile | null>(null);
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAutoGenerateUsername = () => {
    soundManager.playClick();
    const cleanName = displayName.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const base = cleanName.length >= 3 ? cleanName.slice(0, 8) : 'USER';
    const rand = Math.floor(100 + Math.random() * 900);
    setCustomUsername(`${base}${rand}`);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!displayName.trim()) {
      setErrorMsg('Sila masukkan Nama Penuh atau Gelaran anda.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Kata Laluan / PIN mesti mengandungi sekurang-kurangnya 6 aksara (cth: 123456).');
      return;
    }

    setLoading(true);
    soundManager.playClick();

    const res = await registerUser(displayName.trim(), password, role, phone.trim(), customUsername.trim());
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      soundManager.playLevelUp();
      setRegisteredId(res.loginId);
      setRegisteredProfile(res.profile);
      if (phone.trim()) {
        localStorage.setItem('sppim_parent_phone', phone.trim());
      }
      onSuccess(res.profile);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdInput.trim()) {
      setErrorMsg('Sila masukkan ID Username / Login ID anda (cth: AHMAD123).');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Sila masukkan Kata Laluan / PIN keselamatan anda (6+ aksara).');
      return;
    }

    setLoading(true);
    soundManager.playClick();

    const res = await loginUser(loginIdInput.trim(), password);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.profile) {
      soundManager.playCoin();
      if (res.profile.phone) {
        localStorage.setItem('sppim_parent_phone', res.profile.phone);
      }
      onSuccess(res.profile);
      onClose();
    }
  };

  const handleCopyId = () => {
    if (registeredId) {
      navigator.clipboard.writeText(registeredId);
      setCopied(true);
      soundManager.playCoin();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQuickDemo = async () => {
    soundManager.playClick();
    setLoading(true);
    const res = await loginUser('DEMO123', '123456');
    setLoading(false);
    if (res.profile) {
      soundManager.playCoin();
      onSuccess(res.profile);
      onClose();
    }
  };

  const handleQuickDemoAdmin = async () => {
    soundManager.playClick();
    setLoading(true);
    const res = await loginUser('ADMIN101', '123456');
    setLoading(false);
    if (res.profile) {
      soundManager.playCoin();
      onSuccess({ ...res.profile, role: 'admin', is_approved_admin: true });
      onClose();
    }
  };

  const handleQuickDemoParent = async () => {
    soundManager.playClick();
    setLoading(true);
    const res = await loginUser('DEMO123', '123456');
    setLoading(false);
    if (res.profile) {
      soundManager.playCoin();
      onSuccess({ ...res.profile, role: 'parent', name: 'Ibu/Bapa (Ahmad Zaki)' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Pendaftaran & Log Masuk</h2>
          <p className="text-xs text-blue-100 font-extrabold tracking-wide mt-1">
            EduQuest SPPIM Quest Hub (Pelajar, Ibu Bapa & Guru)
          </p>
        </div>

        {/* Registered ID Card Display */}
        {registeredId && registeredProfile ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Akaun Berjaya Dicipta!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Akaun peranan <span className="text-amber-400 font-extrabold capitalize">{registeredProfile.role}</span> anda sedia digunakan. Sila simpan ID Username ini.
              </p>
            </div>

            <div className="bg-slate-800 border-2 border-sky-500/40 rounded-2xl p-4 text-center relative group">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">ID Username / Login ID Anda</span>
              <div className="text-2xl font-black font-mono text-sky-400 mt-1 tracking-widest">{registeredId}</div>
              {registeredProfile.invite_code && (
                <div className="mt-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 py-1 px-3 rounded-lg border border-emerald-500/30 inline-block">
                  Kod Pautan / Invite: <span className="font-mono font-bold">{registeredProfile.invite_code}</span>
                </div>
              )}
              <div className="mt-3">
                <button
                  onClick={handleCopyId}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 mx-auto bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/30 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Berjaya Disalin!' : 'Salin ID Username'}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Terus ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Tab selector */}
            <div className="grid grid-cols-2 bg-slate-800 p-1 rounded-2xl mb-6 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  soundManager.playClick();
                }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Daftar Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  soundManager.playClick();
                }}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Log Masuk
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* 1. Display Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Nama Penuh / Display Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Contoh: Ahmad Zaki / Ustaz Farhan"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 2. Username / Login ID (Custom or Auto) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">ID Username / Login ID</label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateUsername}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Jana ID Otomatik</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={customUsername}
                      onChange={(e) => setCustomUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Contoh: ZAKI123 (Kosongkan utk auto)"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white text-sm font-mono tracking-wider uppercase rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Password / PIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Kata Laluan / PIN (Sekurang-kurangnya 6 Aksara)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contoh: 123456"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white text-sm font-mono tracking-widest rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* 4. Phone Number (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>No. Telefon (Pilihan)</span>
                    <span className="text-[10px] text-emerald-400 font-medium">📱 Utk Notifikasi / WhatsApp</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 0123456789"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 text-white text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 5. Choose Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Pilih Peranan Akaun (Choose Role)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('student');
                        soundManager.playClick();
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                        role === 'student'
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <GraduationCap className={`w-6 h-6 ${role === 'student' ? 'text-blue-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-black">Pelajar (Student)</div>
                        <div className="text-[10px] opacity-75">Kuiz, XP & Battle 1v1</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole('parent');
                        soundManager.playClick();
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                        role === 'parent'
                          ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${role === 'parent' ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-black">Ibu Bapa (Parent)</div>
                        <div className="text-[10px] opacity-75">Pantau Prestasi Anak</div>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Mencipta Akaun...' : 'Daftar Akaun Sekarang'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">ID Username / Login ID</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={loginIdInput}
                      onChange={(e) => setLoginIdInput(e.target.value.toUpperCase())}
                      placeholder="Contoh: AHMAD123"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white text-sm font-mono tracking-wider uppercase rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Kata Laluan / PIN</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-white text-sm font-mono tracking-widest rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Memproses...' : 'Log Masuk Akaun'}
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">Ingin cuba dulu tanpa mendaftar?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="w-full py-2.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Pelajar</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoParent}
                  className="w-full py-2.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                  <span>Ibu Bapa</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoAdmin}
                  className="w-full py-2.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

