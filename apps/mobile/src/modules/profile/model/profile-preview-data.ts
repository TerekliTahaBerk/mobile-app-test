import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';
import type { SubjectKey } from '@/shared/ui/theme/tokens';

/**
 * Presentation copy for the profile and league frames.
 *
 * Nothing here is a social graph, a league engine, a ranking rule, or a badge
 * system. There is no account, no other users, and no XP arithmetic — the
 * names and totals below are fixture text from the approved design, and the
 * league standings in particular must never be mistaken for a leaderboard
 * contract.
 */

export type ProfileStat = {
  icon: 'gem' | 'league' | 'net' | 'trace';
  id: string;
  label: string;
  value: string;
};

export type BadgeSlot = {
  id: string;
  /** Earned badges take a subject tint; the rest stay neutral. */
  tone: SubjectKey | 'locked' | 'more' | 'reward' | 'trace';
  label: string;
};

export type LeagueRow = {
  id: string;
  initials: string;
  isMe: boolean;
  name: string;
  promoted: boolean;
  rank: string;
  tag: string;
  xp: string;
};

export type ProfilePreviewViewModel = {
  badges: {
    earnedLabel: string;
    slots: readonly BadgeSlot[];
    title: string;
  };
  counts: readonly { id: string; label: string; value: string }[];
  header: { mood: CizgiMood };
  identity: { handle: string; inviteLabel: string; name: string };
  league: {
    countdown: string;
    promotionLabel: string;
    rank: string;
    rankLabel: string;
    rows: readonly LeagueRow[];
    title: string;
  };
  overviewTitle: string;
  stats: readonly ProfileStat[];
  tabs: { league: string; profile: string };
};

export const profilePreviewData = {
  badges: {
    earnedLabel: '7/24',
    slots: [
      { id: 'badge-history', label: 'Tarih rozeti', tone: 'history' },
      { id: 'badge-geography', label: 'Coğrafya rozeti', tone: 'geography' },
      { id: 'badge-xp', label: 'XP rozeti', tone: 'reward' },
      { id: 'badge-philosophy', label: 'Felsefe rozeti', tone: 'philosophy' },
      { id: 'badge-religion', label: 'Din Kültürü rozeti', tone: 'religion' },
      { id: 'badge-trace', label: 'İz rozeti', tone: 'trace' },
      { id: 'badge-locked', label: 'Kilitli rozet', tone: 'locked' },
      { id: 'badge-more', label: '17 rozet daha', tone: 'more' },
    ],
    title: 'Rozetler',
  },
  counts: [
    { id: 'count-courses', label: 'Kurs', value: '2' },
    { id: 'count-following', label: 'Takip', value: '11' },
    { id: 'count-followers', label: 'Takipçi', value: '9' },
  ],
  header: { mood: 'happy' },
  identity: {
    handle: '@elifgeo · Haziran 2026’dan beri',
    inviteLabel: 'DAVET ET',
    name: 'Elif Yılmaz',
  },
  league: {
    countdown: 'Bitişe 2 gün 14 saat',
    promotionLabel: 'YÜKSELME BÖLGESİ · İLK 5',
    rank: '4.',
    rankLabel: 'SIRA',
    rows: [
      {
        id: 'league-1',
        initials: 'MK',
        isMe: false,
        name: 'Mert Kaya',
        promoted: true,
        rank: '1',
        tag: 'TYT · bu hafta 1.240 XP',
        xp: '1.240',
      },
      {
        id: 'league-2',
        initials: 'ZA',
        isMe: false,
        name: 'Zeynep Aslan',
        promoted: true,
        rank: '2',
        tag: 'LGS · 21 günlük iz',
        xp: '1.108',
      },
      {
        id: 'league-3',
        initials: 'BD',
        isMe: false,
        name: 'Burak Demir',
        promoted: true,
        rank: '3',
        tag: 'TYT · 9 günlük iz',
        xp: '982',
      },
      {
        id: 'league-4',
        initials: 'EY',
        isMe: true,
        name: 'Elif Yılmaz (sen)',
        promoted: false,
        rank: '4',
        tag: 'TYT · 13 günlük iz',
        xp: '940',
      },
      {
        id: 'league-5',
        initials: 'SÖ',
        isMe: false,
        name: 'Selin Öztürk',
        promoted: false,
        rank: '5',
        tag: 'LGS · 4 günlük iz',
        xp: '915',
      },
      {
        id: 'league-6',
        initials: 'AÇ',
        isMe: false,
        name: 'Ahmet Çelik',
        promoted: false,
        rank: '6',
        tag: 'TYT · 2 günlük iz',
        xp: '770',
      },
      {
        id: 'league-7',
        initials: 'İK',
        isMe: false,
        name: 'İrem Koç',
        promoted: false,
        rank: '7',
        tag: 'LGS · 6 günlük iz',
        xp: '612',
      },
      {
        id: 'league-8',
        initials: 'OG',
        isMe: false,
        name: 'Onur Güneş',
        promoted: false,
        rank: '8',
        tag: 'TYT · 1 günlük iz',
        xp: '498',
      },
    ],
    title: 'Altın Kalem Ligi',
  },
  overviewTitle: 'Genel bakış',
  stats: [
    { icon: 'trace', id: 'stat-trace', label: 'Günlük iz', value: '13' },
    { icon: 'gem', id: 'stat-xp', label: 'Toplam XP', value: '7.480' },
    { icon: 'league', id: 'stat-league', label: 'Lig', value: 'Altın Kalem' },
    { icon: 'net', id: 'stat-net', label: 'TYT Sosyal net', value: '14,5' },
  ],
  tabs: { league: 'Lig', profile: 'Profil' },
} as const satisfies ProfilePreviewViewModel;
