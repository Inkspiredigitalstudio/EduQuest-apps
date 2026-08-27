// Shared Gold/Silver/Bronze tier — used by PkskExamResult (mixed A+B exam)
// and PkskPracticeResult (single-section practice), cutoffs confirmed by
// Ieda (PKSK v2 restructure doc #6): Gold >=90, Silver 70-89, Bronze <70.
export interface PkskTier {
  label: string;
  medal: string;
  colorClass: string;
}

export function getPkskTier(overallPercent: number): PkskTier {
  if (overallPercent >= 90) return { label: 'Cemerlang!', medal: '🥇', colorClass: 'text-honey-500 bg-honey-100' };
  if (overallPercent >= 70) return { label: 'Mantap!', medal: '🥈', colorClass: 'text-mist-600 bg-mist-100' };
  return { label: 'Usaha Lagi!', medal: '🥉', colorClass: 'text-clay-500 bg-clay-100' };
}
