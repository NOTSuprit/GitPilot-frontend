"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Lock, Plus, RotateCcw } from "lucide-react";

import { StatusMark } from "@/components/dashboard/status-mark";
import { Data, DataRun, Micro } from "@/components/layout/listing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useChatSessions, useCreateChatSession } from "@/hooks/use-chat";
import { useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { ago, num } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The rail is the spine of the listing: which repository you are querying, what
 * state its index is in, and every conversation you have had against it. The
 * active session is marked with the same 2px `live` bar the nav and the
 * citation gutter use.
 */
export function SessionRail({
  repo,
  sessionId,
  onSelectSession,
}: {
  repo: Repository;
  sessionId: string | null;
  onSelectSession: (id: string) => void;
}) {
  const ready = repo.indexStatus === "READY";
  const sessionsQuery = useChatSessions(repo.id, ready);
  const createSession = useCreateChatSession(repo.id);
  const reindex = useStartIndexing();
  const [openOnMobile, setOpenOnMobile] = useState(false);

  const sessions = sessionsQuery.data ?? [];

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-rule bg-sidebar/40 md:w-64 md:border-r md:border-b-0 lg:w-72">
      <div className="flex items-start gap-2 px-3 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          className="mt-0.5 shrink-0 text-ink-soft hover:text-ink"
          render={<Link href="/dashboard" aria-label="Back to repositories" />}
        >
          <ArrowLeft />
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="flex min-w-0 flex-wrap items-baseline gap-x-1 font-mono text-sm leading-tight tracking-tight">
            <span className="text-ink-faint">{repo.owner}/</span>
            <span className="truncate font-semibold">{repo.name}</span>
            {repo.isPrivate && (
              <Lock aria-label="Private repository" className="size-3 text-ink-faint" />
            )}
          </h1>
          <div className="mt-1.5">
            <StatusMark status={repo.indexStatus} />
          </div>
          <DataRun
            className="mt-1.5"
            items={[
              <Data key="branch" className="truncate">
                {repo.defaultBranch}
              </Data>,
              repo.chunkCount > 0 ? (
                <Data key="chunks">{num(repo.chunkCount)} chunks</Data>
              ) : null,
            ]}
          />
        </div>

        <button
          type="button"
          onClick={() => setOpenOnMobile((v) => !v)}
          aria-expanded={openOnMobile}
          className="label-mono mt-0.5 flex shrink-0 items-center gap-1 rounded-[3px] px-1.5 py-1 text-ink-soft hover:bg-accent hover:text-ink md:hidden"
        >
          sessions
          <span className="tabular">{sessions.length || ""}</span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-3 transition-transform",
              openOnMobile && "rotate-180"
            )}
          />
        </button>
      </div>

      <div className={cn("md:flex md:min-h-0 md:flex-1 md:flex-col", openOnMobile ? "flex flex-col" : "hidden")}>
        <div className="flex gap-1.5 border-t border-rule px-3 py-2.5">
          <Button
            size="sm"
            className="flex-1"
            disabled={!ready || createSession.isPending}
            onClick={() =>
              createSession.mutate("New chat", {
                onSuccess: (session) => onSelectSession(session.id),
              })
            }
          >
            {createSession.isPending ? (
              <Spinner data-icon="inline-start" className="size-3.5" />
            ) : (
              <Plus data-icon="inline-start" />
            )}
            New chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={reindex.isPending || repo.indexStatus === "INDEXING"}
            onClick={() => reindex.mutate(repo.id)}
            aria-label="Re-index repository"
            title="Re-index this repository"
          >
            <RotateCcw />
          </Button>
        </div>

        <div className="flex items-baseline justify-between border-t border-rule px-3 py-2">
          <Micro>sessions</Micro>
          {sessions.length > 0 && (
            <Data className="tabular text-[0.625rem]">{num(sessions.length)}</Data>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-3">
          {!ready && (
            <p className="px-3 text-xs leading-relaxed text-ink-faint">
              Sessions unlock once the index is built.
            </p>
          )}

          {ready &&
            sessionsQuery.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-3 py-2">
                <Skeleton className="h-3 w-32 rounded-[3px]" />
                <Skeleton className="mt-1.5 h-2.5 w-16 rounded-[3px]" />
              </div>
            ))}

          {ready && sessionsQuery.isError && (
            <p className="px-3 text-xs leading-relaxed text-fault">
              Couldn’t load sessions.
            </p>
          )}

          <ul>
            {sessions.map((session) => {
              const active = sessionId === session.id;
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "relative w-full px-3 py-2 text-left transition-colors",
                      "before:absolute before:inset-y-1 before:left-0 before:w-[2px] before:rounded-full",
                      active
                        ? "bg-accent before:bg-live"
                        : "before:bg-transparent hover:bg-accent/60"
                    )}
                  >
                    <span
                      className={cn(
                        "block truncate font-mono text-xs leading-tight tracking-tight",
                        active ? "font-semibold text-ink" : "text-ink-soft"
                      )}
                    >
                      {session.title}
                    </span>
                    <span className="data-mono mt-0.5 block text-[0.625rem] text-ink-faint">
                      {ago(session.createdAt) ?? "just now"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {ready && sessionsQuery.isSuccess && sessions.length === 0 && (
            <p className="px-3 text-xs leading-relaxed text-ink-faint">
              No sessions yet. Starting one is the first question you ask.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
