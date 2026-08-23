"use client";

import { Play, RotateCcw } from "lucide-react";

import { IndexError } from "@/components/dashboard/index-error";
import { IndexProgress } from "@/components/dashboard/index-progress";
import {
  indexStatusHint,
  indexStatusLabel,
  StatusMark,
} from "@/components/dashboard/status-mark";
import { Micro } from "@/components/layout/listing";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStartIndexing } from "@/hooks/use-repos";
import type { IndexStatusResponse, Repository } from "@/lib/api";

/**
 * Chat is gated on a built index, so this is a real wall rather than a disabled
 * input. It reads out of the same poll the dashboard uses, so a repository that
 * finishes indexing while you sit here unlocks on its own.
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
          <div className="pt-4 pb-2 lg:border-r lg:border-rule lg:pt-5 lg:pr-4 lg:pb-8">
            <Micro className="text-ink-faint">index</Micro>
            <div className="mt-1.5">
              <StatusMark status={indexStatus} />
            </div>
          </div>

          <div className="pb-6 lg:pt-5 lg:pb-8 lg:pl-5">
            <h1 className="font-mono text-sm font-semibold tracking-tight">
              {indexStatus === "FAILED"
                ? `Indexing ${repo.fullName} failed`
                : indexStatus === "INDEXING"
                  ? `Indexing ${repo.fullName}`
                  : `${repo.fullName} has not been indexed yet`}
            </h1>
            <p className="mt-1.5 max-w-prose text-xs leading-relaxed text-ink-soft">
              {indexStatus === "INDEXING"
                ? "Every source file is being chunked and embedded. Chat unlocks the moment the last chunk lands — you can leave this page open, it updates itself."
                : indexStatus === "FAILED"
                  ? "Nothing was left queryable, so there is no corpus to answer from. The server’s reason is below verbatim."
                  : "Answers are assembled from embedded chunks of this repository, so the index has to exist before there is anything to retrieve."}
            </p>

            {indexStatus === "INDEXING" && (
              <div className="mt-4 max-w-md">
                <IndexProgress
                  filesProcessed={filesProcessed}
                  filesTotal={filesTotal}
                  chunkCount={chunkCount}
                />
              </div>
            )}

            {indexStatus === "FAILED" && (
              <div className="mt-4 max-w-2xl">
                <IndexError
                  message={errorMessage}
                  action={
                    <Button
                      variant="outline"
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
              <div className="mt-4">
                <Button
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
              <p className="mt-3 text-xs text-ink-soft">
                {indexStatusLabel.READY} — reload to start asking.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
