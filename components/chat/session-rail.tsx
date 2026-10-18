"use client";

import { useState } from "react";
import { ChevronDown, Plus, RotateCcw } from "lucide-react";

import { Data } from "@/components/layout/listing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useChatSessions, useCreateChatSession } from "@/hooks/use-chat";
import { useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { ago, num } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Sessions as a terminal listing: every conversation against this repository,
 * newest data from the server, the active one marked with a `>` prompt and a
 * 3px marker. Creating and selecting sessions go through the same hooks and
 * cache keys as before. The only session actions are the ones the backend
 * supports — list, create, open — so there is no rename or delete here.
 *
 * Below `md` the rail is one compact row (sessions toggle, New chat, re-index)
 * and the list unfolds on demand, leaving the screen to the conversation.
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
  const listId = "session-list";

  return (
    <aside className="flex w-full shrink-0 flex-col border-b-2 border-rule-strong bg-sidebar md:w-64 md:border-r-2 md:border-b-0 lg:w-72">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="pixel-label hidden text-ink-faint md:inline">
          sessions
        </span>
        <button
          type="button"
          onClick={() => setOpenOnMobile((v) => !v)}
          aria-expanded={openOnMobile}
          aria-controls={listId}
          className="label-mono flex shrink-0 items-center gap-1 px-1.5 py-1 text-ink-soft hover:bg-accent hover:text-ink md:hidden"
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
        {sessions.length > 0 && (
          <Data className="tabular hidden text-[0.625rem] md:inline">
            {num(sessions.length)}
          </Data>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            size="sm"
            variant="pixel"
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
            size="icon-sm"
            variant="pixel-outline"
            disabled={reindex.isPending || repo.indexStatus === "INDEXING"}
            onClick={() => reindex.mutate(repo.id)}
            aria-label="Re-index repository"
            title="Re-index this repository"
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      <div
        id={listId}
        className={cn(
          "border-t-2 border-rule md:flex md:min-h-0 md:flex-1 md:flex-col",
          openOnMobile ? "flex max-h-64 flex-col" : "hidden"
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto py-1.5">
          {!ready && (
            <p className="px-3 py-1.5 text-xs leading-relaxed text-ink-faint">
              Sessions unlock once the index is built.
            </p>
          )}

          {ready &&
            sessionsQuery.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-3 py-2">
                <Skeleton className="h-3 w-32 rounded-none" />
                <Skeleton className="mt-1.5 h-2.5 w-16 rounded-none" />
              </div>
            ))}

          {ready && sessionsQuery.isError && (
            <p role="alert" className="px-3 py-1.5 text-xs leading-relaxed text-fault">
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
                      "relative flex w-full items-start gap-2 px-3 py-2 text-left transition-colors",
                      "before:absolute before:inset-y-0 before:left-0 before:w-[3px]",
                      active
                        ? "bg-paper-field before:bg-live"
                        : "before:bg-transparent hover:bg-accent"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "data-mono mt-px text-xs",
                        active ? "text-live" : "text-ink-faint"
                      )}
                    >
                      &gt;
                    </span>
                    <span className="min-w-0 flex-1">
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
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {ready && sessionsQuery.isSuccess && sessions.length === 0 && (
            <p className="px-3 py-1.5 text-xs leading-relaxed text-ink-faint">
              No sessions yet. Starting one is the first question you ask.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
