import { DailyMission } from '../types';

export const DEFAULT_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'm-1',
    title: 'Selesaikan 1 Bahagian Soalan',
    reward_coins: 50,
    is_completed: false,
    target: 1,
    current: 0,
  },
  {
    id: 'm-2',
    title: 'Jawab 5 Soalan Fekah Dengan Betul',
    reward_coins: 50,
    is_completed: false,
    target: 5,
    current: 0,
  },
  {
    id: 'm-3',
    title: 'Dapatkan Skor 100% Dalam Mana-mana Bahagian',
    reward_coins: 100,
    is_completed: false,
    target: 1,
    current: 0,
  },
];

export const SUPABASE_SQL_SETUP_DDL = `-- ==========================================
-- SPPIM QUEST - FULL SUPABASE POSTGRES SCHEMA
-- Copy and paste this script directly into Supabase SQL Editor
-- ==========================================

-- 1. Create Public Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  login_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  coin INTEGER DEFAULT 100,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  status TEXT DEFAULT 'active'
);

-- 3. Create Papers Table
CREATE TABLE IF NOT EXISTS public.papers (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

-- 4. Create Sections Table
CREATE TABLE IF NOT EXISTS public.sections (
  id TEXT PRIMARY KEY,
  paper_id TEXT REFERENCES public.papers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  order_num INTEGER DEFAULT 1
);

-- 5. Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  explanation TEXT,
  order_num INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'sederhana'
);

-- 6. Create Choices Table
CREATE TABLE IF NOT EXISTS public.choices (
  id TEXT PRIMARY KEY,
  question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE
);

-- 7. Create Progress Table
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
  best_score INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  total_questions INTEGER DEFAULT 0,
  UNIQUE(user_id, section_id)
);

-- 8. Create Attempts Table
CREATE TABLE IF NOT EXISTS public.attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_question INTEGER NOT NULL,
  coins_earned INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8b. Battle Rooms Table (real cross-device 1v1 sync)
CREATE TABLE IF NOT EXISTS public.battle_rooms (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  guest_id TEXT,
  guest_name TEXT,
  status TEXT DEFAULT 'waiting',
  question_ids TEXT[] DEFAULT '{}',
  host_score INTEGER DEFAULT 0,
  guest_score INTEGER DEFAULT 0,
  host_finished BOOLEAN DEFAULT false,
  guest_finished BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Trigger for Auto Creating Profile on Auth Sign-Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, login_id, phone, coin, xp, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Pelajar SPPIM'),
    COALESCE(NEW.raw_user_meta_data->>'login_id', 'STUDENT_' || SUBSTRING(NEW.id::text, 1, 6)),
    NEW.raw_user_meta_data->>'phone',
    100,
    0,
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: Read/Update own profile, or read all for leaderboard
CREATE POLICY "Users can view own and public stats" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Exam Data: Readable by anyone authenticated or anonymous
CREATE POLICY "Allow public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read papers" ON public.papers FOR SELECT USING (true);
CREATE POLICY "Allow public read sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Allow public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public read choices" ON public.choices FOR SELECT USING (true);

-- Progress & Attempts: Users manage their own
CREATE POLICY "Users can manage own progress" ON public.progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own attempts" ON public.attempts FOR ALL USING (auth.uid() = user_id);

-- Battle rooms are public read/write by design: they're short-lived, low-stakes,
-- and this app's accounts aren't reliably backed by real Supabase Auth sessions
-- (see the local-first hybrid model used throughout), so auth.uid() gating isn't
-- usable here the way it is for progress/attempts above.
CREATE POLICY "Public can read battle rooms" ON public.battle_rooms FOR SELECT USING (true);
CREATE POLICY "Public can create battle rooms" ON public.battle_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update battle rooms" ON public.battle_rooms FOR UPDATE USING (true);
`;
