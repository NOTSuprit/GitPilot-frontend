"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Lock,
  MessageSquareCode,
  Play,
  RotateCcw,
} from "lucide-react";

import { IndexError } from "@/components/dashboard/index-error";
import { LanguageMark } from "@/components/dashboard/language-mark";
import { StatusMark } from "@/components/dashboard/status-mark";
import { Data, Micro } from "@/components/layout/listing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useStartIndexing } from "@/hooks/use-repos";
import type { IndexStatus, Repository } from "@/lib/api";
import { ago, agoShort, num } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * A tile, but not a marketing card: no drop shadow, no dashed border, no icon
 * in a rounded blob. It is a spec plate — a status stripe welded to the top
 * edge, the identifier, and a mono ledger of the three numbers that decide
 * whether you can query it yet. Indexing progress is the stripe itself, so a
 * repository that is mid-build reads at a glance across the whole grid.
 */
const STRIPE: Record<IndexStatus, string> = {
  READY: "bg-live",
  INDEXING: "bg-work/25",
  PENDING: "bg-rule-strong",
  FAILED: "bg-fault",
};

export const TILE_GRID = "grid gap-6 sm:grid-cols-2 2xl:grid-cols-3";

function Cell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 px-4 py-2.5", className)}>
      <Micro className="block">{label}</Micro>
      <div className="mt-1 truncate">{children}</div>
    </div>
  );
}

export function RepoTile({ repo }: { repo: Repository }) {
  const router = useRouter();
  const startIndexing = useStartIndexing();

  const isIndexing = repo.indexStatus === "INDEXING";
  const isReady = repo.indexStatus === "READY";
  const isFailed = repo.indexStatus === "FAILED";
  const pending =
    startIndexing.isPending && startIndexing.variables === repo.id;

  function handlePrimary() {
    if (isReady) {
      router.push(`/chat/${repo.id}`);
      return;
    }
    startIndexing.mutate(repo.id, {
      onSuccess: () => router.push(`/chat/${repo.id}`),
    });
  }

  const indexedAt = agoShort(repo.indexedAt);
  const percent =
    repo.filesTotal > 0
      ? Math.min(100, Math.round((repo.filesProcessed / repo.filesTotal) * 100))
      : 0;

  return (
    <li className="group">
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-rule bg-card transition-colors focus-within:border-rule-strong hover:border-rule-strong">
        {/* Status stripe. For INDEXING it doubles as the progress bar. */}
        <div
          className={cn("h-[3px] w-full shrink-0", STRIPE[repo.indexStatus])}
          role={isIndexing ? "progressbar" : undefined}
          aria-valuenow={isIndexing ? percent : undefined}
          aria-valuemin={isIndexing ? 0 : undefined}
          aria-valuemax={isIndexing ? 100 : undefined}
          aria-label={isIndexing ? `Indexing ${repo.fullName}` : undefined}
        >
          {isIndexing && (
            <div
              className="h-full bg-work transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            {/* Owner is provenance and sits above at label size; the repo name
                is the title of the tile and gets the type to prove it. */}
            <div className="min-w-0">
              <Data className="block truncate" title={repo.fullName}>
                {repo.owner}/
              </Data>
              <h2
                className="truncate font-mono text-lg leading-snug font-semibold tracking-tight text-ink"
                title={repo.name}
              >
                {repo.name}
              </h2>
            </div>
            <StatusMark status={repo.indexStatus} className="mt-0.5 shrink-0" />
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <Data className="truncate" title={repo.defaultBranch}>
              {repo.defaultBranch}
            </Data>
            {repo.isPrivate && (
              <span className="flex shrink-0 items-center gap-0.5 text-ink-faint">
                <Lock aria-hidden className="size-3" />
                <Micro>private</Micro>
              </span>
            )}
          </div>

          <p
            className={cn(
              "mt-2 line-clamp-2 text-xs leading-relaxed",
              repo.description ? "text-ink-soft" : "text-ink-faint italic"
            )}
          >
            {repo.description ?? "No description"}
          </p>
        </div>

        {/* The ledger: three hairline-divided cells, tabular figures. Language
            gets the widest track — its values are words, not counts. */}
        <div className="grid shrink-0 grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)_minmax(0,1fr)] divide-x divide-rule border-t border-rule">
          <Cell label="language">
            <LanguageMark language={repo.language} />
          </Cell>
          <Cell label="chunks">
            <Data
              className={cn("tabular", isReady ? "text-ink" : "text-ink-faint")}
            >
              {repo.chunkCount > 0 ? num(repo.chunkCount) : "—"}
            </Data>
          </Cell>
          <Cell label="indexed">
            <Data
              className={cn(!indexedAt && "text-ink-faint")}
              title={ago(repo.indexedAt) ?? "never indexed"}
            >
              {indexedAt ?? "never"}
            </Data>
          </Cell>
        </div>

        {isIndexing && (
          <p className="shrink-0 truncate border-t border-rule px-4 py-2.5">
            <Data className="tabular text-work">{percent}%</Data>
            <Data className="text-ink-faint">
              {" · "}
              {num(repo.filesProcessed)}/{num(repo.filesTotal)} files ·{" "}
              {num(repo.chunkCount)} chunks
            </Data>
          </p>
        )}

        {isFailed && (
          <div className="shrink-0 border-t border-rule p-4">
            <IndexError message={repo.errorMessage} />
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1 border-t border-rule px-3 py-2.5">
          {repo.htmlUrl && (
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              className="text-ink-faint hover:text-ink"
              render={
                <Link
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${repo.fullName} on GitHub`}
                />
              }
            >
              <ExternalLink />
            </Button>
          )}

          <div className="ml-auto">
            {isIndexing ? (
              <Button variant="outline" size="sm" disabled>
                <Spinner data-icon="inline-start" className="size-3.5" />
                Indexing
              </Button>
            ) : (
              <Button
                variant={isReady ? "default" : "outline"}
                size="sm"
                onClick={handlePrimary}
                disabled={pending}
              >
                {pending ? (
                  <Spinner data-icon="inline-start" className="size-3.5" />
                ) : isReady ? (
                  <MessageSquareCode data-icon="inline-start" />
                ) : isFailed ? (
                  <RotateCcw data-icon="inline-start" />
                ) : (
                  <Play data-icon="inline-start" />
                )}
                {isReady ? "Chat" : isFailed ? "Retry" : "Index"}
              </Button>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

export function RepoTileSkeleton() {
  return (
    <li>
      <div className="overflow-hidden rounded-lg border border-rule bg-card">
        <div className="h-[3px] w-full bg-rule" />
        <div className="p-4">
          <Skeleton className="h-3.5 w-40 rounded-[3px]" />
          <Skeleton className="mt-2 h-3 w-16 rounded-[3px]" />
          <Skeleton className="mt-3 h-3 w-full rounded-[3px]" />
          <Skeleton className="mt-1.5 h-3 w-2/3 rounded-[3px]" />
        </div>
        <div className="grid grid-cols-3 divide-x divide-rule border-t border-rule">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-2.5">
              <Skeleton className="h-2.5 w-12 rounded-[3px]" />
              <Skeleton className="mt-1.5 h-3 w-14 rounded-[3px]" />
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-rule px-3 py-2.5">
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </li>
  );
}
