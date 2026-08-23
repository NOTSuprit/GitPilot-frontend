"use client";

import { getRepoProgress } from "@/hooks/use-repos";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Indexing progress on a real axis: files walked out of files found.
 *
 * The backend does not know `filesTotal` until it has finished walking the
 * repository, so there is a genuine indeterminate phase at the start. Rather
 * than fake a percentage during it, the bar switches to a drifting hatch and
 * says so. A determinate bar that lies for the first ten seconds is worse than
 * an honest indeterminate one.
 */
export function IndexProgress({
  filesProcessed,
  filesTotal,
  chunkCount,
  className,
}: {
  filesProcessed: number;
  filesTotal: number;
  chunkCount?: number;
  className?: string;
}) {
  const known = filesTotal > 0;
  const percent = getRepoProgress({ filesProcessed, filesTotal });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="progressbar"
        aria-label="Indexing progress"
        aria-valuemin={0}
        aria-valuemax={100}
        {...(known ? { "aria-valuenow": percent } : {})}
        aria-valuetext={
          known
            ? `${num(filesProcessed)} of ${num(filesTotal)} files, ${percent}%`
            : "Counting files"
        }
        className="h-[3px] w-full overflow-hidden rounded-full bg-work/15"
      >
        {known ? (
          <div
            className="h-full rounded-full bg-work transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(percent, 1.5)}%` }}
          />
        ) : (
          <div className="hatch-work h-full w-full opacity-60" />
        )}
      </div>

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
