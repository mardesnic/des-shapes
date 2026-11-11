import { describe, expect, it } from 'vitest';

import { DIFFICULTIES, newGame, withPiece } from './game';
import { LEVELS, PALETTE, PICTURES } from './levels';
import {
  cellsAt,
  extent,
  fits,
  pickLevel,
  puzzleOf,
  rotate,
  snap,
  turnInPlace,
  type Cell,
  type Piece,
  type Shape,
} from './shapes';

const L: Shape = [
  [0, 0],
  [1, 0],
  [1, 1],
];

// Where piece i goes in the level's own cut.
const answer = (cut: string[], i: number): Cell => {
  const letter = String.fromCharCode(97 + i);
  const r = cut.findIndex((row) => row.includes(letter));
  const c = Math.min(
    ...cut.map((row) => row.indexOf(letter)).filter((c) => c >= 0)
  );
  return [r, c];
};

describe('rotate', () => {
  it('turns a quarter clockwise', () => {
    expect(rotate(L, 1)).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
    ]);
  });

  it('comes back after four turns', () => {
    expect(rotate(L, 4)).toEqual(L);
    expect(rotate(L, -1)).toEqual(rotate(L, 3));
  });

  it('swaps width and height', () => {
    const bar: Shape = [
      [0, 0],
      [0, 1],
      [0, 2],
    ];
    expect(extent(rotate(bar, 1))).toEqual({ w: 1, h: 3 });
  });
});

describe('levels', () => {
  const all = DIFFICULTIES.flatMap((d) => LEVELS[d].map((l) => ({ d, l })));

  it('have unique ids', () => {
    const ids = all.map(({ l }) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(all)('$l.id is cut from its picture', ({ l }) => {
    const p = PICTURES.find((p) => p.id === l.picture)!;
    expect(p).toBeTruthy();
    expect(l.cut.map((row) => row.replace(/[a-z]/g, '#'))).toEqual(
      p.rows.map((row) => row.replace(/[^.]/g, '#'))
    );
    for (const row of p.rows)
      for (const ch of row) if (ch !== '.') expect(PALETTE[ch]).toBeTruthy();
  });

  it.each(all)('$l.id has whole pieces, each turned', ({ d, l }) => {
    const puzzle = puzzleOf(l);
    expect(l.turns).toHaveLength(puzzle.shapes.length);
    for (const s of puzzle.shapes) {
      // Every square of a piece touches another of the same piece.
      const has = (r: number, c: number) =>
        s.some(([r2, c2]) => r2 === r && c2 === c);
      const seen = new Set([`${s[0][0]},${s[0][1]}`]);
      const todo = [s[0]];
      while (todo.length) {
        const [r, c] = todo.pop()!;
        for (const [nr, nc] of [
          [r + 1, c],
          [r - 1, c],
          [r, c + 1],
          [r, c - 1],
        ])
          if (has(nr, nc) && !seen.has(`${nr},${nc}`)) {
            seen.add(`${nr},${nc}`);
            todo.push([nr, nc]);
          }
      }
      expect(seen.size).toBe(s.length);
    }
    if (d === 'tiny') expect(l.turns.every((t) => t === 0)).toBe(true);
  });

  it.each(all)('$l.id is solved by its own cut', ({ d, l }) => {
    const puzzle = puzzleOf(l);
    let game = newGame(d, l);
    puzzle.shapes.forEach((_, i) => {
      const at = answer(l.cut, i);
      expect(fits(puzzle, game.pieces, i, 0, at)).toBe(true);
      game = withPiece(game, i, { turns: 0, at });
    });
    expect(game.solved).toBe(true);
  });
});

describe('placing', () => {
  const level = LEVELS.small[0];
  const puzzle = puzzleOf(level);
  const tray: Piece[] = puzzle.shapes.map(() => ({ turns: 0, at: null }));

  it('keeps pieces inside the outline', () => {
    expect(fits(puzzle, tray, 0, 0, [0, 0])).toBe(true);
    // The heart's notch at the top.
    expect(fits(puzzle, tray, 0, 0, [0, 1])).toBe(false);
    expect(fits(puzzle, tray, 0, 0, [-1, 0])).toBe(false);
  });

  it('keeps pieces off each other', () => {
    const pieces = tray.map((p, i) =>
      i === 1 ? { turns: 0, at: [0, 0] as Cell } : p
    );
    expect(fits(puzzle, pieces, 0, 0, [0, 0])).toBe(false);
  });

  it('snaps to the nearest place that fits', () => {
    expect(snap(puzzle, tray, 0, 0, 0.3, -0.4)).toEqual([0, 0]);
    expect(snap(puzzle, tray, 0, 0, 5, 5)).toBeNull();
  });

  it('turns a piece on the board where it is', () => {
    const pieces = tray.map((p, i) =>
      i === 2 ? { turns: 0, at: [1, 1] as Cell } : p
    );
    const turned = turnInPlace(puzzle, pieces, 2);
    expect(turned?.turns).toBe(1);
    expect(fits(puzzle, pieces, 2, turned!.turns, turned!.at!)).toBe(true);
    expect(cellsAt(puzzle.shapes[2], 1, turned!.at!)).toHaveLength(4);
  });
});

describe('pickLevel', () => {
  it('never picks the one just played when there are others', () => {
    for (const d of DIFFICULTIES) {
      if (LEVELS[d].length < 2) continue;
      const prev = LEVELS[d][0].id;
      for (let k = 0; k < 20; k++)
        expect(pickLevel(d, [], prev, Math.random).id).not.toBe(prev);
    }
  });

  it('picks the only level again', () => {
    const only = LEVELS.tiny[0];
    if (LEVELS.tiny.length === 1)
      expect(pickLevel('tiny', [only.id], only.id, Math.random)).toBe(only);
  });
});
