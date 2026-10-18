/**
 * Deterministic pixel geometry for the landing illustrations.
 *
 * Everything here is integer-valued and computed from fixed inputs, so the
 * scene renders identically on every load and never depends on randomness.
 */

export type Point = { x: number; y: number };

/** Golden-angle cluster: n points spread around a centre, snapped to the grid. */
export function clusterPoints(
  cx: number,
  cy: number,
  n: number,
  spread: number,
  phase = 0
): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i += 1) {
    const angle = i * 2.399963 + phase;
    const r = spread * Math.sqrt((i + 0.5) / n);
    out.push({
      x: Math.round(cx + Math.cos(angle) * r),
      y: Math.round(cy + Math.sin(angle) * r * 0.85),
    });
  }
  return out;
}

/** The k points nearest to `from`, nearest first. Ties break by input order. */
export function nearest(points: Point[], from: Point, k: number): Point[] {
  return points
    .map((p, i) => ({
      p,
      i,
      d: (p.x - from.x) ** 2 + (p.y - from.y) ** 2,
    }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, k)
    .map((e) => e.p);
}

/**
 * A 1x1-pixel line (Bresenham) as an SVG path of unit squares. `dash` keeps
 * `on` pixels then skips `off`, for dotted citation trails.
 */
export function pixelLinePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dash?: { on: number; off: number }
): string {
  let x = x1;
  let y = y1;
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let step = 0;
  let d = "";
  for (;;) {
    const visible = !dash || step % (dash.on + dash.off) < dash.on;
    if (visible) d += `M${x} ${y}h1v1h-1z`;
    if (x === x2 && y === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
    step += 1;
  }
  return d;
}
