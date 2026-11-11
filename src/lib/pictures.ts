import type { Difficulty } from './game';

// The pictures, drawn by hand. One letter a square, standing for its colour
// once the outline is full, and '.' for outside the outline. While playing,
// only the outline shows; the colours are the reward.
//
// scripts/make-levels.ts cuts each picture into pieces, a few different
// ways, to make the levels.

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

// 9 to 12 squares: three or four pieces of two or three.
const TINY: Picture[] = [
  {
    id: 'boat',
    name: { en: 'a boat', hr: 'brod' },
    rows: ['.R...', '.RR..', '.RRR.', 'NNNNN'],
  },
  {
    id: 'tree',
    name: { en: 'a tree', hr: 'drvo' },
    rows: ['.G.', 'GGG', 'GGG', 'GGG', '.N.'],
  },
  {
    id: 'mushroom',
    name: { en: 'a mushroom', hr: 'gljiva' },
    rows: ['.RR.', 'RRRR', '.YY.', '.YY.'],
  },
  {
    id: 'ice-cream',
    name: { en: 'an ice cream', hr: 'sladoled' },
    rows: ['PPP', 'PPP', 'YYY', '.Y.'],
  },
  {
    id: 'house',
    name: { en: 'a house', hr: 'kuća' },
    rows: ['.R.', 'RRR', 'YYY', 'YNY'],
  },
  {
    id: 'fish',
    name: { en: 'a fish', hr: 'riba' },
    rows: ['.BB.B', 'BKBBB', '.BB.B'],
  },
  {
    id: 'heart',
    name: { en: 'a heart', hr: 'srce' },
    rows: ['R.R', 'RRR', 'RRR', '.R.'],
  },
  {
    id: 'car',
    name: { en: 'a car', hr: 'auto' },
    rows: ['.RR.', 'RCRR', 'RRRR', 'K..K'],
  },
];

// 12 to 16 squares: four or five pieces of three or four.
const SMALL: Picture[] = [
  {
    id: 'heart',
    name: { en: 'a heart', hr: 'srce' },
    rows: ['RR.RR', 'RRRRR', '.RRR.', '..R..'],
  },
  {
    id: 'cat-face',
    name: { en: 'a cat', hr: 'mačka' },
    rows: ['O...O', 'OO.OO', 'OKOKO', '.OPO.'],
  },
  {
    id: 'car',
    name: { en: 'a car', hr: 'auto' },
    rows: ['.RRR.', 'RCRCR', 'RRRRR', '.K.K.'],
  },
  {
    id: 'rocket',
    name: { en: 'a rocket', hr: 'raketa' },
    rows: ['.R.', 'SSS', 'SCS', 'SSS', 'RSR'],
  },
  {
    id: 'tree',
    name: { en: 'a tree', hr: 'drvo' },
    rows: ['..G..', '.GGG.', 'GGGGG', '.GGG.', '..N..'],
  },
  {
    id: 'apple',
    name: { en: 'an apple', hr: 'jabuka' },
    rows: ['..G.', '.RRR', 'RRRR', 'RRRR', '.RR.'],
  },
  {
    id: 'ghost',
    name: { en: 'a ghost', hr: 'duh' },
    rows: ['.VVV.', 'VKVKV', 'VVVVV', 'V.V.V'],
  },
  {
    id: 'umbrella',
    name: { en: 'an umbrella', hr: 'kišobran' },
    rows: ['.BBB.', 'BBBBB', 'B.N.B', '..N..', '.NN..'],
  },
];

// 16 to 24 squares: five or six pieces, most of four.
const MEDIUM: Picture[] = [
  {
    id: 'cat',
    name: { en: 'a cat', hr: 'mačka' },
    rows: ['O...O', 'OO.OO', 'OKOKO', 'OOPOO', '.OOO.'],
  },
  {
    id: 'fish',
    name: { en: 'a fish', hr: 'riba' },
    rows: ['..B...', '.BBB.B', 'BKBBBB', 'BBBBBB', '.BBB.B', '..B...'],
  },
  {
    id: 'house',
    name: { en: 'a house', hr: 'kuća' },
    rows: ['..R..', '.RRR.', 'RRRRR', 'YCYNY', 'YYYNY'],
  },
  {
    id: 'crown',
    name: { en: 'a crown', hr: 'kruna' },
    rows: ['Y.Y.Y', 'YYYYY', 'YRYBY', 'YYYYY'],
  },
  {
    id: 'butterfly',
    name: { en: 'a butterfly', hr: 'leptir' },
    rows: ['VV..VV', 'VVVVVV', '.VNNV.', 'PPNNPP', 'PP..PP'],
  },
  {
    id: 'sailboat',
    name: { en: 'a sailing boat', hr: 'jedrilica' },
    rows: ['.S...', '.SY..', '.SYY.', '.SYYY', 'NNNNN', '.NNN.'],
  },
  {
    id: 'strawberry',
    name: { en: 'a strawberry', hr: 'jagoda' },
    rows: ['.GGG.', 'RRRRR', 'RYRYR', '.RRR.', '..R..'],
  },
  {
    id: 'mushroom',
    name: { en: 'a mushroom', hr: 'gljiva' },
    rows: ['.RRR.', 'RRWRR', 'RRRRR', '..Y..', '.YYY.'],
  },
];

// 28 to 34 squares: six to eight pieces, most of four.
const BIG: Picture[] = [
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
  {
    id: 'pig',
    name: { en: 'a pig', hr: 'prase' },
    rows: ['PP...PP', 'PPPPPPP', 'PKPPPKP', 'PPMMMPP', '.PPPPP.'],
  },
  {
    id: 'penguin',
    name: { en: 'a penguin', hr: 'pingvin' },
    rows: [
      '..KKK..',
      '.KKKKK.',
      '.KWOWK.',
      'KKWWWKK',
      '.KWWWK.',
      '.KWWWK.',
      '.OO.OO.',
    ],
  },
  {
    id: 'car',
    name: { en: 'a car', hr: 'auto' },
    rows: ['..RRRR..', '.RCCRCR.', 'RRRRRRRR', 'RRRRRRRR', '.KK..KK.'],
  },
  {
    id: 'ladybird',
    name: { en: 'a ladybird', hr: 'bubamara' },
    rows: ['...K...', '..KKK..', '.RRKRR.', 'RKRKRKR', 'RRRKRRR', '.RRKRR.'],
  },
  {
    id: 'castle',
    name: { en: 'a castle', hr: 'dvorac' },
    rows: ['S.S.S.S', 'SSSSSSS', 'SCSSSCS', 'SSSNSSS', 'SSNNNSS'],
  },
  {
    id: 'frog',
    name: { en: 'a frog', hr: 'žaba' },
    rows: ['.GG.GG.', 'GKGGGKG', 'GGGGGGG', 'GRGGGRG', '.GRRRG.', 'GG...GG'],
  },
  {
    id: 'bus',
    name: { en: 'a bus', hr: 'autobus' },
    rows: ['YYYYYYY', 'YCCYCCY', 'YYYYYYY', 'OOOOOOO', '.KK.KK.'],
  },
];

export const PICTURES: Record<Difficulty, Picture[]> = {
  tiny: TINY,
  small: SMALL,
  medium: MEDIUM,
  big: BIG,
};
