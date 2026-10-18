import { PixelGlyph } from "@/components/pixel/pixel-glyph";
import {
  pixelStates,
  pixelToneClass,
  type PixelState,
  type PixelTone,
} from "@/lib/pixel-state";
import { cn } from "@/lib/utils";

/** A square tag. Hue + border + text; use PixelStateBadge for statuses. */
export function PixelBadge({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: PixelTone }) {
  const t = pixelToneClass[tone];
  return (
    <span
      data-slot="pixel-badge"
      className={cn(
        "pixel-label inline-flex h-5 w-fit shrink-0 items-center gap-1.5 border-2 px-1.5 whitespace-nowrap",
        t.edge,
        t.tint,
        t.text,
        className
      )}
      {...props}
    />
  );
}

/**
 * A semantic state label: glyph shape + hue + visible text. The text is always
 * present (or sr-only when `showLabel` is false) so color is never the only
 * signal.
 */
export function PixelStateBadge({
  state,
  showLabel = true,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  state: PixelState;
  showLabel?: boolean;
  /** Override the default text, e.g. a count or a more specific phrase. */
  label?: string;
}) {
  const cfg = pixelStates[state];
  const text = label ?? cfg.label;
  return (
    <PixelBadge
      tone={cfg.tone}
      title={cfg.hint}
      data-state={state}
      className={className}
      {...props}
    >
      <PixelGlyph shape={cfg.shape} busy={cfg.busy} className="size-3.5" />
      {showLabel ? text : <span className="sr-only">{text}</span>}
    </PixelBadge>
  );
}
