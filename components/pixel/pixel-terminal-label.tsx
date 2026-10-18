import { pixelToneClass, type PixelTone } from "@/lib/pixel-state";
import { cn } from "@/lib/utils";

/** A prompt-style label: `> index.ready`. The caret only blinks when asked. */
export function PixelTerminalLabel({
  prompt = ">",
  tone = "live",
  cursor = false,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & {
  prompt?: string;
  tone?: PixelTone;
  cursor?: boolean;
}) {
  return (
    <span
      data-slot="pixel-terminal-label"
      className={cn(
        "pixel-label inline-flex items-center gap-1.5 text-ink-soft",
        className
      )}
      {...props}
    >
      <span aria-hidden className={pixelToneClass[tone].text}>
        {prompt}
      </span>
      <span className={cn(cursor && "caret-live")}>{children}</span>
    </span>
  );
}
