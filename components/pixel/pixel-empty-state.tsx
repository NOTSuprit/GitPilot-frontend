import { pixelToneClass, type PixelTone } from "@/lib/pixel-state";
import { cn } from "@/lib/utils";

/** Three stacked source tiles: the default empty-state motif. */
function PixelTiles({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={cn("size-12 fill-current", className)}
    >
      <rect x="1" y="9" width="8" height="6" opacity="0.35" />
      <rect x="5" y="5" width="8" height="6" opacity="0.6" />
      <rect x="8" y="1" width="7" height="6" />
      <rect x="9" y="3" width="3" height="1" className="fill-paper" />
      <rect x="9" y="5" width="5" height="1" className="fill-paper" />
    </svg>
  );
}

/**
 * Empty/zero/error-result state. Bring real copy and, if it helps, a real
 * action in `children` — this component adds no behavior of its own.
 */
export function PixelEmptyState({
  title,
  description,
  tone = "neutral",
  media,
  children,
  className,
  as: Title = "p",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: Extract<PixelTone, "neutral" | "fault" | "work">;
  /** Replaces the default tile illustration. */
  media?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Element for the title. Use a heading when this is the page's main message. */
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const t = pixelToneClass[tone];
  return (
    <div
      data-slot="pixel-empty-state"
      className={cn(
        "relative isolate flex w-full flex-col items-center gap-4 border-2 border-dashed px-6 py-10 text-center",
        t.edge,
        className
      )}
    >
      <div aria-hidden className="pixel-grid-bg absolute inset-0 -z-10 opacity-60" />
      <div className={t.text}>{media ?? <PixelTiles />}</div>
      <div className="max-w-sm space-y-1.5">
        <Title className="pixel-display text-lg text-foreground">{title}</Title>
        {description ? (
          <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
