import { cn } from "@/lib/utils";

/** [x, y, w, h, fill-class] on a 32x20 grid. */
type R = readonly [number, number, number, number, string];

const EDGE = "fill-current";
const DIM = "fill-ink-faint";
const LIVE = "fill-live";
const VEC = "fill-vector";
const RET = "fill-retrieve";
const WORK = "fill-work";

/* Each motif is one small pixel cluster: a recognisable picture of its stage. */
const MOTIFS: Record<"connect" | "index" | "retrieve" | "cite", readonly R[]> = {
  // a repository tile, a cable, a socket
  connect: [
    [1, 4, 12, 1, EDGE], [1, 15, 12, 1, EDGE], [1, 4, 1, 12, EDGE], [12, 4, 1, 12, EDGE],
    [3, 7, 6, 1, DIM], [3, 10, 8, 1, DIM], [3, 13, 4, 1, DIM],
    [13, 9, 8, 2, LIVE],
    [21, 6, 2, 8, LIVE], [23, 7, 2, 1, LIVE], [23, 12, 2, 1, LIVE],
    [25, 7, 5, 6, EDGE], [27, 9, 3, 2, LIVE],
  ],
  // one file split into chunks, each becoming a point
  index: [
    [1, 2, 9, 16, DIM], [2, 3, 7, 14, EDGE],
    [3, 5, 5, 1, LIVE], [3, 8, 5, 1, VEC], [3, 11, 5, 1, RET], [3, 14, 5, 1, WORK],
    [12, 5, 5, 2, LIVE], [12, 9, 5, 2, VEC], [12, 13, 5, 2, RET],
    [19, 6, 1, 1, DIM], [20, 7, 1, 1, DIM], [21, 8, 1, 1, DIM],
    [24, 4, 2, 2, LIVE], [28, 9, 2, 2, VEC], [23, 13, 2, 2, RET],
  ],
  // a scatter of vectors with the nearest few lit around a query diamond
  retrieve: [
    [2, 3, 2, 2, DIM], [7, 2, 2, 2, DIM], [3, 12, 2, 2, DIM], [9, 16, 2, 2, DIM], [13, 4, 2, 2, DIM],
    [16, 9, 3, 3, RET], [20, 5, 3, 3, RET], [20, 13, 3, 3, RET],
    [26, 9, 1, 1, VEC], [25, 10, 3, 1, VEC], [24, 11, 5, 1, VEC], [25, 12, 3, 1, VEC], [26, 13, 1, 1, VEC],
    [18, 10, 6, 1, RET],
  ],
  // an answer with a cited chip linking to a file tile
  cite: [
    [1, 3, 16, 1, DIM], [1, 6, 12, 1, DIM], [1, 9, 15, 1, DIM],
    [1, 13, 11, 4, RET], [2, 14, 9, 2, EDGE],
    [12, 15, 6, 1, LIVE],
    [19, 9, 11, 11, EDGE], [20, 10, 9, 9, DIM], [26, 9, 4, 4, EDGE],
    [21, 13, 5, 1, LIVE], [21, 16, 7, 1, LIVE],
  ],
};

export function StepMotif({
  kind,
  className,
}: {
  kind: keyof typeof MOTIFS;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 32 20"
      shapeRendering="crispEdges"
      className={cn("h-auto w-24 text-ink-soft sm:w-28", className)}
    >
      {MOTIFS[kind].map(([x, y, w, h, cls], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} className={cls} />
      ))}
    </svg>
  );
}
