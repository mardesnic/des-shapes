import type { Difficulty } from './game';

// The pictures, drawn by hand. One letter a square, standing for its colour
// once the outline is full, and '.' for outside the outline. While playing,
// only the outline shows; the colours are the reward.

export const PALETTE: Record<string, string> = {
  K: '#2b2f38', // black
  W: '#ffffff', // white
  S: '#9aa3ad', // grey
  R: '#e03131', // red
  M: '#e64980', // dark pink
  P: '#faa2c1', // pink
  O: '#f76707', // orange
  Y: '#fcc419', // yellow
  N: '#8b5a2b', // brown
  G: '#2f9e44', // green
  L: '#94d82d', // light green
  B: '#1c7ed6', // blue
  C: '#74c0fc', // sky blue
  V: '#9c36b5', // purple
};

export type Picture = {
  id: string;
  // Said when it's done: "It's a cat!" / "To je mačka!"
  name: { en: string; hr: string };
  rows: string[];
};

export const PICTURES: Picture[] = [
  {
    id: 'boat',
    name: { en: 'a boat', hr: 'brod' },
    rows: ['.R..', '.RR.', 'NNNN'],
  },
  {
    id: 'heart',
    name: { en: 'a heart', hr: 'srce' },
    rows: ['RR.RR', 'RRRRR', '.RRR.', '..R..'],
  },
  {
    id: 'cat',
    name: { en: 'a cat', hr: 'mačka' },
    rows: ['O...O', 'OO.OO', 'OKOKO', 'OOPOO', '.OOO.'],
  },
  {
    id: 'house',
    name: { en: 'a house', hr: 'kuća' },
    rows: [
      '..RR..',
      '.RRRR.',
      'RRRRRR',
      '.YYYY.',
      '.CYNY.',
      '.YYNY.',
      '.YYNY.',
    ],
  },
];

// A level is a picture cut into pieces: one letter a piece (a, b, c…), '.'
// outside. `turns` is how many quarter turns each piece starts away from how
// it fits, so the child has to turn it back.
export type Level = {
  id: string;
  picture: string;
  cut: string[];
  turns: number[];
};

export const LEVELS: Record<Difficulty, Level[]> = {
  tiny: [
    {
      id: 'boat-1',
      picture: 'boat',
      cut: ['.a..', '.aa.', 'bbcc'],
      turns: [0, 0, 0],
    },
  ],
  small: [
    {
      id: 'heart-1',
      picture: 'heart',
      cut: ['aa.bb', 'acccb', '.cdd.', '..d..'],
      turns: [1, 3, 2, 1],
    },
  ],
  medium: [
    {
      id: 'cat-1',
      picture: 'cat',
      cut: ['a...b', 'aa.bb', 'acccb', 'ddcee', '.dde.'],
      turns: [1, 2, 3, 0, 2],
    },
  ],
  big: [
    {
      id: 'house-1',
      picture: 'house',
      cut: [
        '..aa..',
        '.baac.',
        'bbdecc',
        '.bdec.',
        '.ddee.',
        '.fggg.',
        '.fffg.',
      ],
      turns: [0, 1, 3, 2, 1, 3, 2],
    },
  ],
};
