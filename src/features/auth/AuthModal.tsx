import React, { useState } from 'react';
import { registerUser, loginUser, requestPasswordReset } from '../../lib/supabase';
import { UserProfile } from '../../types';
import { soundManager } from '../../lib/audio';
import { User, Lock, Phone, Sparkles, Key, CheckCircle2, Copy, AlertCircle, ArrowRight, X, GraduationCap, Heart, RefreshCw, HelpCircle, Send, ArrowLeft, Mail, School } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'register' | 'login' | 'forgot'>('register');
  const [displayName, setDisplayName] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [contactEmail, setContactEmail] = useState('');
  const [schoolLevel, setSchoolLevel] = useState<'rendah' | 'menengah' | ''>('');
  const [schoolYear, setSchoolYear] = useState<number | ''>('');
  const [schoolForm, setSchoolForm] = useState<number | ''>('');

  const [loginIdInput, setLoginIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotLoginId, setForgotLoginId] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'form' | 'success'>('form');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotResult, setForgotResult] = useState<{ emailSent?: boolean; hasParentEmail?: boolean }>({});

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

    const res = await registerUser(
      displayName.trim(),
      password,
      role,
      phone.trim(),
      customUsername.trim(),
      role === 'student' && schoolLevel
        ? {
            level: schoolLevel,
            year: schoolLevel === 'rendah' && schoolYear ? Number(schoolYear) : undefined,
            form: schoolLevel === 'menengah' && schoolForm ? Number(schoolForm) : undefined,
          }
        : undefined,
      contactEmail.trim() || undefined
    );
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

  const handleForgotResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotLoginId.trim() || !forgotPhone.trim()) return;

    if (forgotNewPassword.length < 6) {
      setForgotError('Kata laluan baru mesti sekurang-kurangnya 6 aksara.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Kata laluan baru dan pengesahan tidak sepadan.');
      return;
    }

    soundManager.playClick();
    setForgotLoading(true);
    setForgotError('');

    const res = await requestPasswordReset(forgotLoginId.trim(), forgotPhone.trim(), forgotNewPassword);
    setForgotLoading(false);

    if (res.success) {
      soundManager.playLevelUp();
      setForgotResult({ emailSent: res.emailSent, hasParentEmail: res.hasParentEmail });
      setForgotStep('success');
    } else {
      setForgotError(res.error || 'Gagal tukar kata laluan. Sila cuba lagi.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-cream-50 border border-sand-200 rounded-3xl shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-mist-100 p-6 text-center relative border-b border-sand-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-ink-500 hover:text-ink-900 hover:bg-cream-50/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-cream-50 border border-mist-200 flex items-center justify-center mx-auto mb-3 text-mist-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-ink-900">Pendaftaran &amp; Log Masuk</h2>
          <p className="text-xs text-ink-500 font-medium mt-1">
            EduQuest — Modul SPPIM (Pelajar &amp; Ibu Bapa)
          </p>
        </div>

        {registeredId && registeredProfile ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-sage-100 border-2 border-sage-300 text-sage-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-display font-bold text-ink-900">Akaun Berjaya Dicipta!</h3>
              <p className="text-xs text-ink-500 mt-1">
                Akaun peranan <span className="text-ink-700 font-bold capitalize">{registeredProfile.role}</span> anda sedia digunakan. Sila simpan ID Username ini.
              </p>
            </div>

            <div className="bg-cream-100 border-2 border-mist-200 rounded-2xl p-4 text-center">
              <span className="text-xs uppercase font-bold text-ink-500 tracking-wider">ID Username / Login ID Anda</span>
              <div className="text-2xl font-display font-bold text-mist-700 mt-1 tracking-widest">{registeredId}</div>
              {registeredProfile.invite_code && (
                <div className="mt-2 text-xs font-semibold text-sage-600 bg-sage-100 py-1 px-3 rounded-lg border border-sage-200 inline-block">
                  Kod Pautan: <span className="font-mono font-bold">{registeredProfile.invite_code}</span>
                </div>
              )}
              <div className="mt-3">
                <button
                  onClick={handleCopyId}
                  className="text-xs font-semibold text-mist-600 hover:text-mist-700 flex items-center justify-center gap-1 mx-auto bg-mist-100 hover:bg-mist-200 px-3 py-1.5 rounded-lg border border-mist-200 transition-colors"
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
              className="w-full py-3.5 px-4 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <span>Terus ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Tab selector */}
            <div className="grid grid-cols-2 bg-cream-200 p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  soundManager.playClick();
                }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-colors ${
                  mode === 'register' ? 'bg-cream-50 text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                Daftar Baru
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  soundManager.playClick();
                }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-colors ${
                  mode === 'login' ? 'bg-cream-50 text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                Log Masuk
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-clay-100 border border-clay-200 rounded-xl text-clay-500 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">Nama Penuh</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Contoh: Ahmad Zaki"
                      className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-ink-700">ID Username / Login ID</label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateUsername}
                      className="text-[11px] text-mist-600 hover:text-mist-700 font-bold flex items-center gap-1 bg-mist-100 px-2 py-0.5 rounded-lg"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Jana Otomatik</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={customUsername}
                      onChange={(e) => setCustomUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Contoh: ZAKI123 (Kosongkan utk auto)"
                      className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm font-mono tracking-wider uppercase rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">Kata Laluan / PIN (Min. 6 Aksara)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contoh: 123456"
                      className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm font-mono tracking-widest rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5 flex items-center justify-between">
                    <span>No. Telefon (Pilihan)</span>
                    <span className="text-[10px] text-sage-600 font-medium">Utk Notifikasi</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-sage-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 0123456789"
                      className="w-full bg-cream-50 border border-sand-300 focus:border-sage-400 text-ink-900 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">Emel (Pilihan)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Contoh: nama@email.com"
                      className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-2">Pilih Peranan Akaun</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRole('student');
                        soundManager.playClick();
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-colors flex flex-col items-center justify-center text-center gap-1.5 ${
                        role === 'student'
                          ? 'bg-mist-100 border-mist-400 text-ink-900'
                          : 'bg-cream-50 border-sand-200 text-ink-500 hover:border-sand-300'
                      }`}
                    >
                      <GraduationCap className={`w-6 h-6 ${role === 'student' ? 'text-mist-600' : 'text-ink-300'}`} />
                      <div>
                        <div className="text-xs font-bold">Pelajar</div>
                        <div className="text-[10px] opacity-75">Soalan &amp; Battle</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRole('parent');
                        soundManager.playClick();
                      }}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-colors flex flex-col items-center justify-center text-center gap-1.5 ${
                        role === 'parent'
                          ? 'bg-sage-100 border-sage-400 text-ink-900'
                          : 'bg-cream-50 border-sand-200 text-ink-500 hover:border-sand-300'
                      }`}
                    >
                      <Heart className={`w-6 h-6 ${role === 'parent' ? 'text-sage-600' : 'text-ink-300'}`} />
                      <div>
                        <div className="text-xs font-bold">Ibu Bapa</div>
                        <div className="text-[10px] opacity-75">Pantau Anak</div>
                      </div>
                    </button>
                  </div>
                </div>

                {role === 'student' && (
                  <div className="space-y-3 p-3.5 bg-mist-50 border border-mist-200 rounded-2xl">
                    <label className="block text-xs font-bold text-ink-700 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-mist-500" />
                      <span>Peringkat Persekolahan (Pilihan)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSchoolLevel('rendah');
                          setSchoolForm('');
                          soundManager.playClick();
                        }}
                        className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-colors ${
                          schoolLevel === 'rendah'
                            ? 'bg-mist-100 border-mist-400 text-ink-900'
                            : 'bg-cream-50 border-sand-200 text-ink-500 hover:border-sand-300'
                        }`}
                      >
                        Sekolah Rendah
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSchoolLevel('menengah');
                          setSchoolYear('');
                          soundManager.playClick();
                        }}
                        className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-colors ${
                          schoolLevel === 'menengah'
                            ? 'bg-mist-100 border-mist-400 text-ink-900'
                            : 'bg-cream-50 border-sand-200 text-ink-500 hover:border-sand-300'
                        }`}
                      >
                        Sekolah Menengah
                      </button>
                    </div>

                    {schoolLevel === 'rendah' && (
                      <div>
                        <label className="block text-[11px] font-bold text-ink-500 mb-1.5">Tahun</label>
                        <div className="grid grid-cols-6 gap-1.5">
                          {[1, 2, 3, 4, 5, 6].map((y) => (
                            <button
                              key={y}
                              type="button"
                              onClick={() => {
                                setSchoolYear(y);
                                soundManager.playClick();
                              }}
                              className={`py-2 rounded-lg border text-xs font-bold transition-colors ${
                                schoolYear === y
                                  ? 'bg-mist-500 border-mist-500 text-white'
                                  : 'bg-cream-50 border-sand-200 text-ink-500 hover:border-sand-300'
                              }`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {schoolLevel === 'menengah' && (
                      <div>
                        <label className="block text-[11px] font-bold text-ink-500 mb-1.5">Tingkatan</label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => {
                                setSchoolForm(f);
                                soundManager.playClick();
                              }}
                              className={`py-2 rounded-lg border text-xs font-bold transition-colors ${
                                schoolForm === f
                                  ? 'bg-mist-500 border-mist-500 text-white'
                                  : 'bg-cream-50 border-sand-200 text-ink-500 hover:border-sand-300'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {loading ? 'Mencipta Akaun...' : 'Daftar Akaun Sekarang'}
                </button>
              </form>
            ) : mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">ID Username / Login ID</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={loginIdInput}
                      onChange={(e) => setLoginIdInput(e.target.value.toUpperCase())}
                      placeholder="Contoh: AHMAD123"
                      className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm font-mono tracking-wider uppercase rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1.5">Kata Laluan / PIN</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-cream-50 border border-sand-300 focus:border-mist-400 text-ink-900 text-sm font-mono tracking-widest rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="text-right -mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setMode('forgot');
                      setErrorMsg('');
                    }}
                    className="text-xs font-semibold text-mist-600 hover:text-mist-700"
                  >
                    Lupa Kata Laluan?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {loading ? 'Memproses...' : 'Log Masuk Akaun'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setMode('login');
                    setForgotSent(false);
                  }}
                  className="text-xs font-semibold text-ink-500 hover:text-ink-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Log Masuk</span>
                </button>

                {forgotStep === 'success' ? (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-14 h-14 bg-sage-100 border-2 border-sage-300 text-sage-600 rounded-2xl flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-bold text-ink-900">Kata Laluan Berjaya Ditukar!</h3>
                      <p className="text-xs text-ink-500 mt-1 max-w-xs mx-auto">
                        {forgotResult.hasParentEmail
                          ? forgotResult.emailSent
                            ? 'Emel makluman telah dihantar kepada ibu bapa (tanpa memaparkan kata laluan).'
                            : 'Kata laluan berjaya ditukar, tapi emel makluman kepada ibu bapa gagal dihantar. Boleh maklumkan secara lisan.'
                          : 'Kata laluan berjaya ditukar. Emel ibu bapa belum didaftarkan untuk akaun ini, jadi tiada makluman dihantar.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLoginIdInput(forgotLoginId.trim().toUpperCase());
                        setForgotStep('form');
                        setForgotLoginId('');
                        setForgotPhone('');
                        setForgotNewPassword('');
                        setForgotConfirmPassword('');
                      }}
                      className="w-full py-3 px-4 bg-mist-500 hover:bg-mist-600 text-white font-bold rounded-xl text-sm"
                    >
                      Log Masuk Sekarang
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-honey-100 border border-honey-200 flex items-center justify-center mx-auto text-honey-500">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-display font-bold text-ink-900">Lupa Kata Laluan?</h3>
                      <p className="text-xs text-ink-500 max-w-xs mx-auto">
                        Sahkan dengan nombor telefon ibu bapa yang didaftarkan pada akaun ini, kemudian tetapkan kata laluan baru terus.
                      </p>
                    </div>

                    <form onSubmit={handleForgotResetSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1.5">ID Username / Login ID</label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            value={forgotLoginId}
                            onChange={(e) => setForgotLoginId(e.target.value.toUpperCase())}
                            placeholder="Contoh: AHMAD123"
                            className="w-full bg-cream-50 border border-sand-300 focus:border-honey-400 text-ink-900 text-sm font-mono uppercase rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1.5">No. Telefon Ibu Bapa (Pengesahan)</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                          <input
                            type="tel"
                            value={forgotPhone}
                            onChange={(e) => setForgotPhone(e.target.value)}
                            placeholder="Nombor yang didaftarkan pada akaun"
                            className="w-full bg-cream-50 border border-sand-300 focus:border-honey-400 text-ink-900 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1.5">Kata Laluan Baru</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                          <input
                            type="password"
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            placeholder="Sekurang-kurangnya 6 aksara"
                            className="w-full bg-cream-50 border border-sand-300 focus:border-honey-400 text-ink-900 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1.5">Sahkan Kata Laluan Baru</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-ink-300 absolute left-3.5 top-3.5" />
                          <input
                            type="password"
                            value={forgotConfirmPassword}
                            onChange={(e) => setForgotConfirmPassword(e.target.value)}
                            placeholder="Taip semula kata laluan baru"
                            className="w-full bg-cream-50 border border-sand-300 focus:border-honey-400 text-ink-900 text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {forgotError && (
                        <div className="flex items-start gap-2 p-3 bg-clay-100 border border-clay-200 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-clay-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-clay-600">{forgotError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full py-3.5 px-4 bg-honey-400 hover:bg-honey-500 text-white font-bold rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {forgotLoading ? (
                          <span>Mengesahkan...</span>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Tukar Kata Laluan</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-sand-200 text-center">
              <p className="text-xs text-ink-500 mb-2">Ingin cuba dulu tanpa mendaftar?</p>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2.5 px-3 bg-cream-100 hover:bg-cream-200 border border-sand-200 text-ink-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-honey-500" />
                <span>Guna Akaun Contoh (Demo Pelajar)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
