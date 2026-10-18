import type { PixelShape } from "@/lib/pixel-state";
import { cn } from "@/lib/utils";

/** Rects on an 8x8 grid: [x, y, width, height]. */
type Rect = readonly [number, number, number, number];

const OUTLINE: readonly Rect[] = [
  [1, 1, 6, 1],
  [1, 6, 6, 1],
  [1, 2, 1, 4],
  [6, 2, 1, 4],
];

const SHAPES: Record<PixelShape, readonly Rect[]> = {
  hollow: OUTLINE,
  solid: [[1, 1, 6, 6]],
  half: [...OUTLINE, [2, 4, 4, 2]],
  check: [
    [1, 4, 1, 1],
    [2, 5, 1, 1],
    [3, 6, 1, 1],
    [4, 5, 1, 1],
    [5, 4, 1, 1],
    [6, 3, 1, 1],
    [7, 2, 1, 1],
  ],
  cross: [
    [1, 1, 1, 1],
    [2, 2, 1, 1],
    [3, 3, 2, 2],
    [5, 5, 1, 1],
    [6, 6, 1, 1],
    [6, 1, 1, 1],
    [5, 2, 1, 1],
    [2, 5, 1, 1],
    [1, 6, 1, 1],
  ],
  diamond: [
    [3, 1, 2, 1],
    [2, 2, 4, 1],
    [1, 3, 6, 2],
    [2, 5, 4, 1],
    [3, 6, 2, 1],
  ],
  dots: [
    [0, 3, 2, 2],
    [3, 3, 2, 2],
    [6, 3, 2, 2],
  ],
  dash: [[1, 3, 6, 2]],
};

/**
 * A pixel-grid glyph drawn with crisp SVG rects. Decorative: the accompanying
 * text label carries the meaning. Inherits color from `currentColor`.
 */
export function PixelGlyph({
  shape,
  busy = false,
  className,
}: {
  shape: PixelShape;
  busy?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      className={cn(
        "size-4 shrink-0 fill-current",
        busy && "animate-pulse motion-reduce:animate-none",
        className
      )}
    >
      {SHAPES[shape].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} />
      ))}
    </svg>
  );
}
