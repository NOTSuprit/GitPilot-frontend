"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Lock } from "lucide-react";

import { Data, DataRun } from "@/components/layout/listing";
import { PixelStateBadge } from "@/components/pixel";
import { Button } from "@/components/ui/button";
import type { Repository } from "@/lib/api";
import { num } from "@/lib/format";
import { pixelStateFromIndexStatus } from "@/lib/pixel-state";

/**
 * Which repository this conversation is about, and what state its index is in.
 * Everything shown is a field of the repository record (merged with the live
 * status poll by the caller) — there are no embedding dimensions, model names,
 * latencies or scores here because none are reported.
 */
export function ChatHeader({ repo }: { repo: Repository }) {
  const filesKnown = repo.filesTotal > 0;

  return (
    <header className="shrink-0 border-b-2 border-rule-strong bg-card px-3 py-2.5 sm:px-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          variant="pixel-outline"
          size="icon-sm"
          nativeButton={false}
          className="shrink-0"
          render={<Link href="/dashboard" aria-label="Back to repositories" />}
        >
          <ArrowLeft />
        </Button>

        <div className="min-w-0">
          <Data className="block truncate">{repo.owner}/</Data>
          <h1
            className="pixel-display flex min-w-0 items-center gap-1.5 truncate text-lg text-foreground"
            title={repo.fullName}
          >
            <span className="truncate">{repo.name}</span>
            {repo.isPrivate && (
              <Lock aria-label="Private repository" className="size-3 shrink-0 text-ink-faint" />
            )}
          </h1>
        </div>

        <PixelStateBadge state={pixelStateFromIndexStatus(repo.indexStatus)} />

        <DataRun
          className="min-w-0"
          items={[
            <Data key="branch" className="truncate" title="default branch">
              {repo.defaultBranch}
            </Data>,
            <Data key="vis">{repo.isPrivate ? "private" : "public"}</Data>,
            repo.language ? <Data key="lang">{repo.language}</Data> : null,
            repo.chunkCount > 0 ? (
              <Data key="chunks" className="tabular">
                {num(repo.chunkCount)} chunks
              </Data>
            ) : null,
            filesKnown ? (
              <Data key="files" className="tabular">
                {num(repo.filesProcessed)}/{num(repo.filesTotal)} files
              </Data>
            ) : null,
          ]}
        />

        {repo.htmlUrl && (
          <Button
            variant="pixel-outline"
            size="sm"
            nativeButton={false}
            className="ml-auto shrink-0"
            render={
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${repo.fullName} on GitHub`}
              />
            }
          >
            <ExternalLink data-icon="inline-start" />
            GitHub
          </Button>
        )}
      </div>
    </header>
  );
}
