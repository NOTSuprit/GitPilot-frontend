import type { IndexStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Status is a square, never a pill — the whole layout is a rule grid and a
 * pill would be the only round thing on the page.
 *
 *   READY     filled `live`      the corpus answers questions
 *   INDEXING  filled `work`      the only warm hue in the system
 *   PENDING   hollow             nothing has been built yet
 *   FAILED    filled `fault`
 */

export const indexStatusLabel: Record<IndexStatus, string> = {
  PENDING: "New",
  INDEXING: "Indexing",
  READY: "Ready",
  FAILED: "Failed",
};

export const indexStatusHint: Record<IndexStatus, string> = {
  PENDING: "Not indexed yet",
  INDEXING: "Building the vector index",
  READY: "Indexed and queryable",
  FAILED: "Indexing did not complete",
};

const glyph: Record<IndexStatus, string> = {
  READY: "bg-live",
  INDEXING: "bg-work animate-pulse",
  PENDING: "border border-rule-strong",
  FAILED: "bg-fault",
};

const tone: Record<IndexStatus, string> = {
  READY: "text-live",
  INDEXING: "text-work",
  PENDING: "text-ink-faint",
  FAILED: "text-fault",
};

export function StatusGlyph({
  status,
  className,
}: {
  status: IndexStatus;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block size-2 shrink-0 rounded-[1.5px]",
        glyph[status],
        className
      )}
    />
  );
}

export function StatusMark({
  status,
  className,
  showLabel = true,
}: {
  status: IndexStatus;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2", tone[status], className)}
      title={indexStatusHint[status]}
    >
      <StatusGlyph status={status} />
      {showLabel ? (
        <span className="label-mono text-current">{indexStatusLabel[status]}</span>
      ) : (
        <span className="sr-only">{indexStatusLabel[status]}</span>
      )}
    </span>
  );
}

export function statusTone(status: IndexStatus) {
  return tone[status];
}
