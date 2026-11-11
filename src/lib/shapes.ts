// The rules: pieces, turning, and where a piece fits. No data here, so
// scripts/make-levels.ts can use it too.
import type { Level } from './levels';

// A square on the board, as [row, column].
export type Cell = readonly [number, number];
// A piece's squares, moved so its top and left are at 0.
export type Shape = Cell[];

export function normalize(s: Shape): Shape {
  const r0 = Math.min(...s.map(([r]) => r));
  const c0 = Math.min(...s.map(([, c]) => c));
  return s
    .map(([r, c]) => [r - r0, c - c0] as const)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

// The shape turned a quarter clockwise, `turns` times.
export function rotate(s: Shape, turns: number): Shape {
  let out = s;
  for (let k = 0; k < ((turns % 4) + 4) % 4; k++)
    out = out.map(([r, c]) => [c, -r] as const);
  return normalize(out);
}

export const extent = (s: Shape) => ({
  h: Math.max(...s.map(([r]) => r)) + 1,
  w: Math.max(...s.map(([, c]) => c)) + 1,
});

// Everything about a level the game needs while playing.
export type Puzzle = {
  w: number;
  h: number;
  // Whether each square is inside the outline, row by row.
  outline: boolean[][];
  // Each piece as it fits in the picture.
  shapes: Shape[];
};

export function puzzleOf(level: Level): Puzzle {
  const letters = [...new Set(level.cut.join('').replaceAll('.', ''))].sort();
  return {
    w: level.cut[0].length,
    h: level.cut.length,
    outline: level.cut.map((row) => [...row].map((ch) => ch !== '.')),
    shapes: letters.map((letter) =>
      normalize(
        level.cut.flatMap((row, r) =>
          [...row].flatMap((ch, c) => (ch === letter ? [[r, c] as const] : []))
        )
      )
    ),
  };
}

// Where each piece is: in the tray (`at` is null) or on the board with its
// top left square at `at`, turned `turns` quarters from how it fits.
export type Piece = { turns: number; at: Cell | null };

export const cellsAt = (s: Shape, turns: number, at: Cell): Cell[] =>
  rotate(s, turns).map(([r, c]) => [r + at[0], c + at[1]] as const);

// Whether piece i, turned and put at `at`, stays inside the outline and off
// every other piece on the board.
export function fits(
  puzzle: Puzzle,
  pieces: Piece[],
  i: number,
  turns: number,
  at: Cell
): boolean {
  const taken = new Set<string>();
  pieces.forEach((p, k) => {
    if (k !== i && p.at)
      for (const [r, c] of cellsAt(puzzle.shapes[k], p.turns, p.at))
        taken.add(`${r},${c}`);
  });
  return cellsAt(puzzle.shapes[i], turns, at).every(
    ([r, c]) => puzzle.outline[r]?.[c] && !taken.has(`${r},${c}`)
  );
}

// Where a piece let go at (r, c), in squares and not yet whole, lands: the
// nearest place close by where it fits, or null if there is none. Close by
// is forgiving, so a small finger doesn't have to be exact.
export function snap(
  puzzle: Puzzle,
  pieces: Piece[],
  i: number,
  turns: number,
  r: number,
  c: number
): Cell | null {
  let best: Cell | null = null;
  let bestD = 1.2;
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const at = [Math.round(r) + dr, Math.round(c) + dc] as const;
      const d = Math.hypot(at[0] - r, at[1] - c);
      if (d < bestD && fits(puzzle, pieces, i, turns, at)) {
        best = at;
        bestD = d;
      }
    }
  return best;
}

// A piece on the board turned a quarter about its middle: where it lands,
// or null if it can't turn there.
export function turnInPlace(
  puzzle: Puzzle,
  pieces: Piece[],
  i: number
): Piece | null {
  const { turns, at } = pieces[i];
  if (!at) return null;
  const middle = (cells: Cell[]) =>
    [0, 1].map((k) => cells.reduce((s, cell) => s + cell[k], 0) / cells.length);
  const [r0, c0] = middle(cellsAt(puzzle.shapes[i], turns, at));
  const [r1, c1] = middle(rotate(puzzle.shapes[i], turns + 1));
  const next = snap(puzzle, pieces, i, turns + 1, r0 - r1, c0 - c1);
  return next && { turns: (turns + 1) % 4, at: next };
}
