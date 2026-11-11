// Builds the levels in src/levels/ by cutting each picture in
// src/lib/pictures.ts into pieces, a few different ways.
//
//   node --experimental-strip-types scripts/make-levels.ts
//
// Every cut fills its outline, so every level can be solved. Of many random
// cuts, the ones kept are the easier ones: a solver counts how much trying
// a level takes, and a level with many places a piece could go first is
// harder for a child, as well as for the solver.
import { writeFileSync } from 'node:fs';

import { PICTURES } from '../src/lib/pictures.ts';
import { normalize, rotate, type Cell, type Shape } from '../src/lib/shapes.ts';

type Config = {
  // Piece sizes to pick from; a size listed twice comes up twice as often.
  sizes: number[];
  pieces: [number, number];
  cuts: number;
  // Levels come from this easiest part of the different cuts found.
  easiest: number;
  // Whether pieces start turned, so the child has to turn them back.
  turn: boolean;
};

const CONFIG: Record<keyof typeof PICTURES, Config> = {
  tiny: {
    sizes: [2, 3, 3],
    pieces: [3, 4],
    cuts: 4,
    easiest: 0.4,
    turn: false,
  },
  small: { sizes: [3, 4], pieces: [4, 5], cuts: 5, easiest: 0.4, turn: true },
  medium: {
    sizes: [3, 4, 4, 4],
    pieces: [5, 7],
    cuts: 5,
    easiest: 0.4,
    turn: true,
  },
  big: {
    sizes: [4, 4, 4, 5],
    pieces: [6, 8],
    cuts: 5,
    easiest: 0.15,
    turn: true,
  },
};
const TRIES = 4000;

// A small seeded random, so running the script again gives the same levels.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const key = ([r, c]: Cell) => `${r},${c}`;
const around = ([r, c]: Cell): Cell[] => [
  [r - 1, c],
  [r + 1, c],
  [r, c - 1],
  [r, c + 1],
];

// The outline cut into pieces of the given sizes, or null if this try got
// stuck. Each piece starts at the square hardest to reach, the one with
// fewest free neighbours, and grows at random from there.
function cut(
  cells: Cell[],
  cfg: Config,
  random: () => number
): Cell[][] | null {
  const free = new Map(cells.map((c) => [key(c), c]));
  const pick = <T>(xs: T[]) => xs[Math.floor(random() * xs.length)];
  const freeAround = (c: Cell) => around(c).filter((n) => free.has(key(n)));
  // Which region sizes can be split into pieces at all.
  const can = [true];
  for (let n = 1; n <= cells.length; n++)
    can[n] = cfg.sizes.some((s) => s <= n && can[n - s]);

  const pieces: Cell[][] = [];
  while (free.size) {
    const left = [...free.values()];
    const fewest = Math.min(...left.map((c) => freeAround(c).length));
    const start = pick(left.filter((c) => freeAround(c).length === fewest));
    const size = pick(cfg.sizes.filter((s) => s <= free.size));
    if (!size) return null;
    const piece = [start];
    free.delete(key(start));
    while (piece.length < size) {
      const next = [
        ...new Map(piece.flatMap(freeAround).map((c) => [key(c), c])).values(),
      ];
      if (!next.length) return null;
      const c = pick(next);
      piece.push(c);
      free.delete(key(c));
    }
    pieces.push(piece);
    // Every part still free must be splittable into pieces.
    const seen = new Set<string>();
    for (const c of free.values()) {
      if (seen.has(key(c))) continue;
      let n = 0;
      const todo = [c];
      seen.add(key(c));
      while (todo.length) {
        n++;
        for (const d of freeAround(todo.pop()!))
          if (!seen.has(key(d))) {
            seen.add(key(d));
            todo.push(d);
          }
      }
      if (!can[n]) return null;
    }
  }
  return pieces;
}

// How much trying solving takes: every piece put down, in a search for every
// way to fill the outline. Pieces of the same shape count as one.
function effort(
  outline: Set<string>,
  shapes: Shape[],
  turn: boolean,
  limit = 2_000_000
): number {
  const ways = shapes.map((s) => {
    const all = (turn ? [0, 1, 2, 3] : [0]).map((t) => rotate(s, t));
    return [...new Map(all.map((r) => [JSON.stringify(r), r])).values()];
  });
  const kinds = new Map<string, number>();
  const kindOf = shapes.map((s) => {
    const k = JSON.stringify(
      [0, 1, 2, 3].map((t) => JSON.stringify(rotate(s, t))).sort()[0]
    );
    kinds.set(k, (kinds.get(k) ?? 0) + 1);
    return k;
  });
  const order = [...outline]
    .map((k) => k.split(',').map(Number) as unknown as Cell)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const filled = new Set<string>();
  let nodes = 0;
  const go = () => {
    if (nodes > limit) return;
    const first = order.find((c) => !filled.has(key(c)));
    if (!first) return;
    const tried = new Set<string>();
    shapes.forEach((_, i) => {
      const k = kindOf[i];
      if (tried.has(k) || !kinds.get(k)) return;
      tried.add(k);
      for (const w of ways[i]) {
        // The piece's own first square goes on the first empty one.
        const at: Cell = [first[0] - w[0][0], first[1] - w[0][1]];
        const cells = w.map(([r, c]) => key([r + at[0], c + at[1]]));
        if (!cells.every((c) => outline.has(c) && !filled.has(c))) continue;
        nodes++;
        cells.forEach((c) => filled.add(c));
        kinds.set(k, kinds.get(k)! - 1);
        go();
        kinds.set(k, kinds.get(k)! + 1);
        cells.forEach((c) => filled.delete(c));
      }
    });
  };
  go();
  return nodes;
}

const levels: Record<string, unknown[]> = {};
for (const [d, pictures] of Object.entries(PICTURES)) {
  const cfg = CONFIG[d as keyof typeof CONFIG];
  const random = seeded(d.length * 7919 + 1);
  levels[d] = [];
  for (const p of pictures) {
    const h = p.rows.length;
    const w = p.rows[0].length;
    const cells: Cell[] = p.rows.flatMap((row, r) =>
      [...row].flatMap((ch, c) => (ch === '.' ? [] : [[r, c] as Cell]))
    );
    const outline = new Set(cells.map(key));
    const found = new Map<string, { rows: string[]; shapes: Shape[] }>();
    for (let k = 0; k < TRIES; k++) {
      const pieces = cut(cells, cfg, random);
      if (!pieces) continue;
      if (pieces.length < cfg.pieces[0] || pieces.length > cfg.pieces[1])
        continue;
      // Letters in reading order of each piece's first square.
      const sorted = pieces
        .map((piece) =>
          piece.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
        )
        .sort((a, b) => a[0][0] - b[0][0] || a[0][1] - b[0][1]);
      const grid = Array.from({ length: h }, () => Array(w).fill('.'));
      sorted.forEach((piece, i) => {
        for (const [r, c] of piece) grid[r][c] = String.fromCharCode(97 + i);
      });
      const rows = grid.map((row) => row.join(''));
      found.set(rows.join('/'), { rows, shapes: sorted.map(normalize) });
    }
    const scored = [...found.values()]
      .map((f) => ({ ...f, effort: effort(outline, f.shapes, cfg.turn) }))
      .sort((a, b) => a.effort - b.effort);
    const easiest = scored.slice(
      0,
      Math.max(cfg.cuts, Math.ceil(scored.length * cfg.easiest))
    );
    // Spread out over the easiest, so the kept levels differ.
    const kept = Array.from(
      { length: Math.min(cfg.cuts, easiest.length) },
      (_, k) => easiest[Math.floor((k * easiest.length) / cfg.cuts)]
    );
    kept.forEach((f, k) => {
      const turns = f.shapes.map((s) => {
        if (!cfg.turn) return 0;
        const plain = JSON.stringify(s);
        const options = [1, 2, 3].filter(
          (t) => JSON.stringify(rotate(s, t)) !== plain
        );
        return options.length
          ? options[Math.floor(random() * options.length)]
          : 0;
      });
      levels[d].push({
        id: `${p.id}-${k + 1}`,
        picture: p.id,
        cut: f.rows,
        turns,
      });
    });
    console.log(
      d.padEnd(7),
      p.id.padEnd(11),
      `${found.size} cuts,`,
      `kept effort ${kept.map((f) => f.effort).join(' ')}`,
      `(all ${scored[0]?.effort}–${scored.at(-1)?.effort})`
    );
  }
  writeFileSync(
    new URL(`../src/levels/${d}.json`, import.meta.url),
    JSON.stringify(levels[d], null, 2) + '\n'
  );
}
