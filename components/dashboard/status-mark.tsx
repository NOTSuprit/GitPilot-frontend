import { PixelGlyph } from "@/components/pixel/pixel-glyph";
import type { IndexStatus } from "@/lib/api";
import {
  pixelStateFromIndexStatus,
  pixelStates,
  pixelToneClass,
} from "@/lib/pixel-state";
import { cn } from "@/lib/utils";

/**
 * Index status as a pixel glyph + a text label. The glyph's shape differs per
 * state (hollow, half-filled, check, cross) so the status never depends on hue
 * alone. The definitions live in `lib/pixel-state.ts`; this module keeps the
 * names the rest of the app already imports.
 *
 *   READY     check       `live`   the corpus answers questions
 *   INDEXING  half block  `work`   pulses while work is in flight
 *   PENDING   hollow      neutral  nothing has been built yet
 *   FAILED    cross       `fault`
 */

export const indexStatusLabel: Record<IndexStatus, string> = {
  PENDING: pixelStates.pending.label,
  INDEXING: pixelStates.indexing.label,
  READY: pixelStates.ready.label,
  FAILED: pixelStates.failed.label,
};

export const indexStatusHint: Record<IndexStatus, string> = {
  PENDING: pixelStates.pending.hint,
  INDEXING: pixelStates.indexing.hint,
  READY: pixelStates.ready.hint,
  FAILED: "Indexing did not complete",
};

function configFor(status: IndexStatus) {
  const cfg = pixelStates[pixelStateFromIndexStatus(status)];
  return { cfg, tone: pixelToneClass[cfg.tone].text };
}

export function StatusGlyph({
  status,
  className,
}: {
  status: IndexStatus;
  className?: string;
}) {
  const { cfg, tone } = configFor(status);
  return (
    <PixelGlyph
      shape={cfg.shape}
      busy={cfg.busy}
      className={cn("size-3.5", tone, className)}
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
  const { cfg, tone } = configFor(status);
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", tone, className)}
      title={indexStatusHint[status]}
    >
      <PixelGlyph shape={cfg.shape} busy={cfg.busy} className="size-3.5" />
      {showLabel ? (
        <span className="label-mono text-current">{indexStatusLabel[status]}</span>
      ) : (
        <span className="sr-only">{indexStatusLabel[status]}</span>
      )}
    </span>
  );
}

export function statusTone(status: IndexStatus) {
  return configFor(status).tone;
}
