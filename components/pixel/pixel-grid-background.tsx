import { cn } from "@/lib/utils";

const variantClass = {
  grid: "pixel-grid-bg",
  dither: "pixel-dither",
  scanlines: "pixel-scanlines",
} as const;

const fadeClass = {
  none: "",
  bottom: "[mask-image:linear-gradient(to_bottom,black,transparent)]",
  edges:
    "[mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]",
} as const;

/**
 * Decorative texture. Fills its nearest positioned ancestor, sits behind
 * content, ignores pointer events, and is hidden from assistive tech. The
 * parent must be `relative isolate` so the -z-10 layer stays inside it.
 */
export function PixelGridBackground({
  variant = "grid",
  fade = "none",
  className,
}: {
  variant?: keyof typeof variantClass;
  fade?: keyof typeof fadeClass;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      data-slot="pixel-grid-background"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        variantClass[variant],
        fadeClass[fade],
        className
      )}
    />
  );
}
