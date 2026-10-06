// Shared by api/uasa-tutor.ts (Inky/fallback hints) and api/uasa-content.ts
// (teacher-written hints on import) so both apply the same "does this hint
// state the answer?" rule.

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Same spelling for both sides: "70 000" → "70000", "RM 6.80" → "rm6.80",
// "5 / 6" → "5/6", runs of spaces collapsed.
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/(\d)\s+(?=\d{3}(?!\d))/g, '$1')
    .replace(/rm\s+/g, 'rm')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

// True when the hint states the correct answer. Number-aware boundaries so
// "15" doesn't match inside "150" or "1.5", while a sentence-ending "5/6." or
// "70 000," still counts. Single digits, and answers that already appear in
// the question itself (e.g. a median that is one of the data values), can't
// be told apart from legitimately quoting the question, so they're left to the
// prompt rules.
export function leaksAnswer(hint: string, answer: string, questionText: string): boolean {
  const a = normalise(answer);
  if (!a || /^\d$/.test(a)) return false;
  const boundary = (x: string) => new RegExp(`(?<![0-9]|[0-9][.,/])${escapeRegex(x)}(?![0-9]|[.,/][0-9])`);
  if (boundary(a).test(normalise(questionText))) return false;
  return boundary(a).test(normalise(hint));
}
