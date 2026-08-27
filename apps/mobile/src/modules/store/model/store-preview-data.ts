import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';

/**
 * Presentation copy for the TEKRARLA Plus frame.
 *
 * This screen is marketing layout only. There is no billing, no in-app
 * purchase integration, no entitlement, and no payment capture anywhere in the
 * app — the CTA does not start a transaction, and the prices below are the
 * design's placeholder copy rather than a commercial commitment. Monetization
 * decisions live in docs/MONETIZATION.md and have not been made.
 */

export type PlanKey = 'monthly' | 'yearly';

export type PlanPreview = {
  badge?: string;
  cta: string;
  id: PlanKey;
  meta: string;
  perMonth: string;
  perMonthUnit: string;
  title: string;
};

export type StorePreviewViewModel = {
  campaign: { days: string; daysUnit: string; eyebrow: string; headline: string };
  consumables: readonly { id: string; kind: 'gem' | 'heart'; price: string; title: string }[];
  consumablesTitle: string;
  footnote: string;
  intro: { body: string; mood: CizgiMood; title: string };
  perks: readonly { id: string; kind: 'ad' | 'heart' | 'notebook' | 'trace'; label: string }[];
  plans: readonly PlanPreview[];
};

export const storePreviewData = {
  campaign: {
    days: '289',
    daysUnit: 'GÜN',
    eyebrow: 'SINAV DÖNEMİ KAMPANYASI',
    headline: 'YKS’ye 289 gün · yıllıkta %35 indirim',
  },
  consumables: [
    { id: 'consumable-gems', kind: 'gem', price: '29,90 ₺', title: '500' },
    { id: 'consumable-hearts', kind: 'heart', price: '9,90 ₺', title: '5 can' },
  ],
  consumablesTitle: 'TEK SEFERLİK',
  footnote: 'İlk 7 gün ücretsiz · dilediğin zaman iptal',
  intro: {
    body: 'Can beklemeden çalış, izini hiç kırmadan büyüt.',
    mood: 'excited',
    title: 'TEKRARLA Plus',
  },
  perks: [
    { id: 'perk-hearts', kind: 'heart', label: 'Sınırsız can — yanlışta ders durmaz' },
    { id: 'perk-ads', kind: 'ad', label: 'Reklamsız, kesintisiz çalışma' },
    { id: 'perk-notebook', kind: 'notebook', label: 'Yanlış defteri + kişisel tekrar planı' },
    { id: 'perk-trace', kind: 'trace', label: 'İz koruma: bir gün kaçırsan iz kırılmaz' },
  ],
  plans: [
    {
      badge: 'EN AVANTAJLI',
      cta: 'YILLIK PLANI BAŞLAT',
      id: 'yearly',
      meta: '12 ay · tek ödeme 399,90 ₺',
      perMonth: '33 ₺',
      perMonthUnit: '/ ay',
      title: 'Yıllık',
    },
    {
      cta: 'AYLIK PLANI BAŞLAT',
      id: 'monthly',
      meta: 'Her ay yenilenir · iptal serbest',
      perMonth: '59 ₺',
      perMonthUnit: '/ ay',
      title: 'Aylık',
    },
  ],
} as const satisfies StorePreviewViewModel;
