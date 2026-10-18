"use client";

import { PixelGlyph } from "@/components/pixel/pixel-glyph";
import { Skeleton } from "@/components/ui/skeleton";
import type { Repository } from "@/lib/api";
import { num } from "@/lib/format";
import {
  pixelStates,
  pixelToneClass,
  type PixelState,
} from "@/lib/pixel-state";
import { cn } from "@/lib/utils";
import type { StatusFilter } from "@/components/dashboard/repo-toolbar";

/**
 * Four figures counted from the repositories already loaded — no extra
 * requests. Each cell doubles as a status filter, driving the same filter
 * state the toolbar's status segments use, so clicking "failed" narrows the
 * listing to failed repositories. The "connected" cell clears the status
 * filter.
 */
type Stat = {
  key: StatusFilter;
  label: string;
  state: PixelState | null;
  count: (repos: Repository[]) => number;
};

const STATS: Stat[] = [
  { key: "ALL", label: "connected", state: null, count: (r) => r.length },
  {
    key: "READY",
    label: "indexed",
    state: "ready",
    count: (r) => r.filter((x) => x.indexStatus === "READY").length,
  },
  {
    key: "INDEXING",
    label: "indexing",
    state: "indexing",
    count: (r) => r.filter((x) => x.indexStatus === "INDEXING").length,
  },
  {
    key: "FAILED",
    label: "failed",
    state: "failed",
    count: (r) => r.filter((x) => x.indexStatus === "FAILED").length,
  },
];

export function RepoSummary({
  repos,
  status,
  onStatusChange,
}: {
  repos: Repository[];
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Repository summary">
      {STATS.map((stat) => {
        const value = stat.count(repos);
        const cfg = stat.state ? pixelStates[stat.state] : null;
        const tone = cfg ? pixelToneClass[cfg.tone] : pixelToneClass.neutral;
        const active = status === stat.key;
        const muted = stat.key !== "ALL" && value === 0;
        return (
          <li key={stat.key}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onStatusChange(active ? "ALL" : stat.key)}
              className={cn(
                "flex w-full flex-col gap-1 border-2 bg-card px-3 py-2.5 text-left shadow-pixel-sm transition-colors hover:bg-paper-field",
                active ? "border-ink" : "border-rule-strong"
              )}
            >
              <span className={cn("flex items-center gap-1.5", tone.text)}>
                {cfg && (
                  <PixelGlyph
                    shape={cfg.shape}
                    busy={cfg.busy && value > 0}
                    className="size-3.5"
                  />
                )}
                <span className="label-mono text-current">{stat.label}</span>
              </span>
              <span
                className={cn(
                  "pixel-display tabular text-3xl leading-none",
                  muted ? "text-ink-faint" : "text-foreground"
                )}
              >
                {num(value)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function RepoSummarySkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden>
      {STATS.map((stat) => (
        <li key={stat.key} className="border-2 border-rule-strong bg-card px-3 py-2.5 shadow-pixel-sm">
          <Skeleton className="h-3 w-16 rounded-none" />
          <Skeleton className="mt-2 h-7 w-10 rounded-none" />
        </li>
      ))}
    </ul>
  );
}
