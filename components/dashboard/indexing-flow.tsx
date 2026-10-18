"use client";

import { IndexProgress } from "@/components/dashboard/index-progress";
import { num } from "@/lib/format";

/**
 * The active-index readout on a tile: files walked -> chunks embedded, with a
 * connector whose cells march while work is in flight, over the real progress
 * bar. Only data the backend actually reports is shown — files processed,
 * files total (once known) and the chunk count so far. There is no invented
 * "phase": the backend does not report one.
 *
 * The marching connector is the only motion and it stops under
 * prefers-reduced-motion.
 */
function Node({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-2 border-work bg-work-tint px-2 py-1">
      <p className="label-mono text-work">{label}</p>
      <p className="data-mono tabular truncate text-xs text-foreground">
        {value}
      </p>
    </div>
  );
}

export function IndexingFlow({
  filesProcessed,
  filesTotal,
  chunkCount,
  label,
}: {
  filesProcessed: number;
  filesTotal: number;
  chunkCount: number;
  label?: string;
}) {
  const known = filesTotal > 0;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <Node
          label="files"
          value={
            known
              ? `${num(filesProcessed)}/${num(filesTotal)}`
              : `${num(filesProcessed)}/—`
          }
        />
        <div
          aria-hidden
          className="pixel-indeterminate h-1.5 w-8 text-work sm:w-12"
        />
        <Node label="chunks" value={num(chunkCount)} />
      </div>
      <IndexProgress
        filesProcessed={filesProcessed}
        filesTotal={filesTotal}
        chunkCount={chunkCount}
        label={label}
      />
    </div>
  );
}
