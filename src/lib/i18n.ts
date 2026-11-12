import type { Difficulty } from './game';

export const LANGS = ['en', 'hr'] as const;
export type Lang = (typeof LANGS)[number];
export type Language = 'auto' | Lang;

// Each language's name in that language, for the picker.
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  hr: 'Hrvatski',
};

export function detectLang(): Lang {
  const preferred = navigator.languages ?? [navigator.language];
  return preferred.some((l) => l.toLowerCase().startsWith('hr')) ? 'hr' : 'en';
}

const en = {
  title: 'Shapes',
  newGame: 'New game',
  settings: 'Settings',
  done: 'Done',
  cancel: 'Cancel',
  levels: {
    tiny: 'Very easy',
    small: 'Easy',
    medium: 'Medium',
    big: 'Hard',
  } satisfies Record<Difficulty, string>,
  piece: 'Piece: drag it into the outline, tap it to turn it',
  undo: 'Undo',
  clear: 'Start over',
  solved: 'Well done!',
  itsA: (name: string) => `It's ${name}!`,
  solvedOf: (n: number, total: number) => `${n} of ${total}`,
  next: 'Next picture',
  changeLevel: 'Change level',
  language: 'Language',
  automatic: 'Automatic',
  sound: 'Sound and vibration',
  on: 'On',
  off: 'Off',
  statistics: 'Statistics',
  solvedColumn: 'Solved',
  allGames: 'All games',
  source: 'Source',
};

export type Strings = typeof en;

const hr: Strings = {
  title: 'Oblici',
  newGame: 'Nova igra',
  settings: 'Postavke',
  done: 'Gotovo',
  cancel: 'Odustani',
  levels: {
    tiny: 'Vrlo lako',
    small: 'Lako',
    medium: 'Srednje',
    big: 'Teško',
  },
  piece: 'Dio: povuci ga u obris, dodirni ga da ga okreneš',
  undo: 'Poništi',
  clear: 'Ispočetka',
  solved: 'Bravo!',
  itsA: (name: string) => `To je ${name}!`,
  solvedOf: (n: number, total: number) => `${n} od ${total}`,
  next: 'Sljedeća slika',
  changeLevel: 'Promijeni razinu',
  language: 'Jezik',
  automatic: 'Automatski',
  sound: 'Zvuk i vibracija',
  on: 'Uključen',
  off: 'Isključen',
  statistics: 'Statistika',
  solvedColumn: 'Riješeno',
  allGames: 'Sve igre',
  source: 'Izvorni kod',
};

export const STRINGS: Record<Lang, Strings> = { en, hr };
