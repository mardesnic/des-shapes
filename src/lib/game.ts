import type { Level } from './levels';
import type { Piece } from './shapes';

// From a few small pieces that only need moving, to many that need turning.
export const DIFFICULTIES = ['tiny', 'small', 'medium', 'big'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type Settings = {
  sound: boolean;
};

export const initialSettings: Settings = {
  sound: true,
};

export type Game = {
  difficulty: Difficulty;
  level: string;
  pieces: Piece[];
  solved: boolean;
};

export const newGame = (difficulty: Difficulty, level: Level): Game => ({
  difficulty,
  level: level.id,
  pieces: level.turns.map((turns) => ({ turns, at: null })),
  solved: false,
});

// The game with piece i moved. A piece only goes on the board where it
// fits, so once every piece is on it, the outline is full.
export function withPiece(game: Game, i: number, piece: Piece): Game {
  const pieces = game.pieces.map((p, k) => (k === i ? piece : p));
  return { ...game, pieces, solved: pieces.every((p) => p.at) };
}

// The levels solved at each difficulty, by id.
export type Stats = Record<Difficulty, string[]>;

export const initialStats: Stats = { tiny: [], small: [], medium: [], big: [] };

export function recordWin(stats: Stats, game: Game): Stats {
  const solved = stats[game.difficulty];
  if (solved.includes(game.level)) return stats;
  return { ...stats, [game.difficulty]: [...solved, game.level] };
}
