"use client";

import Link from "next/link";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";

import { IndexError } from "@/components/dashboard/index-error";
import { IndexingFlow } from "@/components/dashboard/indexing-flow";
import {
  indexStatusHint,
  indexStatusLabel,
} from "@/components/dashboard/status-mark";
import { PixelPanel, PixelStateBadge } from "@/components/pixel";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStartIndexing } from "@/hooks/use-repos";
import type { IndexStatusResponse, Repository } from "@/lib/api";
import { pixelStateFromIndexStatus } from "@/lib/pixel-state";

/**
 * Chat is gated on a built index, so this is a real wall rather than a disabled
 * input. It reads out of the same poll the dashboard uses, so a repository that
 * finishes indexing while you sit here unlocks on its own. It never offers a
 * way to ask a question while the backend says the repository is not READY.
 */
export function IndexingGate({
  repo,
  status,
}: {
  repo: Repository;
  status?: IndexStatusResponse;
}) {
  const startIndexing = useStartIndexing();

  const filesProcessed = status?.filesProcessed ?? repo.filesProcessed;
  const filesTotal = status?.filesTotal ?? repo.filesTotal;
  const chunkCount = status?.chunkCount ?? repo.chunkCount;
  const indexStatus = status?.indexStatus ?? repo.indexStatus;
  const errorMessage = status?.errorMessage ?? repo.errorMessage;

  const pending = startIndexing.isPending;

  const tone =
    indexStatus === "FAILED"
      ? "fault"
      : indexStatus === "INDEXING"
        ? "work"
        : "default";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-12">
        <PixelPanel tone={tone} raised studs className="p-5 sm:p-6">
          <PixelStateBadge state={pixelStateFromIndexStatus(indexStatus)} />

          <h2 className="pixel-display mt-3 text-2xl text-foreground">
            {indexStatus === "FAILED"
              ? `Indexing ${repo.fullName} failed`
              : indexStatus === "INDEXING"
                ? `Indexing ${repo.fullName}`
                : `${repo.fullName} has not been indexed yet`}
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
            {indexStatus === "INDEXING"
              ? "Eligible source files are being chunked and embedded. Chat unlocks when the index is complete — you can leave this page open, it updates itself."
              : indexStatus === "FAILED"
                ? "Nothing was left queryable, so there is no corpus to answer from. The server’s reason is below verbatim."
                : "Answers are assembled from embedded chunks of this repository, so the index has to exist before there is anything to retrieve."}
          </p>

          {indexStatus === "INDEXING" && (
            <div className="mt-5 max-w-md">
              <IndexingFlow
                filesProcessed={filesProcessed}
                filesTotal={filesTotal}
                chunkCount={chunkCount}
                label={`Indexing ${repo.fullName}`}
              />
            </div>
          )}

          {indexStatus === "FAILED" && (
            <div className="mt-5 max-w-2xl">
              <IndexError
                message={errorMessage}
                action={
                  <Button
                    variant="pixel-danger"
                    size="sm"
                    onClick={() => startIndexing.mutate(repo.id)}
                    disabled={pending}
                  >
                    {pending ? (
                      <Spinner data-icon="inline-start" className="size-3.5" />
                    ) : (
                      <RotateCcw data-icon="inline-start" />
                    )}
                    Retry
                  </Button>
                }
              />
            </div>
          )}

          {indexStatus === "PENDING" && (
            <div className="mt-5">
              <Button
                variant="pixel"
                onClick={() => startIndexing.mutate(repo.id)}
                disabled={pending}
              >
                {pending ? (
                  <Spinner data-icon="inline-start" className="size-3.5" />
                ) : (
                  <Play data-icon="inline-start" />
                )}
                {pending ? "Starting" : "Index this repository"}
              </Button>
              <p className="mt-2 text-[0.6875rem] leading-4 text-ink-faint">
                {indexStatusHint.PENDING}
              </p>
            </div>
          )}

          {indexStatus === "READY" && (
            <p className="mt-4 text-sm text-ink-soft">
              {indexStatusLabel.READY} — reload to start asking.
            </p>
          )}

          <div className="mt-6 border-t-2 border-rule pt-4">
            <Button
              variant="pixel-outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              <ArrowLeft data-icon="inline-start" />
              Back to repositories
            </Button>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}
