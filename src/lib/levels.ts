import big from '../levels/big.json';
import medium from '../levels/medium.json';
import small from '../levels/small.json';
import tiny from '../levels/tiny.json';
import type { Difficulty } from './game';
import { PICTURES, type Picture } from './pictures';

// A level is a picture cut into pieces: one letter a piece (a, b, c…), '.'
// outside. `turns` is how many quarter turns each piece starts away from how
// it fits, so the child has to turn it back. Made by scripts/make-levels.ts.
export type Level = {
  id: string;
  picture: string;
  cut: string[];
  turns: number[];
};

export const LEVELS: Record<Difficulty, Level[]> = {
  tiny,
  small,
  medium,
  big,
};

export const levelById = (d: Difficulty, id: string) =>
  LEVELS[d].find((l) => l.id === id);

export const pictureOf = (d: Difficulty, level: Level): Picture =>
  PICTURES[d].find((p) => p.id === level.picture)!;

// The next level: one not solved yet if there are any left, never the one
// just played, and if it can be, not the same picture again.
export function pickLevel(
  d: Difficulty,
  solved: string[],
  previous: string | undefined,
  random: () => number
): Level {
  const all = LEVELS[d];
  const last = all.find((l) => l.id === previous)?.picture;
  const prefer = (pool: Level[]) => {
    const other = pool.filter((l) => l.picture !== last);
    return other.length ? other : pool;
  };
  const fresh = all.filter((l) => !solved.includes(l.id) && l.id !== previous);
  const pool = prefer(
    fresh.length
      ? fresh
      : all.filter((l) => l.id !== previous || all.length === 1)
  );
  return pool[Math.floor(random() * pool.length)];
}
