export interface UserProfile {
  id: string;
  name: string;
  login_id: string;
  phone?: string;
  coin: number;
  xp: number;
  level: number;
  created_at: string;
  streak_days?: number;
  last_active_date?: string;
  role?: 'student' | 'parent' | 'admin';
  invite_code?: string;
  linked_user_id?: string;
  school_name?: string;
  team_id?: string;
  password?: string;
  school_level?: 'rendah' | 'menengah';
  school_year?: number;
  school_form?: number;
  contact_email?: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'active' | 'locked';
  color: string;
}

export interface Paper {
  id: string;
  subject_id: string;
  year: number | string;
  title: string;
  status: 'active' | 'locked';
}

export interface Section {
  id: string;
  paper_id: string;
  name: 'A' | 'B' | 'C' | string;
  title: string;
  order: number;
}

export interface Choice {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  nilai_skala?: number;
}

export interface Question {
  id: string;
  section_id: string;
  question_text: string;
  explanation: string;
  order: number;
  choices: Choice[];
  difficulty?: 'mudah' | 'sederhana' | 'sukar';
  image_url?: string;
  answer_format?: 'mcq' | 'ya_tidak' | 'frekuensi3' | 'likert5' | 'betul_salah';
  dimensi_personaliti?: string;
  aras_kesukaran?: 1 | 2 | 3;
  source_set?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  section_id: string;
  best_score: number;
  is_completed: boolean;
  total_questions: number;
}

export interface UserAttempt {
  id: string;
  user_id: string;
  section_id: string;
  score: number;
  total_question: number;
  coins_earned: number;
  xp_earned: number;
  started_at: string;
  completed_at: string;
}

export interface DailyMission {
  id: string;
  title: string;
  reward_coins: number;
  is_completed: boolean;
  target: number;
  current: number;
}

export interface FriendRelation {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  leader_id: string;
  total_xp: number;
  members_count: number;
  created_at: string;
}

export interface StudentLink {
  id: string;
  observer_id: string;
  observer_name: string;
  observer_role: 'parent';
  student_id: string;
  student_name?: string;
  student_invite_code: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  reward_xp: number;
  reward_coins: number;
  is_unlocked: boolean;
  is_claimed: boolean;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_login_id: string;
  receiver_id: string;
  receiver_name?: string;
  receiver_login_id?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface BattleRoom {
  id: string;
  code: string;
  host_id: string;
  host_name: string;
  guest_id?: string;
  guest_name?: string;
  status: 'waiting' | 'active' | 'completed';
  host_score: number;
  guest_score: number;
  host_finished?: boolean;
  guest_finished?: boolean;
  question_ids?: string[];
  winner_id?: string;
  created_at: string;
}

// ------------------------- PKSK Artikulasi Karangan (Track B) -------------------------

export type ArticulationLevel = 'Tahun 6' | 'Tingkatan 3';
export type ArticulationMode = 'practice' | 'exam';

export interface ArticulationQuestion {
  id: string;
  level: ArticulationLevel;
  question: string;
  topic: string;
  question_type?: string;
  recommended_word_count?: number;
  is_active: boolean;
  created_at?: string;
}

// The essay itself, structured by section — stored JSON-encoded in
// essay_answers.draf_semasa so it round-trips without fragile text parsing.
// Isi 4 only applies at Tingkatan 3 (plan #9.1 Bahagian 11-12).
export interface EssaySections {
  pengenalan: string;
  isi: string[];
  penutup: string;
}

export interface EssayAnswer {
  id: string;
  attempt_id: string;
  articulation_question_id?: string;
  tajuk_esei: string;
  draf_semasa: string; // JSON-encoded EssaySections
  jumlah_perkataan: number;
  status: 'draf' | 'sedang_disemak_ai' | 'dikunci';
  skor_akhir?: number | null;
  dikunci_pada?: string | null;
  exam_start_time?: string | null;
  exam_end_time?: string | null;
}

// AI feedback shape returned by the /api/articulation-ai "evaluate" action,
// JSON-encoded into essay_feedback_rounds.maklum_balas_ai.
export interface EssayAiFeedback {
  score: number; // "AI Writing Score" — explicitly NOT the official PKSK Bahagian C mark
  kekuatan: string[]; // max 3
  perkara_dibaiki: string[]; // max 3
  cadangan: string[];
}

export interface EssayFeedbackRound {
  id: string;
  essay_answer_id: string;
  pusingan: number;
  draf_dihantar: string; // JSON-encoded EssaySections snapshot at submission time
  maklum_balas_ai: string; // JSON-encoded EssayAiFeedback
  created_at: string;
}
