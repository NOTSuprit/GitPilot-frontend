"use client";

import { useMemo, useState } from "react";
import { ListFilter, RefreshCw } from "lucide-react";

import {
  RepoSummary,
  RepoSummarySkeleton,
} from "@/components/dashboard/repo-summary";
import {
  RepoTile,
  RepoTileSkeleton,
  TILE_GRID,
} from "@/components/dashboard/repo-tile";
import {
  RepoToolbar,
  type StatusFilter,
  type VisibilityFilter,
} from "@/components/dashboard/repo-toolbar";
import {
  PixelEmptyState,
  PixelSectionHeader,
} from "@/components/pixel";
import { Button } from "@/components/ui/button";
import { useRefreshRepos, useRepos } from "@/hooks/use-repos";
import { cn } from "@/lib/utils";

/** An inline fault banner for a failed sync: loud enough to see, not a page. */
function SyncFailed({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-start justify-between gap-3 border-2 border-fault bg-fault-tint px-4 py-3"
    >
      <div className="min-w-0">
        <p className="pixel-label text-fault">sync failed</p>
        <p className="data-mono mt-1 text-xs leading-relaxed break-words text-foreground">
          {message}
        </p>
      </div>
      <Button
        variant="pixel-danger"
        size="sm"
        onClick={onRetry}
        disabled={retrying}
      >
        <RefreshCw
          data-icon="inline-start"
          className={cn(retrying && "animate-spin")}
        />
        Retry sync
      </Button>
    </div>
  );
}

export function RepoDashboard() {
  const reposQuery = useRepos();
  const refresh = useRefreshRepos();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");

  const filtered = useMemo(() => {
    const list = reposQuery.data ?? [];
    const q = search.trim().toLowerCase();

    return list.filter((repo) => {
      if (status !== "ALL" && repo.indexStatus !== status) return false;
      if (visibility === "private" && !repo.isPrivate) return false;
      if (visibility === "public" && repo.isPrivate) return false;
      if (!q) return true;
      return (
        repo.fullName.toLowerCase().includes(q) ||
        (repo.description ?? "").toLowerCase().includes(q) ||
        (repo.language ?? "").toLowerCase().includes(q)
      );
    });
  }, [reposQuery.data, search, status, visibility]);

  const total = reposQuery.data?.length ?? 0;
  const filtersActive =
    status !== "ALL" || visibility !== "all" || search.trim() !== "";
  // Spin and disable only while a sync is actually running. The list also
  // refetches every couple of seconds while something is indexing; that is a
  // poll, not a sync, and must not read as one.
  const syncing = refresh.isPending;
  const syncDisabled = syncing || reposQuery.isLoading;

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setVisibility("all");
  }

  return (
    <div className="mx-auto flex w-full max-w-[92rem] flex-1 flex-col gap-6 p-4 sm:p-6 md:p-8">
      <PixelSectionHeader
        as="h1"
        label="workspace"
        title="Repositories"
        description="Connect a repository, index it into chunks and embeddings, then ask it questions and check the cited sources."
        actions={
          <Button
            variant="pixel-outline"
            size="sm"
            onClick={() => refresh.mutate()}
            disabled={syncDisabled}
          >
            <RefreshCw
              data-icon="inline-start"
              className={cn(syncing && "animate-spin")}
            />
            {syncing ? "Syncing" : "Sync"}
          </Button>
        }
      />

      {refresh.isError && (
        <SyncFailed
          message={
            refresh.error instanceof Error
              ? refresh.error.message
              : "Could not sync repositories."
          }
          onRetry={() => refresh.mutate()}
          retrying={syncing}
        />
      )}

      {reposQuery.isLoading && <RepoSummarySkeleton />}

      {reposQuery.isSuccess && total > 0 && (
        <RepoSummary
          repos={reposQuery.data}
          status={status}
          onStatusChange={setStatus}
        />
      )}

      {reposQuery.isSuccess && total > 0 && (
        <RepoToolbar
          search={search}
          onSearchChange={setSearch}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          status={status}
          onStatusChange={setStatus}
          totalCount={total}
          matchCount={filtered.length}
        />
      )}

      {reposQuery.isLoading && (
        <ul className={TILE_GRID} aria-label="Loading repositories" aria-busy>
          {Array.from({ length: 6 }).map((_, i) => (
            <RepoTileSkeleton key={i} />
          ))}
        </ul>
      )}

      {reposQuery.isError && (
        <PixelEmptyState
          tone="fault"
          title="Couldn’t load repositories"
          description={
            <span className="data-mono break-words">
              {(reposQuery.error as Error).message}
            </span>
          }
        >
          <Button
            variant="pixel-outline"
            size="sm"
            onClick={() => void reposQuery.refetch()}
          >
            <RefreshCw data-icon="inline-start" />
            Try again
          </Button>
        </PixelEmptyState>
      )}

      {reposQuery.isSuccess && filtered.length === 0 && (
        <>
          {total === 0 ? (
            <PixelEmptyState
              title="No repositories connected yet"
              description="Pull your GitHub repositories in, then index one to make its code queryable. Indexing chunks the eligible source files and embeds them, so answers can cite exact line ranges."
            >
              <Button
                variant="pixel"
                size="sm"
                onClick={() => refresh.mutate()}
                disabled={syncing}
              >
                <RefreshCw
                  data-icon="inline-start"
                  className={cn(syncing && "animate-spin")}
                />
                {syncing ? "Syncing" : "Sync from GitHub"}
              </Button>
            </PixelEmptyState>
          ) : (
            <PixelEmptyState
              title="No repositories match"
              description={`${total} connected, none of them matching the current filters.`}
              media={<ListFilter aria-hidden className="size-10" />}
            >
              {filtersActive && (
                <Button variant="pixel-outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </PixelEmptyState>
          )}
        </>
      )}

      {reposQuery.isSuccess && filtered.length > 0 && (
        <div>
          <ul className={TILE_GRID}>
            {filtered.map((repo) => (
              <RepoTile key={repo.id} repo={repo} />
            ))}
          </ul>
          <p className="mt-6 border-t-2 border-rule pt-2">
            <span className="pixel-label text-ink-faint">
              end of listing · {filtered.length}
              {filtered.length === 1 ? " repository" : " repositories"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
