"use client";

import { useMemo, useState } from "react";
import { FolderGit2, ListFilter, RefreshCw, TriangleAlert } from "lucide-react";

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
import { Micro } from "@/components/layout/listing";
import { Button } from "@/components/ui/button";
import { useRefreshRepos, useRepos } from "@/hooks/use-repos";
import { cn } from "@/lib/utils";

/** A quiet framed message — the listing's own voice, not a marketing card. */
function Notice({
  icon: Icon,
  title,
  children,
  action,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "neutral" | "fault";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 border-l-2 px-4 py-5",
        tone === "fault"
          ? "border-fault bg-fault-tint/60"
          : "border-rule-strong bg-muted/50"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "size-4",
            tone === "fault" ? "text-fault" : "text-ink-faint"
          )}
        />
        <h2 className="font-mono text-sm font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {children && (
        <p className="max-w-prose text-xs leading-relaxed text-ink-soft">
          {children}
        </p>
      )}
      {action}
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
  const readyCount =
    reposQuery.data?.filter((r) => r.indexStatus === "READY").length ?? 0;
  const filtersActive =
    status !== "ALL" || visibility !== "all" || search.trim() !== "";

  function clearFilters() {
    setSearch("");
    setStatus("ALL");
    setVisibility("all");
  }

  return (
    <div className="mx-auto flex w-full max-w-[92rem] flex-1 flex-col gap-6 p-6 md:p-8">
      <RepoToolbar
        search={search}
        onSearchChange={setSearch}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        status={status}
        onStatusChange={setStatus}
        totalCount={total}
        readyCount={readyCount}
        matchCount={filtered.length}
        onSync={() => refresh.mutate()}
        isSyncing={refresh.isPending || reposQuery.isFetching}
      />

      {reposQuery.isLoading && (
        <ul className={TILE_GRID}>
          {Array.from({ length: 6 }).map((_, i) => (
            <RepoTileSkeleton key={i} />
          ))}
        </ul>
      )}

      {reposQuery.isError && (
        <Notice
          icon={TriangleAlert}
          tone="fault"
          title="Couldn’t load repositories"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void reposQuery.refetch()}
            >
              <RefreshCw data-icon="inline-start" />
              Try again
            </Button>
          }
        >
          <span className="data-mono break-words">
            {(reposQuery.error as Error).message}
          </span>
        </Notice>
      )}

      {reposQuery.isSuccess && filtered.length === 0 && (
        <>
          {total === 0 ? (
            <Notice
              icon={FolderGit2}
              title="No repositories connected yet"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refresh.mutate()}
                  disabled={refresh.isPending}
                >
                  <RefreshCw
                    data-icon="inline-start"
                    className={cn(refresh.isPending && "animate-spin")}
                  />
                  {refresh.isPending ? "Syncing" : "Sync from GitHub"}
                </Button>
              }
            >
              Pull your GitHub repositories in, then index one to make its code
              queryable. Indexing chunks every source file and embeds it, so
              answers can cite exact line ranges.
            </Notice>
          ) : (
            <Notice
              icon={ListFilter}
              title="No repositories match"
              action={
                filtersActive ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            >
              {total} connected, none of them matching the current filters.
            </Notice>
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
          <p className="mt-6 border-t border-rule pt-2">
            <Micro>
              end of listing · {filtered.length}
              {filtered.length === 1 ? " repository" : " repositories"}
            </Micro>
          </p>
        </div>
      )}
    </div>
  );
}
