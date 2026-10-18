"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatThread } from "@/components/chat/chat-thread";
import { IndexingGate } from "@/components/chat/indexing-gate";
import { SessionRail } from "@/components/chat/session-rail";
import { AccountMenu } from "@/components/layout/account-menu";
import { BrandMark } from "@/components/layout/app-shell";
import { PixelEmptyState } from "@/components/pixel";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatMessages,
  useChatSessions,
  useCreateChatSession,
  useStreamChat,
} from "@/hooks/use-chat";
import { useIndexStatus, useRepository } from "@/hooks/use-repos";

function ChatChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b-2 border-rule-strong bg-background px-3">
        <Link href="/dashboard" className="rounded-[3px]" aria-label="GitPilot — repositories">
          <BrandMark />
        </Link>
        <span aria-hidden className="pixel-label mx-0.5 text-rule-strong">
          /
        </span>
        <span className="pixel-label text-ink">chat</span>
        <div className="ml-auto flex items-center gap-1.5">
          <ModeToggle />
          <AccountMenu shape="bar" />
        </div>
      </header>
      {children}
    </div>
  );
}

export function ChatView({ repoId }: { repoId: string }) {
  const repoQuery = useRepository(repoId);
  const isIndexing = repoQuery.data?.indexStatus === "INDEXING";
  const statusQuery = useIndexStatus(
    repoId,
    isIndexing || repoQuery.data?.indexStatus === "PENDING"
  );

  // The repository record wins on READY. `statusQuery` is disabled once the
  // repo reports READY, but a response cached from an earlier INDEXING visit
  // survives in the query cache — reading it back would gate a fully indexed
  // repository behind the indexing screen with a frozen progress bar.
  const indexStatus =
    repoQuery.data?.indexStatus === "READY"
      ? "READY"
      : (statusQuery.data?.indexStatus ?? repoQuery.data?.indexStatus);
  const ready = indexStatus === "READY";

  const sessionsQuery = useChatSessions(repoId, ready);
  const createSession = useCreateChatSession(repoId);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const autoCreateRef = useRef(false);

  const sessionId = selectedSessionId ?? sessionsQuery.data?.[0]?.id ?? null;

  const messagesQuery = useChatMessages(sessionId);
  const { send, stop, streaming, streamText } = useStreamChat(sessionId);
  const [draft, setDraft] = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Picking an example only fills the composer — nothing is sent — and puts
  // the cursor there so Enter sends it.
  const pickExample = useCallback((question: string) => {
    setDraft(question);
    composerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!ready || sessionsQuery.isLoading) return;
    if (sessionsQuery.data && sessionsQuery.data.length > 0) return;
    if (
      !sessionsQuery.isSuccess ||
      (sessionsQuery.data?.length ?? 0) > 0 ||
      autoCreateRef.current
    ) {
      return;
    }

    autoCreateRef.current = true;
    createSession.mutate(undefined, {
      onSuccess: (session) => setSelectedSessionId(session.id),
      onError: () => {
        autoCreateRef.current = false;
      },
    });
  }, [
    ready,
    sessionsQuery.isLoading,
    sessionsQuery.isSuccess,
    sessionsQuery.data,
    createSession,
  ]);

  if (repoQuery.isLoading) {
    return (
      <ChatChrome>
        <div className="flex flex-1 flex-col md:flex-row">
          <div className="w-full shrink-0 border-b-2 border-rule-strong p-3 md:w-64 md:border-r-2 md:border-b-0 lg:w-72">
            <Skeleton className="h-3.5 w-40 rounded-none" />
            <Skeleton className="mt-2 h-3 w-24 rounded-none" />
          </div>
          <div className="flex-1 space-y-3 p-5">
            <Skeleton className="h-6 w-1/3 rounded-none" />
            <Skeleton className="h-3.5 w-2/3 rounded-none" />
            <Skeleton className="h-3.5 w-full rounded-none" />
            <Skeleton className="h-3.5 w-1/2 rounded-none" />
          </div>
        </div>
      </ChatChrome>
    );
  }

  if (repoQuery.isError || !repoQuery.data) {
    return (
      <ChatChrome>
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
          <PixelEmptyState
            as="h1"
            tone="fault"
            title="Repository unavailable"
            description={
              <span className="data-mono break-words">
                {(repoQuery.error as Error)?.message ?? "Repository not found"}
              </span>
            }
          >
            <Button
              variant="pixel-outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Back to repositories
            </Button>
          </PixelEmptyState>
        </div>
      </ChatChrome>
    );
  }

  const repo = repoQuery.data;
  const railRepo = {
    ...repo,
    indexStatus: indexStatus ?? repo.indexStatus,
    filesProcessed: statusQuery.data?.filesProcessed ?? repo.filesProcessed,
    filesTotal: statusQuery.data?.filesTotal ?? repo.filesTotal,
    chunkCount: statusQuery.data?.chunkCount ?? repo.chunkCount,
    errorMessage: statusQuery.data?.errorMessage ?? repo.errorMessage,
  };

  return (
    <ChatChrome>
      <div className="flex min-h-0 flex-1 flex-col md:h-[calc(100svh-3rem)] md:flex-row">
        <SessionRail
          repo={railRepo}
          sessionId={sessionId}
          onSelectSession={setSelectedSessionId}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ChatHeader repo={railRepo} />
          {!ready ? (
            <IndexingGate repo={repo} status={statusQuery.data} />
          ) : (
            <>
              <ChatThread
                repo={repo}
                messages={messagesQuery.data ?? []}
                streamText={streamText}
                streaming={streaming}
                isLoading={messagesQuery.isLoading}
                onPickExample={pickExample}
              />
              <ChatComposer
                value={draft}
                onValueChange={setDraft}
                disabled={!sessionId}
                streaming={streaming}
                onSend={send}
                onStop={stop}
                textareaRef={composerRef}
              />
            </>
          )}
        </section>
      </div>
    </ChatChrome>
  );
}
