/** Certificate awards and how they read. Shared by admin, dashboard and /verify. */

export type Award = 'participation' | 'first' | 'second' | 'third' | 'gold' | 'silver' | 'bronze'
export type AwardStyle = 'places' | 'medals' | 'none'

export const AWARD_LABEL: Record<Award, string> = {
  participation: 'Participation',
  first: 'First Prize',
  second: 'Second Prize',
  third: 'Third Prize',
  gold: 'Gold Medal',
  silver: 'Silver Medal',
  bronze: 'Bronze Medal',
}

export const AWARD_SHORT: Record<Award, string> = {
  participation: 'Participation',
  first: '1st',
  second: '2nd',
  third: '3rd',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
}

export const AWARD_TONE: Record<Award, string> = {
  participation: '#AAB0BC',
  first: '#E8C25A',
  second: '#C9CED8',
  third: '#E0B26A',
  gold: '#E8C25A',
  silver: '#C9CED8',
  bronze: '#E0B26A',
}

/** Winners first, so their codes come first in a batch. */
export const AWARD_RANK: Record<Award, number> = { first: 0, gold: 0, second: 1, silver: 1, third: 2, bronze: 2, participation: 3 }

export const STYLE_AWARDS: Record<AwardStyle, Award[]> = {
  places: ['participation', 'first', 'second', 'third'],
  medals: ['participation', 'gold', 'silver', 'bronze'],
  none: ['participation'],
}

export const isAward = (v: unknown): v is Award => typeof v === 'string' && v in AWARD_LABEL

/** "Gold Medal — PTNK AI Challenge 2026", "Certificate of Participation — The Noders Community". */
export function certificateTitle(award: Award, eventName: string) {
  return award === 'participation' ? `Certificate of Participation — ${eventName}` : `${AWARD_LABEL[award]} — ${eventName}`
}
