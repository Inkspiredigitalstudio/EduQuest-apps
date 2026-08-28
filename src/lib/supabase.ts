import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, UserProgress, UserAttempt, Subject, Paper, Section, Question, Choice, StudentLink, FriendRequest, BattleRoom, Achievement } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Human-readable reason the connection isn't live — shown in Admin Dashboard
// so this can be diagnosed without opening browser DevTools.
export let supabaseDiagnostic = '';

export const isSupabaseConfigured = (() => {
  if (!supabaseUrl) { supabaseDiagnostic = 'VITE_SUPABASE_URL kosong/tidak dikesan.'; return false; }
  if (!supabaseAnonKey) { supabaseDiagnostic = 'VITE_SUPABASE_ANON_KEY kosong/tidak dikesan.'; return false; }
  if ((supabaseUrl.startsWith('"') && supabaseUrl.endsWith('"')) || (supabaseUrl.startsWith("'") && supabaseUrl.endsWith("'"))) {
    supabaseDiagnostic = 'VITE_SUPABASE_URL ada tanda petik (") terselit — buang tanda petik tu dalam Vercel env var.';
    return false;
  }
  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== 'https:') {
      supabaseDiagnostic = 'VITE_SUPABASE_URL bukan https:// — semak semula format URL.';
      return false;
    }
    if (supabaseUrl.includes('placeholder') || supabaseUrl.includes('YOUR_SUPABASE')) {
      supabaseDiagnostic = 'VITE_SUPABASE_URL masih guna nilai placeholder, bukan URL projek sebenar.';
      return false;
    }
    if (!supabaseAnonKey.startsWith('eyJ')) {
      supabaseDiagnostic = 'VITE_SUPABASE_ANON_KEY tidak nampak seperti kunci JWT sah (patut bermula dengan "eyJ").';
      return false;
    }
    return true;
  } catch {
    supabaseDiagnostic = `VITE_SUPABASE_URL bukan URL yang sah: "${supabaseUrl.slice(0, 40)}..."`;
    return false;
  }
})();

export const supabase: SupabaseClient | null = (() => {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    supabaseDiagnostic = `createClient() gagal: ${e instanceof Error ? e.message : String(e)}`;
    console.warn('Supabase client failed to initialize, falling back to local mode:', e);
    return null;
  }
})();

// Live test — confirms the connection actually works (not just correctly
// formatted). Call this from the Admin Dashboard to self-diagnose without
// needing browser DevTools.
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, message: supabaseDiagnostic || 'Supabase tidak dikonfigurasi.' };
  }
  try {
    const { error } = await supabase.from('subjects').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Sambungan gagal: ${error.message}` };
    }
    return { ok: true, message: 'Sambungan Supabase berjaya disahkan.' };
  } catch (e) {
    return { ok: false, message: `Sambungan gagal: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ------------------------- Question bank — real Supabase persistence -------------------------
// Content management now writes straight to Supabase (questions + choices),
// so Admin edits survive refresh/redeploy instead of living only in browser
// memory for the current session.

export async function addQuestionToSupabase(
  sectionId: string,
  questionText: string,
  explanation: string,
  choices: { text: string; correct: boolean }[],
  order: number = 1,
  difficulty?: string,
  imageUrl?: string
): Promise<Question | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: qData, error: qErr } = await supabase
      .from('questions')
      .insert({ section_id: sectionId, question_text: questionText, explanation, order, image_url: imageUrl || null })
      .select()
      .single();
    if (qErr || !qData) throw qErr || new Error('Tiada data dikembalikan.');

    const choiceRows = choices.map((c) => ({ question_id: qData.id, option_text: c.text, is_correct: c.correct }));
    const { data: cData, error: cErr } = await supabase.from('choices').insert(choiceRows).select();
    if (cErr) throw cErr;

    return {
      id: qData.id,
      section_id: sectionId,
      question_text: questionText,
      explanation,
      order: qData.order ?? order,
      choices: (cData || []).map((c: any) => ({ id: c.id, question_id: c.question_id, option_text: c.option_text, is_correct: Boolean(c.is_correct) })),
      difficulty: difficulty as any,
      image_url: qData.image_url || imageUrl || undefined,
    };
  } catch (e) {
    console.warn('Failed to add question to Supabase:', e);
    return null;
  }
}

export async function updateQuestionInSupabase(question: Question): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error: qErr } = await supabase
      .from('questions')
      .update({ section_id: question.section_id, question_text: question.question_text, explanation: question.explanation, order: question.order, image_url: question.image_url || null })
      .eq('id', question.id);
    if (qErr) throw qErr;

    // Simplest reliable approach: replace all choices for this question
    const { error: delErr } = await supabase.from('choices').delete().eq('question_id', question.id);
    if (delErr) throw delErr;

    const choiceRows = question.choices.map((c) => ({ question_id: question.id, option_text: c.option_text, is_correct: c.is_correct }));
    const { error: insErr } = await supabase.from('choices').insert(choiceRows);
    if (insErr) throw insErr;

    return true;
  } catch (e) {
    console.warn('Failed to update question in Supabase:', e);
    return false;
  }
}

export async function deleteQuestionFromSupabase(questionId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    // choices reference question_id without ON DELETE CASCADE in the migrated
    // schema, so clear them explicitly first.
    await supabase.from('choices').delete().eq('question_id', questionId);
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn('Failed to delete question from Supabase:', e);
    return false;
  }
}

export async function bulkAddQuestionsToSupabase(
  items: { section_id: string; question_text: string; explanation: string; difficulty?: string; image_url?: string; choices: { text: string; correct: boolean }[] }[]
): Promise<Question[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const results: Question[] = [];
  for (const item of items) {
    const q = await addQuestionToSupabase(item.section_id, item.question_text, item.explanation, item.choices, 1, item.difficulty, item.image_url);
    if (q) results.push(q);
  }
  return results;
}
// Local fallback storage keys
const LOCAL_USER_KEY = 'sppim_local_active_user';
const LOCAL_USERS_LIST_KEY = 'sppim_local_users_db';
const LOCAL_PROGRESS_KEY = 'sppim_local_progress';
const LOCAL_ATTEMPTS_KEY = 'sppim_local_attempts';
const LOCAL_PKSK_PROGRESS_KEY = 'pksk_local_progress';

// Helper to generate a clean, readable login ID
export function generateUniqueLoginId(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${cleanName || 'PELAJAR'}${randomNum}`;
}

// Helper to generate synthetic email
export function generateSyntheticEmail(loginId: string): string {
  return `${loginId.toLowerCase().trim()}@sppim.com`;
}

// Helper to generate 8-character unique invite code for students
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Level Title Title Helper
export function getLevelTitle(level: number): string {
  if (level >= 8) return 'Ustaz Utama 🎓';
  if (level >= 7) return 'Al-Hakim ⚖️';
  if (level >= 6) return 'Cendekiawan Islam 📖';
  if (level >= 5) return 'Penuntut Ilmu 🕌';
  if (level >= 4) return 'Ahli Fiqh 💡';
  if (level >= 3) return 'Murid Mumtaz ✨';
  if (level >= 2) return 'Pelajar Rajin 🌟';
  return 'Permulaan 🚀';
}

export async function checkLoginIdExists(loginId: string): Promise<boolean> {
  const cleanId = loginId.trim().toUpperCase();
  const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  if (existingUsers.some((u) => u.login_id.toUpperCase() === cleanId)) {
    return true;
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('users').select('id').ilike('login_id', cleanId).maybeSingle();
      return Boolean(data);
    } catch {
      return false;
    }
  }
  return false;
}

export async function updateUserRole(
  user: UserProfile,
  role: 'student' | 'parent' | 'admin'
): Promise<UserProfile> {
  const inviteCode = role === 'student' ? (user.invite_code || generateInviteCode()) : user.invite_code;
  const updatedProfile: UserProfile = {
    ...user,
    role,
    invite_code: inviteCode,
  };

  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedProfile));
  const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  const idx = existingUsers.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    existingUsers[idx] = updatedProfile;
    localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(existingUsers));
  }

  if (isSupabaseConfigured && supabase && user.id) {
    try {
      await supabase.from('users').update({ role, invite_code: inviteCode }).eq('id', user.id);
    } catch (e) {
      console.warn('Update role in Supabase failed:', e);
    }
  }

  return updatedProfile;
}

export async function registerUser(
  displayName: string,
  password: string,
  role: 'student' | 'parent' = 'student',
  phone?: string,
  customUsername?: string,
  schoolInfo?: { level?: 'rendah' | 'menengah'; year?: number; form?: number },
  contactEmail?: string
): Promise<{
  profile: UserProfile;
  loginId: string;
  error?: string;
}> {
  const loginId = customUsername && customUsername.trim()
    ? customUsername.trim().toUpperCase()
    : generateUniqueLoginId(displayName);

  // Check if username already exists
  const isTaken = await checkLoginIdExists(loginId);
  if (isTaken && customUsername && customUsername.trim()) {
    return {
      profile: null as any,
      loginId: '',
      error: `ID Username "${loginId}" telah digunakan. Sila pilih ID Username yang lain.`,
    };
  }

  const email = generateSyntheticEmail(loginId);
  const inviteCode = generateInviteCode();
  const schoolLevel = schoolInfo?.level;
  const schoolYear = schoolLevel === 'rendah' ? schoolInfo?.year : undefined;
  const schoolForm = schoolLevel === 'menengah' ? schoolInfo?.form : undefined;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName,
            login_id: loginId,
            phone: phone || '',
            role,
          },
        },
      });

      if (!error && data?.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          name: displayName,
          login_id: loginId,
          phone: phone || undefined,
          coin: role === 'student' ? 100 : 0,
          xp: 0,
          level: 1,
          created_at: new Date().toISOString(),
          streak_days: 1,
          role,
          invite_code: inviteCode,
          school_level: schoolLevel,
          school_year: schoolYear,
          school_form: schoolForm,
          contact_email: contactEmail || undefined,
        };

        // Ensure user row exists in public.users
        try {
          const dbUserPayload = {
            id: data.user.id,
            name: displayName,
            login_id: loginId,
            phone: phone || null,
            coin: userProfile.coin,
            xp: 0,
            level: 1,
            role,
            invite_code: inviteCode,
            created_at: userProfile.created_at,
            school_level: schoolLevel || null,
            school_year: schoolYear ?? null,
            school_form: schoolForm ?? null,
            contact_email: contactEmail || null,
          };
          const { error: upsertErr } = await supabase.from('users').upsert([dbUserPayload]);
          if (upsertErr) {
            console.warn('Supabase users table upsert warning:', upsertErr.message);
          }
        } catch (dbErr) {
          console.warn('Could not sync user profile to Supabase users table:', dbErr);
        }

        // Save active local session and user list
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));
        const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
        existingUsers.push(userProfile);
        localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(existingUsers));

        return { profile: userProfile, loginId };
      } else if (error) {
        console.warn('Supabase auth signUp error, falling back to local mode:', error.message);
      }
    } catch (err: unknown) {
      console.warn('Supabase auth failed, using local mode:', err);
    }
  }

  // Local Offline Storage Fallback
  const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  const localProfile: UserProfile = {
    id: `user-local-${Date.now()}`,
    name: displayName,
    login_id: loginId,
    phone,
    coin: role === 'student' ? 100 : 0,
    xp: 0,
    level: 1,
    created_at: new Date().toISOString(),
    streak_days: 1,
    role,
    invite_code: inviteCode,
    password,
    school_level: schoolLevel,
    school_year: schoolYear,
    school_form: schoolForm,
    contact_email: contactEmail || undefined,
  };

  existingUsers.push(localProfile);
  localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(existingUsers));
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localProfile));

  return { profile: localProfile, loginId };
}

// Backward compatible wrapper
export async function registerStudent(name: string, pin: string, phone?: string) {
  return registerUser(name, pin, 'student', phone);
}

// Self-service "Lupa Kata Laluan" — calls the reset-password Edge Function,
// which verifies the parent phone server-side (with the service-role key)
// and updates the real Supabase Auth password. Never resolves the actual
// new password back to the caller; only success/failure + whether the
// parent-notification email could be sent.
export async function requestPasswordReset(
  loginId: string,
  parentPhone: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; emailSent?: boolean; hasParentEmail?: boolean }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Ciri ini memerlukan sambungan Supabase.' };
  }
  try {
    const { data, error } = await supabase.functions.invoke('reset-password', {
      body: { loginId, parentPhone, newPassword },
    });
    if (error) {
      console.warn('requestPasswordReset invoke error:', error);
      return { success: false, error: 'Gagal berhubung dengan pelayan. Sila cuba lagi.' };
    }
    if (!data?.success) {
      return { success: false, error: data?.error || 'Gagal tukar kata laluan. Sila cuba lagi.' };
    }
    return { success: true, emailSent: data.emailSent, hasParentEmail: data.hasParentEmail };
  } catch (e) {
    console.warn('requestPasswordReset threw:', e);
    return { success: false, error: 'Gagal berhubung dengan pelayan. Sila cuba lagi.' };
  }
}


export async function loginUser(loginIdInput: string, passwordInput: string): Promise<{
  profile: UserProfile | null;
  error?: string;
}> {
  const cleanLoginId = loginIdInput.trim().toUpperCase();
  const email = generateSyntheticEmail(cleanLoginId);

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Search user in public.users table
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .ilike('login_id', cleanLoginId)
        .maybeSingle();

      // 2. Try authenticating with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });

      if (authData?.user || dbUser) {
        const userProfile: UserProfile = {
          id: dbUser?.id || authData?.user?.id || `user-local-${Date.now()}`,
          name: dbUser?.name || authData?.user?.user_metadata?.name || 'Pengguna',
          login_id: dbUser?.login_id || cleanLoginId,
          phone: dbUser?.phone || authData?.user?.user_metadata?.phone,
          coin: dbUser?.coin ?? 100,
          xp: dbUser?.xp ?? 0,
          level: dbUser?.level ?? 1,
          created_at: dbUser?.created_at || new Date().toISOString(),
          streak_days: 1,
          role: dbUser?.role || authData?.user?.user_metadata?.role || 'student',
          invite_code: dbUser?.invite_code || generateInviteCode(),
          school_level: dbUser?.school_level || undefined,
          school_year: dbUser?.school_year ?? undefined,
          school_form: dbUser?.school_form ?? undefined,
          contact_email: dbUser?.contact_email || undefined,
        };

        // Sync to public.users if not present
        if (!dbUser && authData?.user) {
          try {
            await supabase.from('users').upsert([{
              id: authData.user.id,
              name: userProfile.name,
              login_id: cleanLoginId,
              phone: userProfile.phone || null,
              coin: userProfile.coin,
              xp: userProfile.xp,
              level: userProfile.level,
              role: userProfile.role,
              invite_code: userProfile.invite_code,
              created_at: userProfile.created_at,
            }]);
          } catch (e) {
            console.warn('Could not sync user to users table:', e);
          }
        }

        // Save active local session and cache in user list
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));
        const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
        if (!existingUsers.some((u) => u.login_id.toUpperCase() === cleanLoginId)) {
          existingUsers.push(userProfile);
          localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(existingUsers));
        }

        return { profile: userProfile };
      }

      if (authError && !dbUser) {
        return { profile: null, error: 'ID Username atau Kata Laluan/PIN tidak sah. Sila semak semula.' };
      }
    } catch (err) {
      console.warn('Supabase login failed, trying local mode:', err);
    }
  }

  // Local Storage Fallback Login
  const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  const found = existingUsers.find((u) => u.login_id.toUpperCase() === cleanLoginId);

  if (found) {
    // Backward compatible: accounts created before password-tracking existed have no
    // stored password, so they log in on ID alone (unchanged prior behaviour).
    // Accounts with a stored password (new registrations, or reset by an admin) must match it.
    if (found.password && found.password !== passwordInput) {
      return { profile: null, error: 'ID Username atau Kata Laluan/PIN tidak sah. Sila semak semula.' };
    }
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(found));
    return { profile: found };
  }

  // If testing demo ID
  if (cleanLoginId === 'DEMO123' || cleanLoginId === 'AHMAD123') {
    const demoProfile: UserProfile = {
      id: 'demo-student-id',
      name: 'Ahmad Zaki (Demo)',
      login_id: 'DEMO123',
      coin: 250,
      xp: 180,
      level: 2,
      created_at: new Date().toISOString(),
      streak_days: 3,
      role: 'student',
      invite_code: 'SPQ-DEMO123',
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoProfile));
    return { profile: demoProfile };
  }

  return { profile: null, error: 'ID Username tidak dijumpai. Sila semak ID anda atau Daftar Akaun Baru.' };
}

// Backward compatible wrapper
export async function loginStudent(loginIdInput: string, pin: string) {
  return loginUser(loginIdInput, pin);
}

// ------------------------- Admin: participant management -------------------------
// Local-storage first (matches this app's existing user-storage model). If Supabase
// is configured, also pulls its `users` table and merges by login_id so an admin
// sees everyone regardless of which path each account was created through.
export async function getAllRegisteredUsers(): Promise<UserProfile[]> {
  const localUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        const merged = new Map<string, UserProfile>();
        localUsers.forEach((u) => merged.set(u.login_id.toUpperCase(), u));
        data.forEach((row: any) => {
          merged.set(row.login_id.toUpperCase(), {
            id: row.id,
            name: row.name,
            login_id: row.login_id,
            phone: row.phone || undefined,
            coin: row.coin ?? 0,
            xp: row.xp ?? 0,
            level: row.level ?? 1,
            created_at: row.created_at,
            role: row.role,
            invite_code: row.invite_code,
            contact_email: row.contact_email || undefined,
          });
        });
        return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (e) {
      console.warn('Could not fetch users from Supabase, showing local list only:', e);
    }
  }

  return [...localUsers].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------- LEADERBOARD ----------------
// Deliberately Supabase-only — no merge with local-storage users. The ranking
// must reflect real, current accounts; a local-only entry (e.g. a stale test
// account from a device that hasn't synced) would show a wrong coin count and
// throw the ordering off, which is exactly the bug this was pulled out to fix.
export interface LeaderboardEntry {
  id: string;
  name: string;
  login_id: string;
  coin: number;
  xp: number;
  level: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, login_id, coin, xp, level, role');

    if (error || !data) {
      console.warn('Supabase leaderboard fetch failed:', error);
      return [];
    }

    return data
      .filter((row: any) => row.role !== 'admin')
      .map((row: any) => ({
        id: row.id,
        name: row.name,
        login_id: row.login_id,
        coin: row.coin ?? 0,
        xp: row.xp ?? 0,
        level: row.level ?? 1,
      }))
      // Ranked by XP (matches the "XP" figure shown next to each entry in the
      // UI, and matches Tahap/level which is derived from xp too).
      .sort((a, b) => b.xp - a.xp);
  } catch (e) {
    console.warn('Supabase leaderboard fetch threw:', e);
    return [];
  }
}

// Resets a user's password. Local-storage accounts: generates a new simple PIN,
// stores it directly (this app's local-mode security model is intentionally
// lightweight — see chat notes). Supabase-auth accounts can't safely have their
// password changed from client-side code (would need a service_role key, which
// must never ship in frontend code) — those should be reset from the Supabase
// dashboard directly; this function only touches the local copy in that case.
export function resetUserPassword(userId: string): string {
  const newPassword = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit PIN

  const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  const updated = existingUsers.map((u) => (u.id === userId ? { ...u, password: newPassword } : u));
  localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(updated));

  // If this happens to be the currently active session, keep it in sync too
  const active = getCurrentUser();
  if (active && active.id === userId) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ ...active, password: newPassword }));
  }

  return newPassword;
}

export function getCurrentUser(): UserProfile | null {
  const raw = localStorage.getItem(LOCAL_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Lets a user set/change their own phone number after registration (Profile),
// or an admin set it on someone else's behalf (Admin Dashboard participant
// list) — same underlying write either way, just called with a different id.
export async function updateUserPhone(userId: string, phone: string): Promise<{ success: boolean; error?: string }> {
  const cleanPhone = phone.trim();

  const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  const idx = existingUsers.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    existingUsers[idx] = { ...existingUsers[idx], phone: cleanPhone || undefined };
    localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(existingUsers));
  }

  const active = getCurrentUser();
  if (active && active.id === userId) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ ...active, phone: cleanPhone || undefined }));
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('users').update({ phone: cleanPhone || null }).eq('id', userId);
      if (error) {
        console.warn('Update phone in Supabase failed:', error);
        return { success: false, error: 'Gagal simpan ke pangkalan data. Sila cuba lagi.' };
      }
    } catch (e) {
      console.warn('Update phone in Supabase threw:', e);
      return { success: false, error: 'Gagal simpan ke pangkalan data. Sila cuba lagi.' };
    }
  }

  return { success: true };
}

// Admin-side edit: name/phone/email together in one write, since the Admin
// participant panel edits all three from one form.
export async function updateUserProfileFields(
  userId: string,
  fields: { name?: string; phone?: string; contact_email?: string }
): Promise<{ success: boolean; error?: string }> {
  const patch: Record<string, string | undefined> = {};
  if (fields.name !== undefined) patch.name = fields.name.trim();
  if (fields.phone !== undefined) patch.phone = fields.phone.trim() || undefined;
  if (fields.contact_email !== undefined) patch.contact_email = fields.contact_email.trim() || undefined;

  const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  const idx = existingUsers.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    existingUsers[idx] = { ...existingUsers[idx], ...patch };
    localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(existingUsers));
  }

  const active = getCurrentUser();
  if (active && active.id === userId) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ ...active, ...patch }));
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const dbPatch: Record<string, string | null> = {};
      if (fields.name !== undefined) dbPatch.name = patch.name || '';
      if (fields.phone !== undefined) dbPatch.phone = patch.phone || null;
      if (fields.contact_email !== undefined) dbPatch.contact_email = patch.contact_email || null;

      const { error } = await supabase.from('users').update(dbPatch).eq('id', userId);
      if (error) {
        console.warn('Update profile fields in Supabase failed:', error);
        return { success: false, error: 'Gagal simpan ke pangkalan data. Sila cuba lagi.' };
      }
    } catch (e) {
      console.warn('Update profile fields in Supabase threw:', e);
      return { success: false, error: 'Gagal simpan ke pangkalan data. Sila cuba lagi.' };
    }
  }

  return { success: true };
}

// Removes a participant's profile row so they can no longer log in or appear
// in lists. This only removes the public.users row (and their progress /
// attempts) — the underlying Supabase Auth account isn't removed, since that
// needs a service-role backend call this client-side app doesn't have. In
// practice the account still becomes unusable: loginUser() looks up by
// login_id against public.users, so once that row is gone, login fails.
export async function deleteUserAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  const existingUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  localStorage.setItem(LOCAL_USERS_LIST_KEY, JSON.stringify(existingUsers.filter((u) => u.id !== userId)));

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('progress').delete().eq('user_id', userId);
      await supabase.from('attempts').delete().eq('user_id', userId);
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) {
        console.warn('Delete user in Supabase failed:', error);
        return { success: false, error: 'Gagal padam dari pangkalan data. Sila cuba lagi.' };
      }
    } catch (e) {
      console.warn('Delete user in Supabase threw:', e);
      return { success: false, error: 'Gagal padam dari pangkalan data. Sila cuba lagi.' };
    }
  }

  return { success: true };
}

export async function checkAndRestoreSession(): Promise<UserProfile | null> {
  const local = getCurrentUser();
  if (local) return local;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (dbUser) {
          const profile: UserProfile = {
            id: dbUser.id,
            name: dbUser.name,
            login_id: dbUser.login_id,
            phone: dbUser.phone,
            coin: dbUser.coin ?? 100,
            xp: dbUser.xp ?? 0,
            level: dbUser.level ?? 1,
            created_at: dbUser.created_at || new Date().toISOString(),
            streak_days: 1,
            role: dbUser.role || 'student',
            invite_code: dbUser.invite_code,
            school_level: dbUser.school_level || undefined,
            school_year: dbUser.school_year ?? undefined,
            school_form: dbUser.school_form ?? undefined,
            contact_email: dbUser.contact_email || undefined,
          };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
          return profile;
        }
      }
    } catch (e) {
      console.warn('Restore session check failed:', e);
    }
  }
  return null;
}

export async function updateUserStats(user: UserProfile, coinAdd: number, xpAdd: number): Promise<UserProfile> {
  let newXp = user.xp + xpAdd;
  let newLevel = user.level;
  
  // Level up calculation: +100 XP per level
  while (newXp >= newLevel * 100) {
    newLevel += 1;
  }

  const updated: UserProfile = {
    ...user,
    coin: user.coin + coinAdd,
    xp: newXp,
    level: newLevel,
  };

  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured && supabase && user.id) {
    (async () => {
      try {
        await supabase
          .from('users')
          .update({
            coin: updated.coin,
            xp: updated.xp,
            level: updated.level,
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Failed sync stats to Supabase:', err);
      }
    })();
  }

  return updated;
}

export async function saveAttempt(attempt: Omit<UserAttempt, 'id'>) {
  const newAttempt: UserAttempt = {
    ...attempt,
    id: `attempt-${Date.now()}`,
  };

  // Local storage save
  const existingAttempts: UserAttempt[] = JSON.parse(localStorage.getItem(LOCAL_ATTEMPTS_KEY) || '[]');
  existingAttempts.push(newAttempt);
  localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(existingAttempts));

  // Update Section Progress
  const existingProgress: UserProgress[] = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || '[]');
  const progIdx = existingProgress.findIndex((p) => p.section_id === attempt.section_id && p.user_id === attempt.user_id);

  if (progIdx >= 0) {
    existingProgress[progIdx].best_score = Math.max(existingProgress[progIdx].best_score, attempt.score);
    existingProgress[progIdx].is_completed = true;
  } else {
    existingProgress.push({
      id: `prog-${Date.now()}`,
      user_id: attempt.user_id,
      section_id: attempt.section_id,
      best_score: attempt.score,
      is_completed: true,
      total_questions: attempt.total_question,
    });
  }
  localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(existingProgress));

  // Remote Supabase sync in background without blocking UI
  if (isSupabaseConfigured && supabase) {
    (async () => {
      try {
        await Promise.all([
          supabase.from('attempts').insert([newAttempt]),
          supabase.from('progress').upsert([
            {
              user_id: attempt.user_id,
              section_id: attempt.section_id,
              best_score: attempt.score,
              is_completed: true,
              total_questions: attempt.total_question,
            },
          ]),
        ]);
      } catch (err) {
        console.warn('Sync attempt to Supabase failed:', err);
      }
    })();
  }

  return newAttempt;
}

export function getUserProgressList(userId: string): UserProgress[] {
  const existingProgress: UserProgress[] = JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || '[]');
  return existingProgress.filter((p) => p.user_id === userId);
}

export function getUserAttemptsList(userId: string): UserAttempt[] {
  const existingAttempts: UserAttempt[] = JSON.parse(localStorage.getItem(LOCAL_ATTEMPTS_KEY) || '[]');
  return existingAttempts.filter((a) => a.user_id === userId);
}

export async function fetchParentChildrenData(phoneInput: string): Promise<{
  children: UserProfile[];
  attemptsMap: Record<string, UserAttempt[]>;
  progressMap: Record<string, UserProgress[]>;
}> {
  const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
  if (!cleanPhone) {
    return { children: [], attemptsMap: {}, progressMap: {} };
  }

  const matchedChildrenMap = new Map<string, UserProfile>();
  const attemptsMap: Record<string, UserAttempt[]> = {};
  const progressMap: Record<string, UserProgress[]> = {};

  // 1. Check local users list first (same-device, works even if the Edge
  // Function call below fails for any reason).
  const localUsersList: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  const currentActiveUser = getCurrentUser();
  const allLocal = [...localUsersList];
  if (currentActiveUser && !allLocal.some((u) => u.id === currentActiveUser.id)) {
    allLocal.push(currentActiveUser);
  }

  for (const u of allLocal) {
    if (u.phone && u.role !== 'parent' && u.role !== 'admin') {
      const uPhoneClean = u.phone.replace(/[^0-9]/g, '');
      if (uPhoneClean && (uPhoneClean.includes(cleanPhone) || cleanPhone.includes(uPhoneClean))) {
        matchedChildrenMap.set(u.id, u);
        progressMap[u.id] = getUserProgressList(u.id);
        attemptsMap[u.id] = getUserAttemptsList(u.id);
      }
    }
  }

  // 2. Ask the fetch-parent-data Edge Function — it runs with the service
  // role, so it works regardless of whether this browser has a live Supabase
  // Auth session, and it bypasses RLS deliberately (progress/attempts stay
  // RLS-protected for any other, non-Edge-Function access path).
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-parent-data', {
        body: { phone: phoneInput },
      });

      if (!error && data?.success) {
        for (const dbU of data.children || []) {
          const childProfile: UserProfile = {
            id: dbU.id,
            name: dbU.name,
            login_id: dbU.login_id,
            phone: dbU.phone,
            coin: dbU.coin ?? 100,
            xp: dbU.xp ?? 0,
            level: dbU.level ?? 1,
            created_at: dbU.created_at || new Date().toISOString(),
            streak_days: 1,
          };
          matchedChildrenMap.set(childProfile.id, childProfile);

          const remoteProg: UserProgress[] = data.progressMap?.[dbU.id] || [];
          const localProg = progressMap[dbU.id] || [];
          const mergedProg = [...localProg];
          for (const rp of remoteProg) {
            if (!mergedProg.some((lp) => lp.section_id === rp.section_id)) {
              mergedProg.push(rp);
            }
          }
          progressMap[dbU.id] = mergedProg;

          const remoteAtt: UserAttempt[] = data.attemptsMap?.[dbU.id] || [];
          const localAtt = attemptsMap[dbU.id] || [];
          const mergedAtt = [...localAtt];
          for (const ra of remoteAtt) {
            if (!mergedAtt.some((la) => la.id === ra.id)) {
              mergedAtt.push(ra);
            }
          }
          attemptsMap[dbU.id] = mergedAtt;
        }
      } else if (error) {
        console.warn('fetch-parent-data invoke failed:', error);
      }
    } catch (err) {
      console.warn('Supabase fetch parent children failed:', err);
    }
  }

  const children = Array.from(matchedChildrenMap.values());
  return { children, attemptsMap, progressMap };
}

export function logoutStudent() {
  localStorage.removeItem(LOCAL_USER_KEY);
  if (isSupabaseConfigured && supabase) {
    supabase.auth.signOut();
  }
}

export async function fetchExamDataFromSupabase(): Promise<{
  subjects?: Subject[];
  papers?: Paper[];
  sections?: Section[];
  questions?: Question[];
} | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  // Supabase/PostgREST silently caps any unlimited select() at 1000 rows.
  // `questions` and especially `choices` (~4 rows per question) can exceed
  // that as content grows — the query still "succeeds" with no error, it
  // just quietly returns only the first 1000 rows, so some questions end up
  // with zero choices in the app even though the data is correct in the DB.
  // Page through in batches of 1000 so every row always comes back.
  async function fetchAll<T>(table: string, orderCol?: string): Promise<T[]> {
    const pageSize = 1000;
    let from = 0;
    let all: T[] = [];
    while (true) {
      let query = supabase!.from(table).select('*').range(from, from + pageSize - 1);
      if (orderCol) query = query.order(orderCol, { ascending: true });
      const { data, error } = await query;
      if (error) {
        console.warn(`Supabase fetch ${table} warning:`, error.message);
        break;
      }
      if (!data || data.length === 0) break;
      all = all.concat(data as T[]);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return all;
  }

  try {
    const [dbSubjects, dbPapers, dbSections, dbQuestions, dbChoices] = await Promise.all([
      fetchAll<any>('subjects'),
      fetchAll<any>('papers'),
      fetchAll<any>('sections', 'order'),
      fetchAll<any>('questions', 'order'),
      fetchAll<any>('choices'),
    ]);

    let resSubjects: Subject[] | undefined;
    if (dbSubjects && dbSubjects.length > 0) {
      resSubjects = dbSubjects.map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon || 'BookOpen',
        description: s.description || '',
        status: s.status || 'active',
        color: s.color || 'from-mist-400 to-mist-500',
      }));
    }

    let resPapers: Paper[] | undefined;
    if (dbPapers && dbPapers.length > 0) {
      resPapers = dbPapers.map((p) => ({
        id: p.id,
        subject_id: p.subject_id,
        year: p.year,
        title: p.title,
        status: p.status || 'active',
      }));
    }

    let resSections: Section[] | undefined;
    if (dbSections && dbSections.length > 0) {
      resSections = dbSections.map((sec) => ({
        id: sec.id,
        paper_id: sec.paper_id,
        name: sec.name,
        title: sec.title || `Bahagian ${sec.name}`,
        order: sec.order ?? 1,
      }));
    }

    let resQuestions: Question[] | undefined;
    if (dbQuestions && dbQuestions.length > 0) {
      const choicesMap = new Map<string, Choice[]>();
      if (dbChoices) {
        for (const c of dbChoices) {
          const list = choicesMap.get(c.question_id) || [];
          list.push({
            id: c.id,
            question_id: c.question_id,
            option_text: c.option_text,
            is_correct: Boolean(c.is_correct),
          });
          choicesMap.set(c.question_id, list);
        }
      }

      resQuestions = dbQuestions.map((q) => ({
        id: q.id,
        section_id: q.section_id,
        question_text: q.question_text,
        explanation: q.explanation || '',
        order: q.order ?? 1,
        choices: choicesMap.get(q.id) || [],
        difficulty: q.difficulty || undefined,
        image_url: q.image_url || undefined,
      }));
    }

    return {
      subjects: resSubjects,
      papers: resPapers,
      sections: resSections,
      questions: resQuestions,
    };
  } catch (err) {
    console.warn('Failed to fetch exam data from Supabase:', err);
    return null;
  }
}

// =====================================================================
// PKSK DATA LAYER — separate tables (pksk_subjects/pksk_papers/
// pksk_sections/pksk_questions/pksk_choices), separate from SPPIM above.
// Do NOT reuse fetchExamDataFromSupabase/addQuestionToSupabase/etc. for
// PKSK content — those target the SPPIM tables only.
// =====================================================================

export async function fetchPkskExamDataFromSupabase(): Promise<{
  subjects?: Subject[];
  papers?: Paper[];
  sections?: Section[];
  questions?: Question[];
} | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  async function fetchAll<T>(table: string, orderCol?: string): Promise<T[]> {
    const pageSize = 1000;
    let from = 0;
    let all: T[] = [];
    while (true) {
      let query = supabase!.from(table).select('*').range(from, from + pageSize - 1);
      if (orderCol) query = query.order(orderCol, { ascending: true });
      const { data, error } = await query;
      if (error) {
        console.warn(`Supabase fetch ${table} warning:`, error.message);
        break;
      }
      if (!data || data.length === 0) break;
      all = all.concat(data as T[]);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return all;
  }

  try {
    const [dbSubjects, dbPapers, dbSections, dbQuestions, dbChoices] = await Promise.all([
      fetchAll<any>('pksk_subjects'),
      fetchAll<any>('pksk_papers'),
      fetchAll<any>('pksk_sections', 'order'),
      fetchAll<any>('pksk_questions', 'order'),
      fetchAll<any>('pksk_choices'),
    ]);

    let resSubjects: Subject[] | undefined;
    if (dbSubjects && dbSubjects.length > 0) {
      resSubjects = dbSubjects.map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon || 'BookOpen',
        description: s.description || '',
        status: s.status || 'active',
        color: s.color || 'from-mist-400 to-mist-500',
        bahagian: s.bahagian || undefined,
      }));
    }

    let resPapers: Paper[] | undefined;
    if (dbPapers && dbPapers.length > 0) {
      resPapers = dbPapers.map((p) => ({
        id: p.id,
        subject_id: p.subject_id,
        year: p.year,
        title: p.title,
        status: p.status || 'active',
        tingkatan: p.tingkatan || undefined,
      }));
    }

    let resSections: Section[] | undefined;
    if (dbSections && dbSections.length > 0) {
      resSections = dbSections.map((sec) => ({
        id: sec.id,
        paper_id: sec.paper_id,
        name: sec.name,
        title: sec.title || `Bahagian ${sec.name}`,
        order: sec.order ?? 1,
      }));
    }

    // IMPORTANT: unlike the SPPIM mapping above, PKSK questions/choices carry
    // extra fields (answer_format, dimensi_personaliti, aras_kesukaran,
    // nilai_skala) that must be explicitly selected here — omitting them from
    // this mapping silently drops the data even though select('*') fetched it.
    let resQuestions: Question[] | undefined;
    if (dbQuestions && dbQuestions.length > 0) {
      const choicesMap = new Map<string, Choice[]>();
      if (dbChoices) {
        for (const c of dbChoices) {
          const list = choicesMap.get(c.question_id) || [];
          list.push({
            id: c.id,
            question_id: c.question_id,
            option_text: c.option_text,
            is_correct: Boolean(c.is_correct),
            nilai_skala: c.nilai_skala ?? undefined,
          });
          choicesMap.set(c.question_id, list);
        }
      }

      resQuestions = dbQuestions.map((q) => ({
        id: q.id,
        section_id: q.section_id,
        question_text: q.question_text,
        explanation: q.explanation || '',
        order: q.order ?? 1,
        choices: choicesMap.get(q.id) || [],
        image_url: q.image_url || undefined,
        answer_format: (q.answer_format || 'mcq') as Question['answer_format'],
        dimensi_personaliti: q.dimensi_personaliti || undefined,
        aras_kesukaran: q.aras_kesukaran ?? undefined,
        source_set: q.source_set || undefined,
      }));
    }

    return {
      subjects: resSubjects,
      papers: resPapers,
      sections: resSections,
      questions: resQuestions,
    };
  } catch (err) {
    console.warn('Failed to fetch PKSK exam data from Supabase:', err);
    return null;
  }
}

export async function addPkskQuestionToSupabase(
  sectionId: string,
  questionText: string,
  explanation: string,
  choices: { text: string; correct: boolean; nilai_skala?: number }[],
  order: number = 1,
  answerFormat: Question['answer_format'] = 'mcq',
  dimensiPersonaliti?: string,
  arasKesukaran?: 1 | 2 | 3,
  imageUrl?: string
): Promise<Question | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: qData, error: qErr } = await supabase
      .from('pksk_questions')
      .insert({
        section_id: sectionId,
        question_text: questionText,
        explanation,
        order,
        image_url: imageUrl || null,
        answer_format: answerFormat || 'mcq',
        dimensi_personaliti: dimensiPersonaliti || null,
        aras_kesukaran: arasKesukaran ?? null,
      })
      .select()
      .single();
    if (qErr || !qData) throw qErr || new Error('Tiada data dikembalikan.');

    const choiceRows = choices.map((c) => ({
      question_id: qData.id,
      option_text: c.text,
      is_correct: c.correct,
      nilai_skala: c.nilai_skala ?? null,
    }));
    const { data: cData, error: cErr } = await supabase.from('pksk_choices').insert(choiceRows).select();
    if (cErr) throw cErr;

    return {
      id: qData.id,
      section_id: sectionId,
      question_text: questionText,
      explanation,
      order: qData.order ?? order,
      choices: (cData || []).map((c: any) => ({
        id: c.id,
        question_id: c.question_id,
        option_text: c.option_text,
        is_correct: Boolean(c.is_correct),
        nilai_skala: c.nilai_skala ?? undefined,
      })),
      image_url: qData.image_url || imageUrl || undefined,
      answer_format: (qData.answer_format || answerFormat) as Question['answer_format'],
      dimensi_personaliti: qData.dimensi_personaliti || dimensiPersonaliti || undefined,
      aras_kesukaran: qData.aras_kesukaran ?? arasKesukaran ?? undefined,
    };
  } catch (e) {
    console.warn('Failed to add PKSK question to Supabase:', e);
    return null;
  }
}

export async function updatePkskQuestionInSupabase(question: Question): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error: qErr } = await supabase
      .from('pksk_questions')
      .update({
        section_id: question.section_id,
        question_text: question.question_text,
        explanation: question.explanation,
        order: question.order,
        image_url: question.image_url || null,
        answer_format: question.answer_format || 'mcq',
        dimensi_personaliti: question.dimensi_personaliti || null,
        aras_kesukaran: question.aras_kesukaran ?? null,
      })
      .eq('id', question.id);
    if (qErr) throw qErr;

    // Simplest reliable approach: replace all choices for this question
    const { error: delErr } = await supabase.from('pksk_choices').delete().eq('question_id', question.id);
    if (delErr) throw delErr;

    const choiceRows = question.choices.map((c) => ({
      question_id: question.id,
      option_text: c.option_text,
      is_correct: c.is_correct,
      nilai_skala: c.nilai_skala ?? null,
    }));
    const { error: insErr } = await supabase.from('pksk_choices').insert(choiceRows);
    if (insErr) throw insErr;

    return true;
  } catch (e) {
    console.warn('Failed to update PKSK question in Supabase:', e);
    return false;
  }
}

export async function deletePkskQuestionFromSupabase(questionId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    // pksk_choices reference question_id without ON DELETE CASCADE, so clear
    // them explicitly first (same pattern as deleteQuestionFromSupabase).
    await supabase.from('pksk_choices').delete().eq('question_id', questionId);
    const { error } = await supabase.from('pksk_questions').delete().eq('id', questionId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn('Failed to delete PKSK question from Supabase:', e);
    return false;
  }
}

export async function bulkAddPkskQuestionsToSupabase(
  items: {
    section_id: string;
    question_text: string;
    explanation: string;
    order?: number;
    answer_format?: Question['answer_format'];
    dimensi_personaliti?: string;
    aras_kesukaran?: 1 | 2 | 3;
    image_url?: string;
    choices: { text: string; correct: boolean; nilai_skala?: number }[];
  }[]
): Promise<{ saved: Question[]; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { saved: [] };
  if (items.length === 0) return { saved: [] };

  // Single batch INSERT instead of one request per question: a lone request
  // per row (the previous approach) meant a mid-batch network hiccup or
  // browser tab throttling silently dropped the rest with no visible error —
  // this way the whole batch succeeds or fails together as one statement.
  const questionRows = items.map((item, idx) => ({
    section_id: item.section_id,
    question_text: item.question_text,
    explanation: item.explanation,
    order: item.order ?? idx + 1,
    image_url: item.image_url || null,
    answer_format: item.answer_format || 'mcq',
    dimensi_personaliti: item.dimensi_personaliti || null,
    aras_kesukaran: item.aras_kesukaran ?? null,
  }));

  const { data: qData, error: qErr } = await supabase.from('pksk_questions').insert(questionRows).select();
  if (qErr || !qData) {
    console.warn('Failed to bulk insert PKSK questions:', qErr);
    return { saved: [], error: qErr?.message || 'Tiada data dikembalikan.' };
  }

  const choiceRows: { question_id: string; option_text: string; is_correct: boolean; nilai_skala: number | null }[] = [];
  qData.forEach((q: any, idx: number) => {
    for (const c of items[idx].choices) {
      choiceRows.push({
        question_id: q.id,
        option_text: c.text,
        is_correct: c.correct,
        nilai_skala: c.nilai_skala ?? null,
      });
    }
  });

  const { data: cData, error: cErr } = await supabase.from('pksk_choices').insert(choiceRows).select();
  if (cErr) console.warn('Failed to bulk insert PKSK choices (questions were already inserted):', cErr);

  const choicesByQuestion = new Map<string, Choice[]>();
  (cData || []).forEach((c: any) => {
    const list = choicesByQuestion.get(c.question_id) || [];
    list.push({
      id: c.id,
      question_id: c.question_id,
      option_text: c.option_text,
      is_correct: Boolean(c.is_correct),
      nilai_skala: c.nilai_skala ?? undefined,
    });
    choicesByQuestion.set(c.question_id, list);
  });

  const saved: Question[] = qData.map((q: any) => ({
    id: q.id,
    section_id: q.section_id,
    question_text: q.question_text,
    explanation: q.explanation,
    order: q.order,
    choices: choicesByQuestion.get(q.id) || [],
    image_url: q.image_url || undefined,
    answer_format: q.answer_format as Question['answer_format'],
    dimensi_personaliti: q.dimensi_personaliti || undefined,
    aras_kesukaran: q.aras_kesukaran ?? undefined,
  }));

  return { saved, error: cErr ? cErr.message : undefined };
}

// ------------------------- PKSK attempt & scoring -------------------------
// Writes to exam_attempts -> exam_attempt_questions -> pksk_results, NOT
// saveAttempt/updateUserStats (those are the SPPIM coin/XP reward path,
// which PKSK deliberately does not use — see plan doc #3c).

// Confirmed by Ieda: Bahagian A = Kecerdasan Insaniah (0.2), Bahagian B =
// Kecerdasan Intelek & Pengetahuan Am (0.7), Bahagian C = Artikulasi
// Penulisan (0.1). Bahagian A/B are objective (this module); Bahagian C is
// the essay module (Track B) and is written to markah_bahagian_c elsewhere
// once that module exists — this function never writes that column itself.
const PKSK_BAHAGIAN_WEIGHT = { a: 0.2, b: 0.7, c: 0.1 } as const;

// Bahagian A/B scoring style is data-driven, not name-matched: a question
// whose choices carry `nilai_skala` is scored on the confirmed 1-4 weighted
// scale (Bahagian A — Insaniah + Psikometrik, opinion/situational, no
// is_correct), everything else falls back to the binary is_correct scheme
// (Bahagian B). Same convention as savePkskMixedExamAttempt below.
const PKSK_A_MAX_WEIGHT = 4;

export async function savePkskAttempt(params: {
  user_id: string;
  tingkatan: string; // exam_attempts.tingkatan is NOT NULL — pass the student's Tahun 6 / Tingkatan 3 selection
  subject: Subject;
  section: Section;
  questions: Question[];
  answersMap: Record<string, string>; // question_id -> choice_id
}): Promise<{ attempt_id: string; percent: number } | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { user_id, tingkatan, subject, section, questions, answersMap } = params;

    const bahagianCol =
      subject.bahagian === 'A' ? 'markah_bahagian_a' : subject.bahagian === 'B' ? 'markah_bahagian_b' : null;
    if (!bahagianCol) {
      console.warn(`PKSK subject "${subject.name}" doesn't map to a known Bahagian (A/B) — skipping pksk_results write.`);
      return null;
    }

    const { data: attemptData, error: attemptErr } = await supabase
      .from('exam_attempts')
      .insert({
        user_id,
        module: 'PKSK',
        tingkatan,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (attemptErr || !attemptData) throw attemptErr || new Error('Tiada attempt data dikembalikan.');
    const attemptId = attemptData.id;

    const answerRows = questions.map((q) => {
      const choiceId = answersMap[q.id];
      const choice = q.choices.find((c) => c.id === choiceId);
      return {
        attempt_id: attemptId,
        question_id: q.id,
        choice_id: choiceId || null,
        is_correct: choice ? Boolean(choice.is_correct) : false,
      };
    });
    if (answerRows.length > 0) {
      const { error: aqErr } = await supabase.from('exam_attempt_questions').insert(answerRows);
      if (aqErr) throw aqErr;
    }

    // Weighted-scale (nilai_skala) scoring for Bahagian A (Insaniah/
    // Psikometrik — no is_correct, opinion/situational choices), binary
    // is_correct for Bahagian B. Same data-driven signal as
    // savePkskMixedExamAttempt above.
    let scoreSum = 0;
    for (const q of questions) {
      const choiceId = answersMap[q.id];
      const choice = q.choices.find((c) => c.id === choiceId);
      const isWeighted = q.choices.some((c) => c.nilai_skala != null);
      if (isWeighted) {
        scoreSum += (choice?.nilai_skala ?? 0) / PKSK_A_MAX_WEIGHT;
      } else if (choice?.is_correct) {
        scoreSum += 1;
      }
    }
    const percent = questions.length > 0 ? Math.round((scoreSum / questions.length) * 100) : 0;

    // jumlah_markah (weighted A+B+C) can only be computed once all three
    // Bahagian have a score — Bahagian C comes from the separate Artikulasi
    // (essay) module, which doesn't exist yet, so this is always null for
    // now. Best score per Bahagian (not latest) matches the existing
    // best_score convention used for SPPIM progress above.
    let jumlahMarkah: number | null = null;
    try {
      const { data: priorAttempts } = await supabase
        .from('exam_attempts')
        .select('id')
        .eq('user_id', user_id)
        .eq('module', 'PKSK');
      const attemptIds = (priorAttempts || []).map((a: any) => a.id);
      if (attemptIds.length > 0) {
        const { data: priorResults } = await supabase
          .from('pksk_results')
          .select('markah_bahagian_a, markah_bahagian_b, markah_bahagian_c')
          .in('attempt_id', attemptIds);
        let bestA: number | null = bahagianCol === 'markah_bahagian_a' ? percent : null;
        let bestB: number | null = bahagianCol === 'markah_bahagian_b' ? percent : null;
        let bestC: number | null = null;
        for (const r of priorResults || []) {
          if (typeof r.markah_bahagian_a === 'number') bestA = Math.max(bestA ?? 0, r.markah_bahagian_a);
          if (typeof r.markah_bahagian_b === 'number') bestB = Math.max(bestB ?? 0, r.markah_bahagian_b);
          if (typeof r.markah_bahagian_c === 'number') bestC = Math.max(bestC ?? 0, r.markah_bahagian_c);
        }
        if (bestA !== null && bestB !== null && bestC !== null) {
          jumlahMarkah = Math.round(
            bestA * PKSK_BAHAGIAN_WEIGHT.a + bestB * PKSK_BAHAGIAN_WEIGHT.b + bestC * PKSK_BAHAGIAN_WEIGHT.c
          );
        }
      }
    } catch (e) {
      console.warn('Failed to compute PKSK jumlah_markah (non-fatal, left null):', e);
    }

    // gred (letter grade bands) is intentionally left unset — no grading
    // scale/bands have been confirmed yet.
    const { error: resultErr } = await supabase.from('pksk_results').insert({
      attempt_id: attemptId,
      [bahagianCol]: percent,
      ...(jumlahMarkah !== null ? { jumlah_markah: jumlahMarkah } : {}),
    });
    if (resultErr) throw resultErr;

    // Local progress cache — same read-from-localStorage pattern the SPPIM
    // Dashboard's "Sambung Belajar" grid relies on (see saveAttempt /
    // getUserProgressList above), so PKSK progress can drive that grid
    // without an extra Supabase round-trip on every dashboard load.
    const existingProgress: UserProgress[] = JSON.parse(localStorage.getItem(LOCAL_PKSK_PROGRESS_KEY) || '[]');
    const progIdx = existingProgress.findIndex((p) => p.section_id === section.id && p.user_id === user_id);
    if (progIdx >= 0) {
      existingProgress[progIdx].best_score = Math.max(existingProgress[progIdx].best_score, percent);
      existingProgress[progIdx].is_completed = true;
    } else {
      existingProgress.push({
        id: `pksk-prog-${Date.now()}`,
        user_id,
        section_id: section.id,
        best_score: percent,
        is_completed: true,
        total_questions: questions.length,
      });
    }
    localStorage.setItem(LOCAL_PKSK_PROGRESS_KEY, JSON.stringify(existingProgress));

    return { attempt_id: attemptId, percent };
  } catch (e) {
    console.warn('Failed to save PKSK attempt to Supabase:', e);
    return null;
  }
}

export function getPkskProgressList(userId: string): UserProgress[] {
  const existingProgress: UserProgress[] = JSON.parse(localStorage.getItem(LOCAL_PKSK_PROGRESS_KEY) || '[]');
  return existingProgress.filter((p) => p.user_id === userId);
}

// ------------------- PKSK mixed Exam Mode (structural revision) -------------------
// Per PKSK_Structural_Revision.md: the real exam is 100 questions, Bahagian A
// (30, 20%) + Bahagian B (70, 70%) fully mixed in one 90-minute sitting — not
// picked one section at a time like Practice Mode (savePkskAttempt above,
// unchanged for that use). No new schema/columns needed: a "PKSK Exam Set" is
// just a pksk_paper whose title carries this prefix, with one pksk_section per
// category underneath it (Insaniah, Psikometrik, Math, Sains, BM, BI, IQ,
// Pengetahuan Am, RBT) — sets are pre-generated by content owners, never
// assembled live by this app (doc #6: no dynamic question-selection algorithm
// for MVP).
//
// Tahun 6 and Tingkatan 3 have entirely different question sets, and each
// tingkatan now offers 3 Aras Kesukaran variants (v2 restructure) — so each
// combination gets its own paper: title = `${PKSK_EXAM_SET_PAPER_PREFIX} -
// ${aras} (${tingkatan})`, e.g. "PKSK Exam - Mudah (Tahun 6)". No
// pksk_papers column stores tingkatan/aras — both are parsed from the title
// suffix, same convention as the prefix-based detection itself. (Older sets
// titled "... - Set A (...)" from before this restructure need renaming to
// one of the 3 Aras labels below to keep working.)
export const PKSK_EXAM_SET_PAPER_PREFIX = 'PKSK Exam';
export type PkskExamTingkatan = 'Tahun 6' | 'Tingkatan 3';
export type PkskExamAras = 'Mudah' | 'Sederhana' | 'Tinggi';

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getPkskExamSetQuestions(
  papers: Paper[],
  sections: Section[],
  questions: Question[],
  tingkatan: PkskExamTingkatan,
  aras: PkskExamAras
): { paper: Paper; questions: Question[] } | null {
  const paper = papers.find(
    (p) =>
      p.title.startsWith(PKSK_EXAM_SET_PAPER_PREFIX) &&
      p.title.includes(`(${tingkatan})`) &&
      p.title.includes(`- ${aras} `)
  );
  if (!paper) return null;
  const sectionIds = new Set(sections.filter((s) => s.paper_id === paper.id).map((s) => s.id));
  const examQuestions = questions.filter((q) => sectionIds.has(q.section_id));
  if (examQuestions.length === 0) return null;

  // Confirmed (v2 blueprint): Bahagian A (soalan 1-30, weighted nilai_skala
  // choices) stays a fixed, un-shuffled block — Insaniah then Psikometrik, in
  // whatever order the sections themselves were fetched (already "order"-
  // sorted). Bahagian B (soalan 31-100, binary is_correct) is shuffled across
  // subjects. Same nilai_skala-presence signal used for scoring drives this
  // split, so the two never drift out of sync.
  const bahagianA = examQuestions.filter((q) => q.choices.some((c) => c.nilai_skala != null));
  const bahagianB = examQuestions.filter((q) => !q.choices.some((c) => c.nilai_skala != null));
  const orderedQuestions = [...bahagianA, ...shuffleArray(bahagianB)];

  return { paper, questions: orderedQuestions };
}

export async function savePkskMixedExamAttempt(params: {
  user_id: string;
  tingkatan: string;
  questions: Question[];
  answersMap: Record<string, string>;
}): Promise<{ attempt_id: string; markahA: number | null; markahB: number | null } | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { user_id, tingkatan, questions, answersMap } = params;

    const { data: attemptData, error: attemptErr } = await supabase
      .from('exam_attempts')
      .insert({
        user_id,
        module: 'PKSK',
        mode: 'exam',
        tingkatan,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (attemptErr || !attemptData) throw attemptErr || new Error('Tiada attempt data dikembalikan.');
    const attemptId = attemptData.id;

    let aWeightSum = 0;
    let aWeightMax = 0;
    let bCorrect = 0;
    let bTotal = 0;

    const answerRows = questions.map((q) => {
      const choiceId = answersMap[q.id];
      const choice = q.choices.find((c) => c.id === choiceId);
      const isWeighted = q.choices.some((c) => c.nilai_skala != null);

      if (isWeighted) {
        aWeightSum += choice?.nilai_skala ?? 0;
        aWeightMax += PKSK_A_MAX_WEIGHT;
      } else {
        bTotal += 1;
        if (choice?.is_correct) bCorrect += 1;
      }

      return {
        attempt_id: attemptId,
        question_id: q.id,
        choice_id: choiceId || null,
        is_correct: choice ? Boolean(choice.is_correct) : false,
      };
    });
    if (answerRows.length > 0) {
      const { error: aqErr } = await supabase.from('exam_attempt_questions').insert(answerRows);
      if (aqErr) throw aqErr;
    }

    const markahA = aWeightMax > 0 ? Math.round((aWeightSum / aWeightMax) * 100) : null;
    const markahB = bTotal > 0 ? Math.round((bCorrect / bTotal) * 100) : null;

    // jumlah_markah needs Bahagian C too (separate Artikulasi essay module) —
    // best-of-history lookup, same convention as savePkskAttempt above.
    let jumlahMarkah: number | null = null;
    try {
      const { data: priorAttempts } = await supabase
        .from('exam_attempts')
        .select('id')
        .eq('user_id', user_id)
        .eq('module', 'PKSK');
      const attemptIds = (priorAttempts || []).map((a: any) => a.id);
      let bestC: number | null = null;
      if (attemptIds.length > 0) {
        const { data: priorResults } = await supabase
          .from('pksk_results')
          .select('markah_bahagian_c')
          .in('attempt_id', attemptIds);
        for (const r of priorResults || []) {
          if (typeof r.markah_bahagian_c === 'number') bestC = Math.max(bestC ?? 0, r.markah_bahagian_c);
        }
      }
      if (markahA !== null && markahB !== null && bestC !== null) {
        jumlahMarkah = Math.round(
          markahA * PKSK_BAHAGIAN_WEIGHT.a + markahB * PKSK_BAHAGIAN_WEIGHT.b + bestC * PKSK_BAHAGIAN_WEIGHT.c
        );
      }
    } catch (e) {
      console.warn('Failed to compute PKSK jumlah_markah (non-fatal, left null):', e);
    }

    const { error: resultErr } = await supabase.from('pksk_results').insert({
      attempt_id: attemptId,
      ...(markahA !== null ? { markah_bahagian_a: markahA } : {}),
      ...(markahB !== null ? { markah_bahagian_b: markahB } : {}),
      ...(jumlahMarkah !== null ? { jumlah_markah: jumlahMarkah } : {}),
    });
    if (resultErr) throw resultErr;

    return { attempt_id: attemptId, markahA, markahB };
  } catch (e) {
    console.warn('Failed to save PKSK mixed exam attempt to Supabase:', e);
    return null;
  }
}

// ---------------- LOCAL & SUPABASE LINK SYSTEM ----------------
const LOCAL_LINKS_KEY = 'eduquest_student_links';

export function getStudentLinks(): StudentLink[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_LINKS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveStudentLink(link: StudentLink): void {
  const links = getStudentLinks();
  links.push(link);
  localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(links));
}

export async function createLinkRequest(
  observer: UserProfile,
  inviteCode: string
): Promise<{ success: boolean; message: string }> {
  const cleanCode = inviteCode.trim().toUpperCase();
  if (cleanCode.length < 6) {
    return { success: false, message: 'Kod jemputan mestilah sekurang-kurangnya 6-8 aksara.' };
  }

  // Find student matching code
  const allUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  let student = allUsers.find((u) => u.invite_code?.toUpperCase() === cleanCode);

  if (!student && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('users').select('*').ilike('invite_code', cleanCode).maybeSingle();
      if (data) {
        student = {
          id: data.id,
          name: data.name,
          login_id: data.login_id,
          phone: data.phone,
          coin: data.coin ?? 100,
          xp: data.xp ?? 0,
          level: data.level ?? 1,
          created_at: data.created_at || new Date().toISOString(),
          role: 'student',
          invite_code: data.invite_code,
        };
      }
    } catch (e) {
      console.warn('Find student by invite code error:', e);
    }
  }

  if (!student) {
    return { success: false, message: 'Kod jemputan pelajar tidak dijumpai. Sila semak semula kod.' };
  }

  const existingLinks = getStudentLinks();
  if (existingLinks.some((l) => l.observer_id === observer.id && l.student_id === student?.id)) {
    return { success: false, message: 'Permintaan pautan ke pelajar ini telah pun dihantar sebelumnya.' };
  }

  const newLink: StudentLink = {
    id: `link-${Date.now()}`,
    observer_id: observer.id,
    observer_name: observer.name,
    observer_role: 'parent',
    student_id: student.id,
    student_name: student.name,
    student_invite_code: cleanCode,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  saveStudentLink(newLink);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('student_links').insert([newLink]);
    } catch (e) {
      console.warn('Sync student link to Supabase warning:', e);
    }
  }

  return { success: true, message: `Permintaan pautan berjaya dihantar ke pelajar ${student.name}!` };
}

export function updateLinkStatus(linkId: string, status: 'accepted' | 'rejected'): void {
  const links = getStudentLinks();
  const idx = links.findIndex((l) => l.id === linkId);
  if (idx >= 0) {
    links[idx].status = status;
    localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(links));
  }
}

// ---------------- FRIENDS SYSTEM ----------------
const LOCAL_FRIEND_REQS_KEY = 'eduquest_friend_requests';

export function getFriendRequests(): FriendRequest[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FRIEND_REQS_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function sendFriendRequest(
  sender: UserProfile,
  targetIdOrLoginIdOrName: string
): Promise<{ success: boolean; message: string }> {
  const cleanInput = targetIdOrLoginIdOrName.trim().toUpperCase();
  const allUsers: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  
  const target = allUsers.find(
    (u) =>
      u.id.toUpperCase() === cleanInput ||
      u.login_id.toUpperCase() === cleanInput ||
      u.name.toUpperCase().includes(cleanInput)
  );

  if (!target || target.id === sender.id) {
    return { success: false, message: 'Pelajar tidak dijumpai atau User ID yang dimasukkan adalah akaun anda sendiri.' };
  }

  const existing = getFriendRequests();
  if (
    existing.some(
      (r) =>
        (r.sender_id === sender.id && r.receiver_id === target.id) ||
        (r.sender_id === target.id && r.receiver_id === sender.id)
    )
  ) {
    return { success: false, message: 'Permintaan rakan telah wujud antara anda dan pelajar ini.' };
  }

  const req: FriendRequest = {
    id: `freq-${Date.now()}`,
    sender_id: sender.id,
    sender_name: sender.name,
    sender_login_id: sender.login_id,
    receiver_id: target.id,
    receiver_name: target.name,
    receiver_login_id: target.login_id,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  existing.push(req);
  localStorage.setItem(LOCAL_FRIEND_REQS_KEY, JSON.stringify(existing));
  return { success: true, message: `Permintaan rakan dihantar kepada ${target.name}!` };
}

export function respondFriendRequest(requestId: string, status: 'accepted' | 'rejected'): void {
  const list = getFriendRequests();
  const idx = list.findIndex((r) => r.id === requestId);
  if (idx >= 0) {
    list[idx].status = status;
    localStorage.setItem(LOCAL_FRIEND_REQS_KEY, JSON.stringify(list));
  }
}

// ---------------- BATTLE ROOMS SYSTEM ----------------
// Real cross-device 1v1: rooms live in Supabase so two different phones/devices
// can actually see each other. Falls back to localStorage (same-device only,
// effectively single-player) if Supabase isn't configured — see chat notes.
const LOCAL_BATTLE_ROOMS_KEY = 'eduquest_battle_rooms';

export function getBattleRooms(): BattleRoom[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_BATTLE_ROOMS_KEY) || '[]');
  } catch {
    return [];
  }
}

function mapDbRoom(row: any): BattleRoom {
  return {
    id: row.id,
    code: row.code,
    host_id: row.host_id,
    host_name: row.host_name,
    guest_id: row.guest_id || undefined,
    guest_name: row.guest_name || undefined,
    status: row.status,
    host_score: row.host_score ?? 0,
    guest_score: row.guest_score ?? 0,
    host_finished: row.host_finished ?? false,
    guest_finished: row.guest_finished ?? false,
    question_ids: row.question_ids || [],
    created_at: row.created_at,
  };
}

export async function createBattleRoom(host: UserProfile, questionPool: Question[] = []): Promise<BattleRoom> {
  const code = 'BTL-' + Math.floor(1000 + Math.random() * 9000);
  const questionIds = [...questionPool].sort(() => 0.5 - Math.random()).slice(0, 10).map((q) => q.id);

  const room: BattleRoom = {
    id: `room-${Date.now()}`,
    code,
    host_id: host.id,
    host_name: host.name,
    status: 'waiting',
    host_score: 0,
    guest_score: 0,
    host_finished: false,
    guest_finished: false,
    question_ids: questionIds,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('battle_rooms').insert({
        id: room.id,
        code: room.code,
        host_id: room.host_id,
        host_name: room.host_name,
        status: room.status,
        question_ids: questionIds,
        host_score: 0,
        guest_score: 0,
        host_finished: false,
        guest_finished: false,
      });
      if (!error) return room;
      console.warn('Supabase battle room insert failed, using local fallback:', error);
    } catch (e) {
      console.warn('Supabase battle room insert threw, using local fallback:', e);
    }
  }

  const rooms = getBattleRooms();
  rooms.push(room);
  localStorage.setItem(LOCAL_BATTLE_ROOMS_KEY, JSON.stringify(rooms));
  return room;
}

export async function joinBattleRoom(code: string, guest: UserProfile): Promise<BattleRoom | null> {
  const cleanCode = code.trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing, error: findErr } = await supabase
        .from('battle_rooms')
        .select('*')
        .eq('code', cleanCode)
        .eq('status', 'waiting')
        .maybeSingle();

      if (!findErr && existing) {
        const { data: updated, error: updateErr } = await supabase
          .from('battle_rooms')
          .update({ guest_id: guest.id, guest_name: guest.name, status: 'active' })
          .eq('id', existing.id)
          .select()
          .single();

        if (!updateErr && updated) return mapDbRoom(updated);
      }
      // Fall through to local only if nothing was found remotely either —
      // otherwise a "not found" here is a real answer, not a reason to fall back.
      if (!findErr && !existing) return null;
    } catch (e) {
      console.warn('Supabase battle room join threw, checking local fallback:', e);
    }
  }

  const rooms = getBattleRooms();
  const room = rooms.find((r) => r.code === cleanCode && r.status === 'waiting');
  if (room) {
    room.guest_id = guest.id;
    room.guest_name = guest.name;
    room.status = 'active';
    localStorage.setItem(LOCAL_BATTLE_ROOMS_KEY, JSON.stringify(rooms));
    return room;
  }
  return null;
}

// Polls the current state of a room — call this every few seconds while a
// battle is in progress so each player sees the opponent's live score.
export async function getBattleRoomState(roomId: string): Promise<BattleRoom | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('battle_rooms').select('*').eq('id', roomId).maybeSingle();
      if (!error && data) return mapDbRoom(data);
    } catch (e) {
      console.warn('Supabase battle room poll threw:', e);
    }
  }

  const rooms = getBattleRooms();
  return rooms.find((r) => r.id === roomId) || null;
}

// Updates this player's score on the shared room row (fire-and-forget from the
// caller's point of view — battle gameplay shouldn't block on network latency).
export async function updateBattleScore(roomId: string, isHost: boolean, newScore: number): Promise<void> {
  const field = isHost ? 'host_score' : 'guest_score';

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('battle_rooms').update({ [field]: newScore }).eq('id', roomId);
      return;
    } catch (e) {
      console.warn('Supabase battle score update threw:', e);
    }
  }

  const rooms = getBattleRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (room) {
    if (isHost) room.host_score = newScore;
    else room.guest_score = newScore;
    localStorage.setItem(LOCAL_BATTLE_ROOMS_KEY, JSON.stringify(rooms));
  }
}

export async function finishBattleRoom(roomId: string, isHost: boolean): Promise<void> {
  const field = isHost ? 'host_finished' : 'guest_finished';

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('battle_rooms').update({ [field]: true }).eq('id', roomId);
      return;
    } catch (e) {
      console.warn('Supabase battle finish update threw:', e);
    }
  }

  const rooms = getBattleRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (room) {
    if (isHost) room.host_finished = true;
    else room.guest_finished = true;
    localStorage.setItem(LOCAL_BATTLE_ROOMS_KEY, JSON.stringify(rooms));
  }
}

