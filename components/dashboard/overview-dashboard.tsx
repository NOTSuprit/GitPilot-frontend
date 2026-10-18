"use client";

import Link from "next/link";
import { ArrowRight, MessageSquareCode, RefreshCw } from "lucide-react";

import { IndexError } from "@/components/dashboard/index-error";
import { IndexProgress } from "@/components/dashboard/index-progress";
import { LanguageMark } from "@/components/dashboard/language-mark";
import {
  indexStatusLabel,
  StatusGlyph,
  StatusMark,
} from "@/components/dashboard/status-mark";
import { Data, Micro } from "@/components/layout/listing";
import {
  PixelEmptyState,
  PixelPanel,
  PixelSectionHeader,
} from "@/components/pixel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepos } from "@/hooks/use-repos";
import type { IndexStatus, Repository } from "@/lib/api";
import { ago, agoShort, num } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The overview answers three questions from the repository list alone — what
 * can I ask right now, what is still being built, what broke — so every figure
 * here is a count or a sum over repositories the dashboard already loaded.
 * There is no activity log, no history, no query analytics: the backend serves
 * none of them, and a chart with nothing behind it would be decoration.
 *
 * Indexing runs on the same 2-second poll the dashboard uses, so the in-flight
 * progress below moves without any extra requests.
 */
const ORDER: IndexStatus[] = ["READY", "INDEXING", "PENDING", "FAILED"];

const SEGMENT_FILL: Record<IndexStatus, string> = {
  READY: "bg-live",
  INDEXING: "bg-work",
  PENDING: "bg-ink-faint",
  FAILED: "bg-fault",
};

function Figure({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "live" | "work" | "fault";
}) {
  return (
    <PixelPanel
      tone={tone === "fault" ? "fault" : "default"}
      className="px-4 py-3 shadow-pixel-sm"
    >
      <Micro className="block">{label}</Micro>
      <p
        className={cn(
          "pixel-display tabular mt-1 text-4xl leading-none",
          tone === "live" && "text-live",
          tone === "work" && "text-work",
          tone === "fault" && "text-fault",
          !tone && "text-foreground"
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[0.6875rem] leading-4 text-ink-faint">{hint}</p>
    </PixelPanel>
  );
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PixelPanel className={cn("shadow-pixel-sm", className)}>
      <div className="flex items-baseline justify-between gap-3 border-b-2 border-rule px-4 py-2.5">
        <h2 className="pixel-display text-base text-foreground">{title}</h2>
        {action}
      </div>
      <div className="px-4 py-3">{children}</div>
    </PixelPanel>
  );
}

/**
 * The workspace as one bar: segment widths are the real status counts, so the
 * picture and the numbers cannot disagree. Zero-count states have no segment.
 */
function StateBar({
  counts,
  total,
}: {
  counts: Record<IndexStatus, number>;
  total: number;
}) {
  const summary = ORDER.map(
    (s) => `${counts[s]} ${indexStatusLabel[s].toLowerCase()}`
  ).join(", ");

  return (
    <div
      role="img"
      aria-label={`${total} repositories: ${summary}`}
      className="flex h-3 w-full gap-0.5 border-2 border-rule-strong bg-paper-sunken p-0.5"
    >
      {ORDER.filter((s) => counts[s] > 0).map((s) => (
        <span
          key={s}
          className={cn("h-full min-w-1", SEGMENT_FILL[s])}
          style={{ flexGrow: counts[s], flexBasis: 0 }}
        />
      ))}
    </div>
  );
}

function RecentRow({ repo }: { repo: Repository }) {
  const ready = repo.indexStatus === "READY";
  return (
    <li className="border-b border-rule last:border-b-0">
      <Link
        href={ready ? `/chat/${repo.id}` : "/dashboard"}
        aria-label={`${ready ? "Chat with" : "Open the dashboard for"} ${repo.fullName}`}
        className="group/row grid items-center gap-x-3 gap-y-1 px-1 py-2.5 transition-colors hover:bg-accent sm:grid-cols-[minmax(0,1fr)_6.5rem_4.5rem_6rem_4rem]"
      >
        <span className="min-w-0 font-mono text-[0.8125rem] leading-tight tracking-tight">
          <span className="text-ink-faint">{repo.owner}/</span>
          <span className="font-semibold">{repo.name}</span>
        </span>
        <LanguageMark language={repo.language} />
        <Data className="tabular sm:text-right">
          {repo.chunkCount > 0 ? `${num(repo.chunkCount)} ch` : "—"}
        </Data>
        <StatusMark status={repo.indexStatus} />
        <Data
          className="text-ink-faint sm:text-right"
          title={ago(repo.indexedAt) ?? "never indexed"}
        >
          {agoShort(repo.indexedAt) ?? "never"}
        </Data>
      </Link>
    </li>
  );
}

export function OverviewDashboard() {
  const reposQuery = useRepos();
  const repos = reposQuery.data ?? [];

  const counts: Record<IndexStatus, number> = {
    READY: 0,
    INDEXING: 0,
    PENDING: 0,
    FAILED: 0,
  };
  for (const repo of repos) counts[repo.indexStatus] += 1;

  const totalChunks = repos.reduce((sum, repo) => sum + repo.chunkCount, 0);
  const indexing = repos.filter((r) => r.indexStatus === "INDEXING");
  const failed = repos.filter((r) => r.indexStatus === "FAILED");

  // Only repositories that actually have an indexed-at timestamp: "recently
  // indexed" is a statement about time, so a never-indexed repo has no place.
  const recent = repos
    .filter((r) => r.indexedAt)
    .sort(
      (a, b) =>
        new Date(b.indexedAt as string).getTime() -
        new Date(a.indexedAt as string).getTime()
    )
    .slice(0, 6);

  return (
    <div className="mx-auto flex w-full max-w-[80rem] flex-1 flex-col gap-6 p-4 md:p-6">
      <PixelSectionHeader
        as="h1"
        label="workspace"
        title="Overview"
        description="The state of your queryable corpus, counted from your connected repositories."
        actions={
          <Button
            variant="pixel-outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            All repositories
            <ArrowRight data-icon="inline-end" />
          </Button>
        }
      />

      {reposQuery.isError ? (
        <PixelEmptyState
          tone="fault"
          title="Couldn’t load your repositories"
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
      ) : reposQuery.isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-none" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Skeleton className="h-64 rounded-none" />
            <Skeleton className="h-64 rounded-none" />
          </div>
        </>
      ) : repos.length === 0 ? (
        <PixelEmptyState
          title="No repositories connected yet"
          description="Sync your GitHub repositories from the dashboard, then index one to make it queryable. This page fills in as soon as there is something to count."
        >
          <Button
            variant="pixel"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Go to repositories
            <ArrowRight data-icon="inline-end" />
          </Button>
        </PixelEmptyState>
      ) : (
        <>
          <section
            aria-label="Workspace figures"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <Figure
              label="repositories"
              value={num(repos.length)}
              hint="connected from github"
            />
            <Figure
              label="queryable"
              value={num(counts.READY)}
              hint={
                counts.INDEXING > 0
                  ? `${num(counts.INDEXING)} still indexing`
                  : "indexes fully built"
              }
              tone={counts.READY > 0 ? "live" : undefined}
            />
            <Figure
              label="chunks embedded"
              value={num(totalChunks)}
              hint="summed over your repositories"
            />
            <Figure
              label="failed"
              value={num(counts.FAILED)}
              hint={counts.FAILED > 0 ? "needs a retry" : "nothing broken"}
              tone={counts.FAILED > 0 ? "fault" : undefined}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Panel
              title="Most recently indexed"
              action={
                <Link
                  href="/dashboard"
                  className="label-mono inline-flex items-center gap-1 text-live hover:underline"
                >
                  all repositories
                  <ArrowRight aria-hidden className="size-3" />
                </Link>
              }
            >
              {recent.length > 0 ? (
                <ul>
                  {recent.map((repo) => (
                    <RecentRow key={repo.id} repo={repo} />
                  ))}
                </ul>
              ) : (
                <p className="text-xs leading-relaxed text-ink-soft">
                  Nothing has finished indexing yet.{" "}
                  <Link href="/dashboard" className="text-live underline underline-offset-4">
                    Start an index
                  </Link>{" "}
                  from the repositories page.
                </p>
              )}
              {recent.length > 0 && counts.READY > 0 && (
                <p className="mt-3 flex items-center gap-1.5 border-t-2 border-rule pt-2 text-[0.6875rem] text-ink-faint">
                  <MessageSquareCode aria-hidden className="size-3" />
                  Select a queryable repository to open its chat.
                </p>
              )}
            </Panel>

            <div className="flex flex-col gap-6">
              <Panel title="Index states">
                <StateBar counts={counts} total={repos.length} />
                <ul className="mt-3">
                  {ORDER.map((status) => (
                    <li
                      key={status}
                      className="flex items-center justify-between gap-3 border-b border-rule py-2 last:border-b-0"
                    >
                      <span className="flex items-center gap-2">
                        <StatusGlyph status={status} />
                        <Micro className="text-ink-soft">
                          {indexStatusLabel[status]}
                        </Micro>
                      </span>
                      <Data
                        className={cn(
                          "tabular text-sm",
                          counts[status] === 0 && "text-ink-faint"
                        )}
                      >
                        {num(counts[status])}
                      </Data>
                    </li>
                  ))}
                </ul>
              </Panel>

              {indexing.length > 0 && (
                <Panel title="In flight">
                  <ul className="space-y-4">
                    {indexing.map((repo) => (
                      <li key={repo.id}>
                        <Data className="mb-1.5 block truncate text-ink">
                          {repo.fullName}
                        </Data>
                        <IndexProgress
                          filesProcessed={repo.filesProcessed}
                          filesTotal={repo.filesTotal}
                          chunkCount={repo.chunkCount}
                          label={`Indexing ${repo.fullName}`}
                        />
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {failed.length > 0 && (
                <PixelPanel tone="fault" className="shadow-pixel-sm">
                  <div className="flex items-baseline justify-between gap-3 border-b-2 border-rule px-4 py-2.5">
                    <h2 className="pixel-display text-base text-fault">
                      Needs attention
                    </h2>
                    <Link
                      href="/dashboard"
                      className="label-mono text-fault underline underline-offset-4"
                    >
                      review and retry
                    </Link>
                  </div>
                  <ul className="space-y-3 px-4 py-3">
                    {failed.slice(0, 3).map((repo) => (
                      <li key={repo.id}>
                        <Data className="mb-1.5 block truncate text-ink">
                          {repo.fullName}
                        </Data>
                        <IndexError message={repo.errorMessage} />
                      </li>
                    ))}
                    {failed.length > 3 && (
                      <li className="data-mono text-[0.6875rem] text-ink-faint">
                        + {num(failed.length - 3)} more on the repositories page
                      </li>
                    )}
                  </ul>
                </PixelPanel>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
