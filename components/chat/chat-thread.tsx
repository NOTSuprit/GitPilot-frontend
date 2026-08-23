"use client";

import { useEffect, useRef } from "react";

import { AnswerProse } from "@/components/chat/answer-prose";
import { CitationGutter, CitationRow } from "@/components/chat/citation-gutter";
import { Micro } from "@/components/layout/listing";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Repository } from "@/lib/api";
import { clockTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The thread is a two-column listing: a monospace margin on the left carrying
 * who spoke, when, and — for answers — which chunks of the repository were
 * retrieved; the answer itself in the measure on the right. A single hairline
 * runs the full height of the conversation because every turn's gutter cell
 * carries the same right border and the rows have no vertical gaps.
 */
const TURN =
  "lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] border-b border-rule lg:border-b-0";
const GUTTER = "pt-4 pb-2 lg:border-r lg:border-rule lg:pt-5 lg:pr-4 lg:pb-7";
const BODY = "pb-4 lg:pt-5 lg:pb-7 lg:pl-5";

const EXAMPLES = [
  "Where is authentication handled?",
  "Walk me through the indexing pipeline.",
  "Which modules depend on the database layer?",
];

function TurnHead({
  who,
  at,
  tone,
}: {
  who: string;
  at?: string | null;
  tone?: "live";
}) {
  return (
    <div className="flex items-baseline gap-2">
      <Micro className={tone === "live" ? "text-live" : "text-ink"}>{who}</Micro>
      {at && <span className="data-mono text-[0.625rem] text-ink-faint">{at}</span>}
    </div>
  );
}

export function ChatThread({
  repo,
  messages,
  streamText,
  streaming,
  isLoading,
  onPickExample,
}: {
  repo: Repository;
  messages: ChatMessage[];
  streamText?: string;
  streaming?: boolean;
  isLoading?: boolean;
  onPickExample?: (question: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, streamText]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4">
          {[0, 1].map((i) => (
            <div key={i} className={TURN}>
              <div className={GUTTER}>
                <Skeleton className="h-3 w-20 rounded-[3px]" />
              </div>
              <div className={cn(BODY, "space-y-2")}>
                <Skeleton className="h-3.5 w-3/4 rounded-[3px]" />
                <Skeleton className="h-3.5 w-full rounded-[3px]" />
                <Skeleton className="h-3.5 w-2/3 rounded-[3px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const empty = messages.length === 0 && !streamText;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4">
        {empty && (
          <div className={TURN}>
            <div className={GUTTER}>
              <Micro className="text-ink-faint">no turns yet</Micro>
            </div>
            <div className={BODY}>
              <h2 className="font-mono text-sm font-semibold tracking-tight">
                {repo.fullName} is indexed and queryable
              </h2>
              <p className="mt-1.5 max-w-prose text-xs leading-relaxed text-ink-soft">
                Ask in plain language. Every answer is assembled from chunks
                retrieved out of this repository, and each chunk it used is
                listed in the margin with a link to those exact lines on GitHub.
              </p>
              <ul className="mt-3 flex flex-col items-start gap-1">
                {EXAMPLES.map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() => onPickExample?.(question)}
                      className="data-mono rounded-[3px] border border-rule px-2 py-1 text-left text-xs text-ink-soft transition-colors hover:border-rule-strong hover:bg-accent hover:text-ink"
                    >
                      <span aria-hidden className="mr-1.5 text-ink-faint">
                        ›
                      </span>
                      {question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "USER";
          const at = clockTime(message.createdAt);

          if (isUser) {
            return (
              <article key={message.id} className={TURN}>
                <div className={GUTTER}>
                  <TurnHead who="you" at={at} />
                </div>
                <div className={BODY}>
                  <p className="data-mono flex gap-2 rounded-md border border-rule bg-muted/50 px-3 py-2 text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-ink">
                    <span aria-hidden className="shrink-0 text-ink-faint">
                      ›
                    </span>
                    <span className="min-w-0">{message.content}</span>
                  </p>
                </div>
              </article>
            );
          }

          const citations = message.citations ?? [];

          return (
            <article key={message.id} className={TURN}>
              <div className={GUTTER}>
                <TurnHead who="devpilot" at={at} />
                <div className="mt-2.5 hidden lg:block">
                  {citations.length > 0 ? (
                    <>
                      <Micro className="mb-1 block text-ink-faint">
                        sources · {citations.length}
                      </Micro>
                      <CitationGutter repo={repo} citations={citations} />
                    </>
                  ) : (
                    <Micro className="text-ink-faint">no sources returned</Micro>
                  )}
                </div>
              </div>
              <div className={BODY}>
                <AnswerProse content={message.content} />
                <div className="lg:hidden">
                  <CitationRow repo={repo} citations={citations} />
                </div>
              </div>
            </article>
          );
        })}

        {(streamText || streaming) && (
          <article className={TURN} aria-live="polite" aria-atomic="false">
            <div className={GUTTER}>
              <TurnHead who="devpilot" tone="live" />
              <Micro className="mt-2.5 block text-live">
                {streamText ? "answering" : "retrieving"}
              </Micro>
            </div>
            <div className={BODY}>
              {streamText ? (
                <>
                  <AnswerProse content={streamText} />
                  <span aria-hidden className="caret-live inline-block" />
                </>
              ) : (
                <p className="data-mono text-xs text-ink-faint">
                  searching the index
                  <span aria-hidden className="caret-live inline-block" />
                </p>
              )}
            </div>
          </article>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
