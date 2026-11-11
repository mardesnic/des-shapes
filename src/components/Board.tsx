import { useEffect, useRef, useState, type CSSProperties } from 'react';

import type { Strings } from '../lib/i18n';
import { PALETTE, type Picture } from '../lib/pictures';
import {
  extent,
  rotate,
  snap,
  turnInPlace,
  type Cell,
  type Piece,
  type Puzzle,
  type Shape,
} from '../lib/shapes';

// Bright, different from each other, and clear on light and dark.
const COLOURS = [
  '#1c7ed6',
  '#f59f00',
  '#e03131',
  '#2f9e44',
  '#9c36b5',
  '#f76707',
  '#0c8599',
  '#e64980',
];
const colourOf = (i: number) => COLOURS[i % COLOURS.length];

// The gap around each square, in squares.
const GAP = 0.06;

// A piece drawn as one block: its squares, joined where they touch, each
// with a lighter middle so a child can count them.
function PieceShape({ shape, colour }: { shape: Shape; colour: string }) {
  const { w, h } = extent(shape);
  const has = (r: number, c: number) =>
    shape.some(([r2, c2]) => r2 === r && c2 === c);
  const span = 1 - 2 * GAP;
  return (
    <svg
      className='shape'
      viewBox={`0 0 ${w} ${h}`}
      style={{ aspectRatio: `${w} / ${h}` }}
      aria-hidden='true'
    >
      <g fill={colour}>
        {shape.map(([r, c]) => (
          <rect
            key={`${r},${c}`}
            x={c + GAP}
            y={r + GAP}
            width={span}
            height={span}
            rx={0.16}
          />
        ))}
        {shape.flatMap(([r, c]) => [
          has(r, c + 1) && (
            <rect
              key={`${r},${c}>`}
              x={c + 0.5}
              y={r + GAP}
              width={1}
              height={span}
            />
          ),
          has(r + 1, c) && (
            <rect
              key={`${r},${c}v`}
              x={c + GAP}
              y={r + 0.5}
              width={span}
              height={1}
            />
          ),
          has(r, c + 1) && has(r + 1, c) && has(r + 1, c + 1) && (
            <rect
              key={`${r},${c}+`}
              x={c + 0.5}
              y={r + 0.5}
              width={1}
              height={1}
            />
          ),
        ])}
      </g>
      <g fill='#fff' opacity={0.22}>
        {shape.map(([r, c]) => (
          <rect
            key={`${r},${c}`}
            x={c + 0.24}
            y={r + 0.24}
            width={0.52}
            height={0.52}
            rx={0.1}
          />
        ))}
      </g>
    </svg>
  );
}

type Drag = {
  i: number;
  from: 'tray' | 'board';
  pointer: number;
  // Where the finger went down and where it is now, in pixels.
  x0: number;
  y0: number;
  x: number;
  y: number;
  // Which point of the piece it holds, as a part of its width and height.
  fx: number;
  fy: number;
  // The board, measured when the drag began.
  box: DOMRect;
  unit: number;
  // How far above the finger the piece is held, so the finger doesn't
  // hide it.
  lift: number;
  moving: boolean;
};

// Moving further than this makes a drag; less is a tap, which turns it.
const SLOP = 8;

export function Board({
  puzzle,
  picture,
  pieces,
  solved,
  onMove,
  t,
}: {
  puzzle: Puzzle;
  picture: Picture;
  pieces: Piece[];
  solved: boolean;
  onMove: (i: number, piece: Piece) => void;
  t: Strings;
}) {
  const { w, h } = puzzle;
  const board = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  // A piece that couldn't turn where it is gives a little shake.
  const [shake, setShake] = useState<{ i: number; n: number } | null>(null);

  const shapeOf = (i: number) => rotate(puzzle.shapes[i], pieces[i].turns);

  // Where a dragged piece is drawn, in pixels, and where it would land.
  const ghostOf = (d: Drag) => {
    const e = extent(shapeOf(d.i));
    return {
      left: d.x - d.fx * e.w * d.unit,
      top: d.y - d.fy * e.h * d.unit - d.lift,
      width: e.w * d.unit,
    };
  };
  const targetOf = (d: Drag): Cell | null => {
    const g = ghostOf(d);
    return snap(
      puzzle,
      pieces,
      d.i,
      pieces[d.i].turns,
      (g.top - d.box.top) / d.unit,
      (g.left - d.box.left) / d.unit
    );
  };

  const turn = (i: number) => {
    const p = pieces[i];
    if (!p.at) return onMove(i, { turns: (p.turns + 1) % 4, at: null });
    const next = turnInPlace(puzzle, pieces, i);
    if (next) onMove(i, next);
    else setShake((s) => ({ i, n: (s?.n ?? 0) + 1 }));
  };

  const onDown =
    (i: number, from: Drag['from']) => (e: React.PointerEvent<HTMLElement>) => {
      if (solved || drag || !e.isPrimary || !board.current) return;
      const piece = e.currentTarget.getBoundingClientRect();
      const box = board.current.getBoundingClientRect();
      const unit = box.width / w;
      setDrag({
        i,
        from,
        pointer: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        x: e.clientX,
        y: e.clientY,
        fx: (e.clientX - piece.left) / piece.width,
        fy: (e.clientY - piece.top) / piece.height,
        box,
        unit,
        lift: e.pointerType === 'touch' ? Math.min(unit * 0.7, 40) : 0,
        moving: false,
      });
    };

  // While a finger is down, follow it anywhere on the screen.
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointer) return;
      const moving =
        drag.moving ||
        Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > SLOP;
      setDrag({ ...drag, x: e.clientX, y: e.clientY, moving });
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointer) return;
      setDrag(null);
      if (!drag.moving) return turn(drag.i);
      const at = targetOf(drag);
      if (at) onMove(drag.i, { turns: pieces[drag.i].turns, at });
      // Dropped off the board: back to the tray.
      else if (drag.from === 'board')
        onMove(drag.i, { turns: pieces[drag.i].turns, at: null });
    };
    const cancel = () => setDrag(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  });

  const dragging = drag?.moving ? drag : null;
  const target = dragging && targetOf(dragging);
  const lifted = (i: number) => dragging?.i === i;

  // Where a piece sits on the board, as parts of the board's size.
  const placeStyle = (s: Shape, at: Cell): CSSProperties => {
    const e = extent(s);
    return {
      left: `${(at[1] / w) * 100}%`,
      top: `${(at[0] / h) * 100}%`,
      width: `${(e.w / w) * 100}%`,
    };
  };

  return (
    <>
      <div className='stage'>
        <div
          ref={board}
          className={solved ? 'board board--solved' : 'board'}
          style={{ '--w': w, '--h': h } as CSSProperties}
        >
          <svg className='outline' viewBox={`0 0 ${w} ${h}`} aria-hidden='true'>
            {puzzle.outline.flatMap((row, r) =>
              row.map(
                (on, c) =>
                  on && (
                    <rect
                      key={`${r},${c}`}
                      x={c + GAP}
                      y={r + GAP}
                      width={1 - 2 * GAP}
                      height={1 - 2 * GAP}
                      rx={0.16}
                    />
                  )
              )
            )}
          </svg>

          {target && dragging && (
            <div
              className='piece piece--preview'
              style={placeStyle(shapeOf(dragging.i), target)}
            >
              <PieceShape
                shape={shapeOf(dragging.i)}
                colour={colourOf(dragging.i)}
              />
            </div>
          )}

          {pieces.map(
            (p, i) =>
              p.at && (
                <div
                  key={i}
                  className={[
                    'piece',
                    lifted(i) && 'piece--lifted',
                    shake?.i === i && `piece--shake${shake.n % 2}`,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={placeStyle(shapeOf(i), p.at)}
                  onPointerDown={onDown(i, 'board')}
                  role='img'
                  aria-label={t.piece}
                >
                  <PieceShape shape={shapeOf(i)} colour={colourOf(i)} />
                </div>
              )
          )}

          {solved && (
            <svg
              className='picture'
              viewBox={`0 0 ${w} ${h}`}
              aria-hidden='true'
            >
              {picture.rows.flatMap((row, r) =>
                [...row].map(
                  (ch, c) =>
                    ch !== '.' && (
                      <rect
                        key={`${r},${c}`}
                        x={c + GAP}
                        y={r + GAP}
                        width={1 - 2 * GAP}
                        height={1 - 2 * GAP}
                        rx={0.16}
                        fill={PALETTE[ch]}
                      />
                    )
                )
              )}
            </svg>
          )}
        </div>
      </div>

      {!solved && (
        <div className={pieces.length > 6 ? 'tray tray--many' : 'tray'}>
          {pieces.map((p, i) => {
            // Each piece keeps its place in the tray, big enough for it
            // turned any way, so nothing moves when one is taken out.
            const e = extent(puzzle.shapes[i]);
            const s = shapeOf(i);
            return (
              <div
                key={i}
                className='slot'
                style={{ '--size': Math.max(e.w, e.h) } as CSSProperties}
              >
                {!p.at && (
                  <div
                    className={lifted(i) ? 'piece piece--lifted' : 'piece'}
                    style={{
                      width: `${(extent(s).w / Math.max(e.w, e.h)) * 100}%`,
                    }}
                    onPointerDown={onDown(i, 'tray')}
                    role='img'
                    aria-label={t.piece}
                  >
                    <PieceShape shape={s} colour={colourOf(i)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {dragging && (
        <div
          className='piece piece--dragged'
          style={{ ...ghostOf(dragging), position: 'fixed' }}
        >
          <PieceShape
            shape={shapeOf(dragging.i)}
            colour={colourOf(dragging.i)}
          />
        </div>
      )}
    </>
  );
}
