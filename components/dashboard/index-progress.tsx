"use client";

import { PixelProgress } from "@/components/pixel/pixel-progress";
import { getRepoProgress } from "@/hooks/use-repos";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Indexing progress on a real axis: files walked out of files found.
 *
 * The backend does not know `filesTotal` until it has finished walking the
 * repository, so there is a genuine indeterminate phase at the start. Rather
 * than fake a percentage during it, the bar switches to marching cells and
 * says so. A determinate bar that lies for the first ten seconds is worse than
 * an honest indeterminate one.
 */
export function IndexProgress({
  filesProcessed,
  filesTotal,
  chunkCount,
  className,
  label = "Indexing progress",
}: {
  filesProcessed: number;
  filesTotal: number;
  chunkCount?: number;
  className?: string;
  /** Accessible name. Pass the repository name when several bars can be on screen. */
  label?: string;
}) {
  const known = filesTotal > 0;
  const percent = getRepoProgress({ filesProcessed, filesTotal });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <PixelProgress
        label={label}
        tone="work"
        value={known ? filesProcessed : null}
        max={known ? filesTotal : 100}
        valueText={
          known
            ? `${num(filesProcessed)} of ${num(filesTotal)} files, ${percent}%`
            : "Counting files"
        }
        className="h-2.5"
      />

      <p className="data-mono text-[0.6875rem] leading-4 text-ink-soft">
        {known ? (
          <>
            <span className="text-work">{percent}%</span>
            {" · "}
            {num(filesProcessed)}/{num(filesTotal)} files
            {typeof chunkCount === "number" && chunkCount > 0 && (
              <> · {num(chunkCount)} chunks embedded</>
            )}
          </>
        ) : (
          <>walking the repository · file count not known yet</>
        )}
      </p>
    </div>
  );
}
