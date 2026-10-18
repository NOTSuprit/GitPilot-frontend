import { cn } from "@/lib/utils";

/** The GitPilot wordmark in the pixel display face. Not yet wired in. */
export function PixelWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("pixel-display inline-block text-foreground", className)}>
      Git<span className="text-live">Pilot</span>
    </span>
  );
}
