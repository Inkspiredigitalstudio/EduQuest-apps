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
  difficulty?: string
): Promise<Question | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: qData, error: qErr } = await supabase
      .from('questions')
      .insert({ section_id: sectionId, question_text: questionText, explanation, order })
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
      .update({ section_id: question.section_id, question_text: question.question_text, explanation: question.explanation, order: question.order })
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
  items: { section_id: string; question_text: string; explanation: string; difficulty?: string; choices: { text: string; correct: boolean }[] }[]
): Promise<Question[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const results: Question[] = [];
  for (const item of items) {
    const q = await addQuestionToSupabase(item.section_id, item.question_text, item.explanation, item.choices, 1, item.difficulty);
    if (q) results.push(q);
  }
  return results;
}
// Local fallback storage keys
const LOCAL_USER_KEY = 'sppim_local_active_user';
const LOCAL_USERS_LIST_KEY = 'sppim_local_users_db';
const LOCAL_PROGRESS_KEY = 'sppim_local_progress';
const LOCAL_ATTEMPTS_KEY = 'sppim_local_attempts';

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
  customUsername?: string
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

  // 1. Check local users list
  const localUsersList: UserProfile[] = JSON.parse(localStorage.getItem(LOCAL_USERS_LIST_KEY) || '[]');
  const currentActiveUser = getCurrentUser();
  const allLocal = [...localUsersList];
  if (currentActiveUser && !allLocal.some((u) => u.id === currentActiveUser.id)) {
    allLocal.push(currentActiveUser);
  }

  for (const u of allLocal) {
    if (u.phone) {
      const uPhoneClean = u.phone.replace(/[^0-9]/g, '');
      if (uPhoneClean && (uPhoneClean.includes(cleanPhone) || cleanPhone.includes(uPhoneClean))) {
        matchedChildrenMap.set(u.id, u);
      }
    }
  }

  // 2. Query Supabase users if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbUsers } = await supabase
        .from('users')
        .select('*');
      
      if (dbUsers) {
        for (const dbU of dbUsers) {
          if (dbU.phone) {
            const dbPhoneClean = String(dbU.phone).replace(/[^0-9]/g, '');
            if (dbPhoneClean && (dbPhoneClean.includes(cleanPhone) || cleanPhone.includes(dbPhoneClean))) {
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
            }
          }
        }
      }
    } catch (err) {
      console.warn('Supabase fetch parent children failed:', err);
    }
  }

  const children = Array.from(matchedChildrenMap.values());
  const attemptsMap: Record<string, UserAttempt[]> = {};
  const progressMap: Record<string, UserProgress[]> = {};

  // For each child, get local + remote attempts & progress
  for (const child of children) {
    // Progress
    const localProg = getUserProgressList(child.id);
    progressMap[child.id] = localProg;

    // Attempts
    const localAtt = getUserAttemptsList(child.id);
    attemptsMap[child.id] = localAtt;

    // Fetch remote if supabase enabled
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: remoteAtt } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', child.id);
        
        if (remoteAtt && remoteAtt.length > 0) {
          const mergedAtt = [...localAtt];
          for (const ra of remoteAtt) {
            if (!mergedAtt.some((la) => la.id === ra.id)) {
              mergedAtt.push(ra);
            }
          }
          attemptsMap[child.id] = mergedAtt;
        }

        const { data: remoteProg } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', child.id);
        
        if (remoteProg && remoteProg.length > 0) {
          const mergedProg = [...localProg];
          for (const rp of remoteProg) {
            if (!mergedProg.some((lp) => lp.section_id === rp.section_id)) {
              mergedProg.push(rp);
            }
          }
          progressMap[child.id] = mergedProg;
        }
      } catch (err) {
        console.warn('Supabase fetch child stats error:', err);
      }
    }
  }

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

  try {
    const [
      { data: dbSubjects, error: errSub },
      { data: dbPapers, error: errPap },
      { data: dbSections, error: errSec },
      { data: dbQuestions, error: errQ },
      { data: dbChoices, error: errCho },
    ] = await Promise.all([
      supabase.from('subjects').select('*'),
      supabase.from('papers').select('*'),
      supabase.from('sections').select('*').order('order', { ascending: true }),
      supabase.from('questions').select('*').order('order', { ascending: true }),
      supabase.from('choices').select('*'),
    ]);

    if (errSub) console.warn('Supabase fetch subjects warning:', errSub.message);
    if (errPap) console.warn('Supabase fetch papers warning:', errPap.message);
    if (errSec) console.warn('Supabase fetch sections warning:', errSec.message);
    if (errQ) console.warn('Supabase fetch questions warning:', errQ.message);

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

