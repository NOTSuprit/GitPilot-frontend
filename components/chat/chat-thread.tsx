"use client";

import { useEffect, useRef } from "react";

import { AnswerProse } from "@/components/chat/answer-prose";
import {
  CitationDisclosure,
  CitationGutter,
} from "@/components/chat/citation-gutter";
import {
  PixelBadge,
  PixelEmptyState,
  PixelGlyph,
  PixelStateBadge,
} from "@/components/pixel";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Repository } from "@/lib/api";
import { clockTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The thread is a two-column listing: a margin on the left carrying who spoke,
 * when, and — for answers — the sources that answer was built from; the
 * message itself in the measure on the right. Below `lg` the margin collapses:
 * the speaker sits above the message and the sources become a disclosure under
 * the answer, so the conversation keeps the width.
 */
const TURN =
  "lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] border-b border-rule lg:border-b-0";
const GUTTER =
  "pt-4 pb-2 lg:border-r-2 lg:border-rule lg:pt-5 lg:pr-4 lg:pb-7";
const BODY = "min-w-0 pb-4 lg:pt-5 lg:pb-7 lg:pl-5";

// Prompts to try. Clicking one puts it in the composer; nothing is sent.
const EXAMPLES = [
  "Where is authentication handled?",
  "How does repository indexing work?",
  "Which classes interact with the database layer?",
  "Where is the GitHub API called?",
];

function TurnHead({
  who,
  at,
  assistant,
}: {
  who: string;
  at?: string | null;
  assistant?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={cn("pixel-label", assistant ? "text-vector" : "text-ink")}
      >
        {who}
      </span>
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
                <Skeleton className="h-3 w-20 rounded-none" />
              </div>
              <div className={cn(BODY, "space-y-2")}>
                <Skeleton className="h-3.5 w-3/4 rounded-none" />
                <Skeleton className="h-3.5 w-full rounded-none" />
                <Skeleton className="h-3.5 w-2/3 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const empty = messages.length === 0 && !streamText && !streaming;
  // Generation was stopped part-way: partial text is still on screen but
  // nothing is arriving any more.
  const stopped = !streaming && Boolean(streamText);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4">
        {empty && (
          <div className="py-8 lg:py-12">
            <PixelEmptyState
              title={`${repo.name} is ready to query`}
              description="Ask in plain language. Each answer is written from chunks retrieved out of this repository, and the sources it used are listed beside it with a link to those lines on GitHub."
            >
              <p className="pixel-label w-full text-ink-faint">try asking</p>
              <ul className="grid w-full max-w-xl gap-2 text-left">
                {EXAMPLES.map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      onClick={() => onPickExample?.(question)}
                      className="data-mono flex w-full items-start gap-2 border-2 border-rule-strong bg-card px-3 py-2 text-left text-xs text-ink-soft shadow-pixel-sm transition-colors hover:border-retrieve hover:bg-retrieve-tint hover:text-ink"
                    >
                      <span aria-hidden className="text-live">
                        &gt;
                      </span>
                      <span className="min-w-0">{question}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </PixelEmptyState>
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
                  <p className="data-mono flex gap-2 border-2 border-rule-strong bg-paper-sunken px-3 py-2 text-[0.8125rem] leading-relaxed break-words whitespace-pre-wrap text-ink">
                    <span aria-hidden className="shrink-0 text-live">
                      &gt;
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
                <TurnHead who="gitpilot" at={at} assistant />
                <div className="mt-2.5 hidden lg:block">
                  {citations.length > 0 ? (
                    <>
                      <span className="label-mono mb-1.5 block text-retrieve">
                        sources · {citations.length}
                      </span>
                      <CitationGutter repo={repo} citations={citations} />
                    </>
                  ) : (
                    <span className="data-mono text-[0.6875rem] leading-4 text-ink-faint">
                      no sources were returned for this answer
                    </span>
                  )}
                </div>
              </div>
              <div className={BODY}>
                <div className="border-2 border-rule bg-card px-4 py-3 shadow-pixel-sm">
                  <AnswerProse content={message.content} />
                </div>
                <div className="lg:hidden">
                  <CitationDisclosure repo={repo} citations={citations} />
                </div>
              </div>
            </article>
          );
        })}

        {(streamText || streaming) && (
          <article className={TURN} aria-live="polite" aria-atomic="false">
            <div className={GUTTER}>
              <TurnHead who="gitpilot" assistant />
              <div className="mt-2.5">
                {stopped ? (
                  <PixelBadge tone="neutral">stopped</PixelBadge>
                ) : streamText ? (
                  <PixelStateBadge state="streaming" />
                ) : (
                  // No SSE event says retrieval is happening, so this claims
                  // only what is known: the question was sent and no token
                  // has come back yet.
                  <PixelBadge tone="neutral">
                    <PixelGlyph shape="dots" busy className="size-3.5" />
                    waiting for response
                  </PixelBadge>
                )}
              </div>
            </div>
            <div className={BODY}>
              <div
                className={cn(
                  "border-2 bg-card px-4 py-3",
                  stopped ? "border-dashed border-rule-strong" : "border-vector"
                )}
              >
                {streamText ? (
                  <>
                    <AnswerProse content={streamText} />
                    {streaming && (
                      <span aria-hidden className="caret-live inline-block" />
                    )}
                  </>
                ) : (
                  <p className="data-mono text-xs text-ink-faint">
                    waiting for the first token
                    <span aria-hidden className="caret-live inline-block" />
                  </p>
                )}
                {stopped && (
                  <p className="data-mono mt-2 border-t-2 border-rule pt-2 text-[0.6875rem] text-ink-faint">
                    Stopped before the answer finished. No sources were
                    received for it.
                  </p>
                )}
              </div>
            </div>
          </article>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
