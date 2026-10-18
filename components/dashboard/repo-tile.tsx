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
import { IndexingFlow } from "@/components/dashboard/indexing-flow";
import { LanguageMark } from "@/components/dashboard/language-mark";
import { Data, Micro } from "@/components/layout/listing";
import { PixelStateBadge } from "@/components/pixel/pixel-badge";
import { pixelPanelVariants } from "@/components/pixel/pixel-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useStartIndexing } from "@/hooks/use-repos";
import type { IndexStatus, Repository } from "@/lib/api";
import { ago, agoShort, num } from "@/lib/format";
import { pixelStateFromIndexStatus } from "@/lib/pixel-state";
import { cn } from "@/lib/utils";

/**
 * A repository as a compact data panel: a 2px edge whose colour is the state
 * (amber while indexing, red on failure), the identifier in the pixel face, a
 * ledger of the numbers that decide whether it is queryable yet, and a footer
 * with the actions. No illustration — the repository's own data is the content.
 */
const TONE: Record<IndexStatus, "default" | "work" | "fault"> = {
  READY: "default",
  INDEXING: "work",
  PENDING: "default",
  FAILED: "fault",
};

export const TILE_GRID = "grid gap-5 sm:grid-cols-2 2xl:grid-cols-3";

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
    <div className={cn("min-w-0 px-3 py-2", className)}>
      <Micro className="block">{label}</Micro>
      <div className="mt-0.5 truncate">{children}</div>
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
  const filesKnown = repo.filesTotal > 0;
  const actionLabel = isReady ? "Chat" : isFailed ? "Retry" : "Index";

  return (
    <li>
      <article
        className={cn(
          pixelPanelVariants({ tone: TONE[repo.indexStatus] }),
          "flex h-full flex-col shadow-pixel-sm transition-shadow hover:shadow-pixel focus-within:shadow-pixel"
        )}
      >
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Data className="block truncate" title={repo.fullName}>
                {repo.owner}/
              </Data>
              <h2
                className="pixel-display truncate text-xl text-foreground"
                title={repo.name}
              >
                {repo.name}
              </h2>
            </div>
            <PixelStateBadge
              state={pixelStateFromIndexStatus(repo.indexStatus)}
              className="mt-0.5"
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Data className="truncate" title={`default branch: ${repo.defaultBranch}`}>
              {repo.defaultBranch}
            </Data>
            <span className="flex shrink-0 items-center gap-1 text-ink-faint">
              {repo.isPrivate && <Lock aria-hidden className="size-3" />}
              <Micro>{repo.isPrivate ? "private" : "public"}</Micro>
            </span>
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

        {/* The ledger: three cells, tabular figures. */}
        <div className="grid shrink-0 grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] divide-x divide-rule border-t-2 border-rule">
          <Cell label="language">
            <LanguageMark language={repo.language} />
          </Cell>
          <Cell label="files">
            <Data
              className={cn("tabular", filesKnown ? "text-ink" : "text-ink-faint")}
              title={
                filesKnown
                  ? `${num(repo.filesProcessed)} of ${num(repo.filesTotal)} files processed`
                  : "file count not known yet"
              }
            >
              {filesKnown
                ? `${num(repo.filesProcessed)}/${num(repo.filesTotal)}`
                : "—"}
            </Data>
          </Cell>
          <Cell label="chunks">
            <Data
              className={cn("tabular", repo.chunkCount > 0 ? "text-ink" : "text-ink-faint")}
            >
              {repo.chunkCount > 0 ? num(repo.chunkCount) : "—"}
            </Data>
          </Cell>
        </div>

        {isIndexing && (
          <div className="shrink-0 border-t-2 border-rule p-4">
            <IndexingFlow
              filesProcessed={repo.filesProcessed}
              filesTotal={repo.filesTotal}
              chunkCount={repo.chunkCount}
              label={`Indexing ${repo.fullName}`}
            />
          </div>
        )}

        {isFailed && (
          <div className="shrink-0 border-t-2 border-rule p-4">
            <IndexError message={repo.errorMessage} />
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2 border-t-2 border-rule px-3 py-2.5">
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

          <Data
            className={cn("truncate text-[0.6875rem]", !indexedAt && "text-ink-faint")}
            title={ago(repo.indexedAt) ?? "never indexed"}
          >
            {indexedAt ? `indexed ${indexedAt}` : "never indexed"}
          </Data>

          <div className="ml-auto shrink-0">
            {isIndexing ? (
              <Button variant="pixel-outline" size="sm" disabled>
                <Spinner data-icon="inline-start" className="size-3.5" />
                Indexing
              </Button>
            ) : (
              <Button
                variant={isReady ? "pixel" : isFailed ? "pixel-danger" : "pixel-outline"}
                size="sm"
                onClick={handlePrimary}
                disabled={pending}
                aria-label={`${actionLabel} ${repo.fullName}`}
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
                {actionLabel}
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
      <div className="border-2 border-rule-strong bg-card shadow-pixel-sm">
        <div className="p-4">
          <Skeleton className="h-3 w-20 rounded-none" />
          <Skeleton className="mt-2 h-6 w-44 rounded-none" />
          <Skeleton className="mt-3 h-3 w-full rounded-none" />
          <Skeleton className="mt-1.5 h-3 w-2/3 rounded-none" />
        </div>
        <div className="grid grid-cols-3 divide-x divide-rule border-t-2 border-rule">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-3 py-2">
              <Skeleton className="h-2.5 w-12 rounded-none" />
              <Skeleton className="mt-1.5 h-3 w-14 rounded-none" />
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t-2 border-rule px-3 py-2.5">
          <Skeleton className="h-7 w-20 rounded-none" />
        </div>
      </div>
    </li>
  );
}
