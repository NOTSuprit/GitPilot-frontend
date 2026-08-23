"use client";

/**
 * The hero plate.
 *
 * The 3D figure is presented the way a technical book presents a diagram: ruled
 * frame, a plate number, and a caption that names what you are looking at. That
 * framing is what separates this from decoration — the scene animates the
 * pipeline, and the caption tells you which stage is on screen, so the visual
 * is readable rather than merely impressive.
 *
 * Three.js is code-split behind `next/dynamic` with `ssr: false`: the page's
 * text, headline and CTA render and are interactive before any of it arrives.
 * Until then — and for good on browsers without WebGL — the static plate below
 * holds the same composition, so there is no layout shift and nothing empty.
 */

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import { Micro } from "@/components/layout/listing";
import { PIPELINE_ACTS } from "@/components/landing/stages";
import { CHUNKS, SOURCE_FILES } from "@/components/landing/index-model";
import type { SceneReadout, SceneStage } from "@/components/landing/index-scene";
import { cn } from "@/lib/utils";

const IndexScene = dynamic(() => import("@/components/landing/index-scene"), {
  ssr: false,
  loading: () => <StaticPlate />,
});

/* Counted from the corpus rather than written down, so the caption cannot drift
   away from what the figure is actually drawing. */
const SOURCE_COUNT = SOURCE_FILES.length;
const CHUNK_COUNT = CHUNKS.length;

export function HeroFigure({ className }: { className?: string }) {
  const [stage, setStage] = useState<SceneStage>({
    act: 1,
    label: PIPELINE_ACTS[0].label,
    question: null,
  });
  const [hovered, setHovered] = useState<string | null>(null);

  const onStage = useCallback((next: SceneStage) => setStage(next), []);
  const onReadout = useCallback(
    (next: SceneReadout) => setHovered(next.hovered),
    []
  );

  const note =
    PIPELINE_ACTS.find((a) => a.act === stage.act)?.note ?? PIPELINE_ACTS[0].note;

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-lg border border-rule bg-paper-sunken/40",
        className
      )}
    >
      {/* Plate header: what this is, and which stage is running. */}
      <div className="flex items-center justify-between gap-3 border-b border-rule px-3 py-2">
        <Micro>fig · repository → answer</Micro>
        <span className="flex items-baseline gap-1.5">
          <span className="data-mono tabular text-[0.6875rem] leading-4 text-ink-faint">
            {String(stage.act).padStart(2, "0")}
          </span>
          <Micro className="text-live">{stage.label}</Micro>
        </span>
      </div>

      {/* What the figure is currently doing, as a labelled row rather than an
          overlay — an overlay sat on top of the listing, which is the most
          legible part of the diagram and the worst thing to cover. */}
      <div className="flex items-baseline gap-2.5 border-b border-rule bg-paper px-3 py-2">
        <span className="shrink-0 border-l-2 border-live pl-2">
          <Micro className="text-ink-soft">
            {stage.question ? "question" : "stage"}
          </Micro>
        </span>
        <p className="data-mono min-w-0 flex-1 truncate text-xs leading-snug text-ink">
          {stage.question ?? note}
        </p>
      </div>

      <IndexScene
        onStage={onStage}
        onReadout={onReadout}
        className="h-[19rem] w-full sm:h-[23rem] lg:h-[27rem]"
      />

      {/* Caption: the five acts as a legend, current one marked. The hovered
          chunk ref replaces the note, because naming a chunk is the point. */}
      <figcaption className="border-t border-rule px-3 py-2">
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {PIPELINE_ACTS.map((act) => (
            <li key={act.label} className="flex items-baseline gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "inline-block size-1.5 translate-y-[-1px] rounded-[1px]",
                  act.act === stage.act ? "bg-live" : "bg-rule-strong"
                )}
              />
              <span
                className={cn(
                  "label-mono",
                  act.act === stage.act ? "text-ink" : "text-ink-faint"
                )}
              >
                {act.label}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-1.5 text-[0.6875rem] leading-4 text-ink-soft">
          {hovered ? (
            <>
              <span className="text-ink-soft">chunk </span>
              <span className="data-mono text-live">{hovered}</span>
            </>
          ) : (
            <>
              A real listing of {SOURCE_COUNT} files, split into {CHUNK_COUNT}{" "}
              chunks, embedded, then queried. Hover a chunk to name it.
            </>
          )}
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * Static composition shown while Three.js loads and on browsers without WebGL.
 * It is the same diagram at rest: a listing on the left, an embedding space on
 * the right, and one citation drawn between them.
 */
function StaticPlate() {
  return (
    <div
      className="h-[19rem] w-full sm:h-[23rem] lg:h-[27rem]"
      role="img"
      aria-label="A source listing on the left, its code chunks arranged as an embedding space on the right, and a citation line drawn from a retrieved chunk back to the lines it came from."
    >
      <svg
        viewBox="0 0 480 270"
        className="size-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* the listing — bar length is line count, indent is depth */}
        <g stroke="var(--rule-strong)" strokeWidth="2.5" strokeLinecap="round">
          {STATIC_ROWS.map((row, i) => (
            <line
              key={i}
              x1={28 + row.indent}
              y1={30 + i * 10.5}
              x2={28 + row.indent + row.length}
              y2={30 + i * 10.5}
            />
          ))}
        </g>
        {/* the cited row */}
        <line
          x1={28 + STATIC_ROWS[9].indent}
          y1={30 + 9 * 10.5}
          x2={28 + STATIC_ROWS[9].indent + STATIC_ROWS[9].length}
          y2={30 + 9 * 10.5}
          stroke="var(--live)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* the embedding space — chunks clustered by area of the tree */}
        <g fill="var(--ink-faint)">
          {STATIC_POINTS.map((p, i) => (
            <rect key={i} x={p.x} y={p.y} width={p.s} height={p.s} rx="0.6" />
          ))}
        </g>

        {/* the retrieved chunk, and the citation back to its lines */}
        <line
          x1="196"
          y1={30 + 9 * 10.5}
          x2="322"
          y2="118"
          stroke="var(--live)"
          strokeWidth="1"
          opacity="0.85"
        />
        <rect x="318" y="114" width="8" height="8" rx="1" fill="var(--live)" />
      </svg>
    </div>
  );
}

/* Deterministic geometry for the static plate. Derived from the same shape of
   data the scene uses, but hand-reduced so the fallback stays tiny. */
const STATIC_ROWS = [
  { indent: 0, length: 92 },
  { indent: 9, length: 68 },
  { indent: 9, length: 121 },
  { indent: 9, length: 53 },
  { indent: 9, length: 80 },
  { indent: 9, length: 59 },
  { indent: 9, length: 47 },
  { indent: 9, length: 35 },
  { indent: 9, length: 100 },
  { indent: 9, length: 155 },
  { indent: 9, length: 87 },
  { indent: 9, length: 55 },
  { indent: 9, length: 42 },
  { indent: 9, length: 129 },
  { indent: 9, length: 72 },
  { indent: 9, length: 50 },
  { indent: 9, length: 145 },
  { indent: 9, length: 84 },
  { indent: 9, length: 31 },
  { indent: 9, length: 36 },
  { indent: 0, length: 65 },
  { indent: 0, length: 91 },
];

const STATIC_POINTS = (() => {
  const centres = [
    [352, 62],
    [312, 128],
    [400, 112],
    [346, 190],
    [404, 176],
  ];
  const out: { x: number; y: number; s: number }[] = [];
  for (let c = 0; c < centres.length; c += 1) {
    for (let n = 0; n < 14; n += 1) {
      const a = n * 2.399963 + c;
      const r = 8 + 22 * Math.sqrt((n + 0.4) / 14);
      out.push({
        x: centres[c][0] + Math.cos(a) * r,
        y: centres[c][1] + Math.sin(a) * r * 0.82,
        s: 4,
      });
    }
  }
  return out;
})();
