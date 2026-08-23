"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LanguageMark } from "@/components/dashboard/language-mark";
import {
  indexStatusLabel,
  StatusGlyph,
  StatusMark,
} from "@/components/dashboard/status-mark";
import { Data, Micro } from "@/components/layout/listing";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepos } from "@/hooks/use-repos";
import type { IndexStatus } from "@/lib/api";
import { ago, agoShort, num } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The overview is a ledger, not a card wall: four figures in a mono row, then
 * the two lists that actually answer "what can I ask right now" and "what is
 * still cooking". No sparklines — there is no time series behind them.
 */
const ORDER: IndexStatus[] = ["READY", "INDEXING", "PENDING", "FAILED"];

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
    <div className="border-l-2 border-rule pl-3">
      <Micro>{label}</Micro>
      <p
        className={cn(
          "data-mono mt-0.5 text-2xl leading-none font-semibold tracking-tight",
          tone === "live" && "text-live",
          tone === "work" && "text-work",
          tone === "fault" && "text-fault",
          !tone && "text-ink"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[0.6875rem] leading-4 text-ink-faint">{hint}</p>
    </div>
  );
}

export function OverviewDashboard() {
  const reposQuery = useRepos();
  const repos = reposQuery.data ?? [];

  const count = (status: IndexStatus) =>
    repos.filter((repo) => repo.indexStatus === status).length;

  const readyCount = count("READY");
  const indexingCount = count("INDEXING");
  const failedCount = count("FAILED");
  const totalChunks = repos.reduce((sum, repo) => sum + repo.chunkCount, 0);

  const recentRepos = [...repos]
    .sort((a, b) => {
      const aTime = a.indexedAt ? new Date(a.indexedAt).getTime() : 0;
      const bTime = b.indexedAt ? new Date(b.indexedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-[80rem] flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="border-b border-rule pb-3">
        <h1 className="font-mono text-lg leading-tight font-semibold tracking-tight">
          Overview
        </h1>
        <Data className="mt-0.5 block">
          the state of your queryable corpus
        </Data>
      </div>

      <section aria-label="Workspace figures">
        {reposQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Figure
              label="repositories"
              value={num(repos.length)}
              hint="connected from github"
            />
            <Figure
              label="queryable"
              value={num(readyCount)}
              hint={
                indexingCount > 0
                  ? `${num(indexingCount)} still indexing`
                  : "indexes fully built"
              }
              tone={readyCount > 0 ? "live" : undefined}
            />
            <Figure
              label="chunks embedded"
              value={num(totalChunks)}
              hint="retrievable code segments"
            />
            <Figure
              label="failed"
              value={num(failedCount)}
              hint={failedCount > 0 ? "needs a retry" : "nothing broken"}
              tone={failedCount > 0 ? "fault" : undefined}
            />
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section>
          <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-2">
            <h2 className="font-mono text-sm font-semibold tracking-tight">
              Most recently indexed
            </h2>
            <Link
              href="/dashboard"
              className="label-mono inline-flex items-center gap-1 text-live hover:underline"
            >
              all repositories
              <ArrowRight aria-hidden className="size-3" />
            </Link>
          </div>

          {reposQuery.isLoading ? (
            <div className="mt-2 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded-[3px]" />
              ))}
            </div>
          ) : recentRepos.length > 0 ? (
            <ul>
              {recentRepos.map((repo) => (
                <li key={repo.id} className="border-b border-rule last:border-b-0">
                  <Link
                    href={
                      repo.indexStatus === "READY"
                        ? `/chat/${repo.id}`
                        : "/dashboard"
                    }
                    className="grid items-center gap-x-3 gap-y-1 px-1 py-2.5 transition-colors hover:bg-accent/60 sm:grid-cols-[minmax(0,1fr)_7rem_5rem_5.5rem]"
                  >
                    <span className="min-w-0 font-mono text-[0.8125rem] leading-tight tracking-tight">
                      <span className="text-ink-faint">{repo.owner}/</span>
                      <span className="font-semibold">{repo.name}</span>
                    </span>
                    <LanguageMark language={repo.language} />
                    <Data className="tabular sm:text-right">
                      {repo.chunkCount > 0 ? num(repo.chunkCount) : "—"}
                    </Data>
                    <Data
                      className="text-ink-faint"
                      title={ago(repo.indexedAt) ?? "never indexed"}
                    >
                      {agoShort(repo.indexedAt) ?? "never"}
                    </Data>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              Nothing indexed yet.{" "}
              <Link href="/dashboard" className="text-live hover:underline">
                Sync your repositories
              </Link>{" "}
              to get started.
            </p>
          )}
        </section>

        <section>
          <h2 className="border-b border-rule pb-2 font-mono text-sm font-semibold tracking-tight">
            Index states
          </h2>
          {reposQuery.isLoading ? (
            <div className="mt-2 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 rounded-[3px]" />
              ))}
            </div>
          ) : (
            <ul>
              {ORDER.map((status) => {
                const value = count(status);
                return (
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
                        value === 0 && "text-ink-faint"
                      )}
                    >
                      {num(value)}
                    </Data>
                  </li>
                );
              })}
            </ul>
          )}

          {failedCount > 0 && (
            <p className="mt-3 border-l-2 border-fault bg-fault-tint/60 px-3 py-2 text-[0.6875rem] leading-4 text-ink">
              {num(failedCount)} repository
              {failedCount === 1 ? "" : "s"} failed to index.{" "}
              <Link href="/dashboard" className="text-fault underline">
                Review and retry
              </Link>
              .
            </p>
          )}

          {indexingCount > 0 && (
            <div className="mt-3">
              <Micro className="mb-1.5 block">in flight</Micro>
              <ul className="space-y-1.5">
                {repos
                  .filter((repo) => repo.indexStatus === "INDEXING")
                  .map((repo) => (
                    <li key={repo.id}>
                      <Data className="block truncate text-ink">
                        {repo.fullName}
                      </Data>
                      <StatusMark status="INDEXING" className="mt-0.5" />
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
