import {
  clusterPoints,
  nearest,
  pixelLinePath,
  type Point,
} from "@/components/landing/pixel-geometry";

/**
 * The hero illustration: a developer's desk at night, drawn on a 240x120 pixel
 * grid. Left to right it is the actual pipeline —
 *
 *   repository tiles -> chunks -> vector space -> query -> (terminal, in HTML)
 *
 * with a dotted citation trail running back from the retrieved vectors to the
 * source tiles. It is decorative (`aria-hidden`); the same pipeline is stated
 * in real text beside and below it. The scene is a Server Component and uses
 * no script: motion is a stepped CSS loop that is disabled under
 * prefers-reduced-motion, where the complete picture is shown at rest.
 */

const W = 240;
const H = 120;

/* ---- fixed layout ------------------------------------------------------- */

const STARS: Point[] = [
  [14, 6], [38, 12], [66, 4], [92, 10], [118, 5], [146, 12], [172, 4],
  [196, 9], [222, 5], [232, 18], [8, 26], [104, 18], [160, 20], [212, 30],
].map(([x, y]) => ({ x, y }));

const SKYLINE = [
  18, 26, 14, 32, 22, 12, 28, 20, 34, 16, 24, 30, 12, 22, 28, 18, 32, 14, 26,
  20,
];

type Tone = "live" | "vector" | "retrieve" | "work" | "dim";
const toneFill: Record<Tone, string> = {
  live: "fill-scene-live",
  vector: "fill-scene-vector",
  retrieve: "fill-scene-retrieve",
  work: "fill-scene-work",
  dim: "fill-scene-dim",
};

const TILES: { x: number; y: number; tone: Tone; bars: [number, number] }[] = [
  { x: 10, y: 18, tone: "live", bars: [26, 14] },
  { x: 16, y: 32, tone: "vector", bars: [20, 30] },
  { x: 12, y: 46, tone: "retrieve", bars: [32, 18] },
  { x: 18, y: 60, tone: "work", bars: [16, 24] },
  { x: 14, y: 74, tone: "dim", bars: [28, 10] },
];
const TILE_W = 52;
const TILE_H = 12;

const CHUNKS: { x: number; y: number; w: number; tone: Tone }[] = [
  { x: 80, y: 30, w: 10, tone: "vector" },
  { x: 92, y: 34, w: 8, tone: "vector" },
  { x: 82, y: 40, w: 12, tone: "retrieve" },
  { x: 96, y: 44, w: 9, tone: "retrieve" },
  { x: 80, y: 52, w: 9, tone: "live" },
  { x: 91, y: 56, w: 11, tone: "live" },
  { x: 84, y: 64, w: 10, tone: "work" },
  { x: 97, y: 68, w: 8, tone: "work" },
];

/* ---- the vector space --------------------------------------------------- */

const SPACE = { x: 118, y: 16, w: 82, h: 78 };
const CLUSTERS: Point[][] = [
  clusterPoints(138, 34, 9, 14, 0.4),
  clusterPoints(180, 38, 9, 13, 1.7),
  clusterPoints(150, 72, 9, 13, 2.6),
  clusterPoints(184, 74, 9, 12, 3.3),
];
const ALL_POINTS: Point[] = CLUSTERS.flat();

const QUERY: Point = { x: 212, y: 52 };
const RETRIEVED: Point[] = nearest(ALL_POINTS, QUERY, 5);
const isRetrieved = (p: Point) =>
  RETRIEVED.some((r) => r.x === p.x && r.y === p.y);

const RETRIEVAL_PATH = RETRIEVED.map((p) =>
  pixelLinePath(QUERY.x, QUERY.y, p.x + 1, p.y + 1)
).join("");

/* Citation trail: back from the retrieved cluster, along the desk, up into the
   source tiles. */
const TRAIL_PATH = [
  pixelLinePath(166, 94, 166, 100, { on: 2, off: 1 }),
  pixelLinePath(166, 100, 38, 100, { on: 3, off: 2 }),
  pixelLinePath(38, 100, 38, 90, { on: 2, off: 1 }),
].join("");

/* Cable from the query out to the terminal (drawn in HTML to the right). */
const CABLE_PATH = pixelLinePath(QUERY.x + 4, QUERY.y, W - 1, QUERY.y, {
  on: 3,
  off: 2,
});

export function PixelPipelineScene({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <defs>
        <pattern id="scene-grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 0h8v1H0zM0 0h1v8H0z" className="fill-scene-edge" opacity="0.18" />
        </pattern>
      </defs>

      {/* night */}
      <rect width={W} height={H} className="fill-scene" />
      <g className="fill-scene-ink">
        {STARS.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width="1"
            height="1"
            opacity={i % 3 === 0 ? 0.9 : 0.45}
            className={i % 4 === 0 ? "scene-twinkle" : undefined}
          />
        ))}
      </g>

      {/* distant skyline of source towers */}
      <g className="fill-scene-panel" opacity="0.55">
        {SKYLINE.map((h, i) => (
          <rect key={i} x={i * 12} y={104 - h} width="10" height={h} />
        ))}
      </g>

      {/* 1 — repository: a stack of source-file tiles */}
      <g>
        {TILES.map((t) => (
          <g key={t.y}>
            <rect x={t.x} y={t.y} width={TILE_W} height={TILE_H} className="fill-scene-edge" />
            <rect x={t.x + 1} y={t.y + 1} width={TILE_W - 2} height={TILE_H - 2} className="fill-scene-panel" />
            {/* folded corner */}
            <rect x={t.x + TILE_W - 5} y={t.y} width="5" height="5" className="fill-scene" />
            <rect x={t.x + TILE_W - 5} y={t.y + 4} width="4" height="1" className="fill-scene-edge" />
            <rect x={t.x + TILE_W - 5} y={t.y} width="1" height="5" className="fill-scene-edge" />
            {/* language stripe + name bars */}
            <rect x={t.x + 1} y={t.y + 1} width="3" height={TILE_H - 2} className={toneFill[t.tone]} />
            <rect x={t.x + 7} y={t.y + 3} width={t.bars[0]} height="2" className="fill-scene-dim" />
            <rect x={t.x + 7} y={t.y + 7} width={t.bars[1]} height="2" className="fill-scene-edge" />
          </g>
        ))}
      </g>

      {/* 2 — chunks: small fragments split out of the files */}
      <g className="scene-s2">
        {CHUNKS.map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width={c.w} height="4" className={toneFill[c.tone]} opacity="0.9" />
            <rect x={c.x + 1} y={c.y + 1} width={Math.max(2, c.w - 3)} height="1" className="fill-scene" opacity="0.55" />
          </g>
        ))}
        {/* three fragments in transit towards the index */}
        <g className="scene-packet">
          <rect x="106" y="40" width="4" height="3" className="fill-scene-live" />
          <rect x="106" y="52" width="4" height="3" className="fill-scene-vector" />
          <rect x="106" y="64" width="4" height="3" className="fill-scene-retrieve" />
        </g>
      </g>

      {/* 3 — embeddings: points in a vector space */}
      <g className="scene-s3">
        <rect x={SPACE.x} y={SPACE.y} width={SPACE.w} height={SPACE.h} fill="url(#scene-grid)" />
        <rect x={SPACE.x} y={SPACE.y} width={SPACE.w} height="1" className="fill-scene-edge" />
        <rect x={SPACE.x} y={SPACE.y + SPACE.h - 1} width={SPACE.w} height="1" className="fill-scene-edge" />
        <rect x={SPACE.x} y={SPACE.y} width="1" height={SPACE.h} className="fill-scene-edge" />
        <rect x={SPACE.x + SPACE.w - 1} y={SPACE.y} width="1" height={SPACE.h} className="fill-scene-edge" />
        <g className="fill-scene-dim">
          {ALL_POINTS.map((p, i) =>
            isRetrieved(p) ? null : (
              <rect key={i} x={p.x} y={p.y} width={i % 5 === 0 ? 3 : 2} height={i % 5 === 0 ? 3 : 2} opacity="0.85" />
            )
          )}
        </g>
      </g>

      {/* 4 — retrieval: the question reaches its nearest neighbours */}
      <g className="scene-s4">
        <path d={RETRIEVAL_PATH} className="fill-scene-retrieve" opacity="0.8" />
        <g className="fill-scene-retrieve">
          {RETRIEVED.map((p, i) => (
            <rect key={i} x={p.x - 1} y={p.y - 1} width="4" height="4" />
          ))}
        </g>
        {/* the query: a pixel diamond */}
        <g className="fill-scene-vector">
          <rect x={QUERY.x} y={QUERY.y - 4} width="1" height="1" />
          <rect x={QUERY.x - 1} y={QUERY.y - 3} width="3" height="1" />
          <rect x={QUERY.x - 2} y={QUERY.y - 2} width="5" height="1" />
          <rect x={QUERY.x - 3} y={QUERY.y - 1} width="7" height="3" />
          <rect x={QUERY.x - 2} y={QUERY.y + 2} width="5" height="1" />
          <rect x={QUERY.x - 1} y={QUERY.y + 3} width="3" height="1" />
          <rect x={QUERY.x} y={QUERY.y + 4} width="1" height="1" />
        </g>
        <path d={CABLE_PATH} className="fill-scene-vector" opacity="0.8" />
      </g>

      {/* 5 — citation: a dotted trail from the retrieved vectors back to the
          exact source tile */}
      <g className="scene-s5">
        <path d={TRAIL_PATH} className="fill-scene-live" />
        <path d="M36 89h5v1h-5zM37 88h3v1h-3zM38 87h1v1h-1z" className="fill-scene-live" />
      </g>

      {/* the desk */}
      <rect y="104" width={W} height="16" className="fill-scene-panel" />
      <rect y="104" width={W} height="1" className="fill-scene-edge" />
      {/* keyboard */}
      <rect x="30" y="108" width="46" height="7" className="fill-scene-edge" />
      <g className="fill-scene-panel">
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={32 + i * 4} y="110" width="3" height="1" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={34 + i * 4} y="112" width="3" height="1" />
        ))}
      </g>
      {/* mug */}
      <rect x="88" y="106" width="6" height="7" className="fill-scene-ink" opacity="0.85" />
      <rect x="94" y="107" width="2" height="1" className="fill-scene-ink" opacity="0.85" />
      <rect x="96" y="108" width="1" height="3" className="fill-scene-ink" opacity="0.85" />
      <rect x="94" y="111" width="2" height="1" className="fill-scene-ink" opacity="0.85" />
      {/* lamp */}
      <rect x="6" y="100" width="9" height="4" className="fill-scene-edge" />
      <rect x="10" y="88" width="1" height="12" className="fill-scene-edge" />
      <rect x="6" y="84" width="9" height="4" className="fill-scene-work" />
    </svg>
  );
}
