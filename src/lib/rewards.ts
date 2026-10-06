// Daily cap on coin rewards for repeating the same practice chapter/section.
// XP is unaffected — repeating still counts as learning — but only the first
// FULL_REWARD_RUNS_PER_DAY completions of one chapter per day pay coins, so
// students move on to other chapters instead of farming one.
//
// Stored on this device only, like the rest of the coin flow today (coins are
// awarded client-side); good enough to stop accidental/naive farming.

const STORAGE_KEY = 'eduquest_practice_reward_runs';
export const FULL_REWARD_RUNS_PER_DAY = 3;

interface RunLog {
  date: string;
  counts: Record<string, number>;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readLog(): RunLog {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (parsed && parsed.date === today() && parsed.counts) return parsed;
  } catch {
    // fall through to a fresh log
  }
  return { date: today(), counts: {} };
}

// Records one completed run and returns whether it still earns coins.
export function claimPracticeRun(userId: string, chapterKey: string): boolean {
  const log = readLog();
  const key = `${userId}:${chapterKey}`;
  const runs = (log.counts[key] || 0) + 1;
  log.counts[key] = runs;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // storage unavailable — don't block the reward
  }
  return runs <= FULL_REWARD_RUNS_PER_DAY;
}
