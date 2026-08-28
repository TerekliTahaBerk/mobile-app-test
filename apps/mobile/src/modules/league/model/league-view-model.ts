/** One row of the weekly league table. */
export type LeagueEntry = {
  id: string;
  /** Consecutive days; shown beside the name. */
  streak: number;
  name: string;
  rank: number;
  xp: number;
};

export type LeagueViewModel = {
  /** "bitişe 3 gün" */
  closesIn: string;
  entries: readonly LeagueEntry[];
  /** How many top ranks are promoted this week. */
  promotionCount: number;
  /** The row that is the learner themselves. */
  selfId: string;
  subtitle: string;
  title: string;
};

export const leaguePreviewData: LeagueViewModel = {
  closesIn: 'bitişe 3 gün',
  entries: [
    { id: 'deniz', name: 'Deniz', rank: 1, streak: 18, xp: 4820 },
    { id: 'arda', name: 'Arda', rank: 2, streak: 12, xp: 4200 },
    { id: 'selin', name: 'Selin', rank: 3, streak: 24, xp: 3980 },
    { id: 'mert', name: 'Mert', rank: 4, streak: 6, xp: 3410 },
    { id: 'zeynep', name: 'Zeynep', rank: 5, streak: 9, xp: 3150 },
    { id: 'kerem', name: 'Kerem', rank: 6, streak: 4, xp: 2610 },
    { id: 'self', name: 'Sen', rank: 7, streak: 12, xp: 2450 },
    { id: 'ipek', name: 'İpek', rank: 8, streak: 3, xp: 2280 },
  ],
  promotionCount: 5,
  selfId: 'self',
  subtitle: "İlk 5 Safir'e çıkar",
  title: 'Zümrüt Lig',
};
