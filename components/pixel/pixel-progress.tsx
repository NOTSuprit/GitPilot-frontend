import { pixelToneClass, type PixelTone } from "@/lib/pixel-state";
import { cn } from "@/lib/utils";

/**
 * A segmented progress bar.
 *
 * `value` is a real amount of work done out of `max`. Pass `value={null}` only
 * when the total is genuinely unknown: the bar then shows marching cells and
 * exposes no aria-valuenow, rather than inventing a percentage.
 */
export function PixelProgress({
  value,
  max = 100,
  tone = "work",
  label,
  valueText,
  className,
}: {
  value: number | null;
  max?: number;
  tone?: Extract<PixelTone, "live" | "work" | "vector" | "retrieve">;
  /** Accessible name, e.g. "Indexing progress". */
  label: string;
  /** Human-readable value, e.g. "42 of 118 files". */
  valueText?: string;
  className?: string;
}) {
  const known = value !== null && max > 0;
  const indeterminate = !known;
  const clamped = known ? Math.min(max, Math.max(0, value)) : 0;
  const pct = known ? (clamped / max) * 100 : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={known ? clamped : undefined}
      aria-valuetext={valueText}
      data-slot="pixel-progress"
      className={cn(
        "pixel-dither h-3 w-full overflow-hidden border-2 border-rule-strong bg-paper-sunken",
        className
      )}
    >
      <div
        className={cn(
          "h-full",
          pixelToneClass[tone].text,
          indeterminate
            ? "pixel-indeterminate w-full"
            : "pixel-segments bg-current transition-[width] duration-300"
        )}
        style={indeterminate ? undefined : { width: `${pct}%` }}
      />
    </div>
  );
}
