import type { IndexStatus } from "@/lib/api";

/**
 * Semantic states shared by every pixel component.
 *
 * Each state is communicated three ways — a hue, a glyph shape, and a text
 * label — so none of them relies on color alone.
 */

export type PixelState =
  | "pending"
  | "indexing"
  | "ready"
  | "failed"
  | "retrieving"
  | "streaming"
  | "authenticated"
  | "unauthenticated";

export type PixelTone =
  | "neutral"
  | "live"
  | "work"
  | "fault"
  | "vector"
  | "retrieve";

export type PixelShape =
  | "hollow"
  | "solid"
  | "half"
  | "check"
  | "cross"
  | "diamond"
  | "dots"
  | "dash";

/**
 * Tailwind needs complete class names at build time, so every tone class is
 * spelled out literally here rather than assembled from strings.
 */
export const pixelToneClass: Record<
  PixelTone,
  { text: string; fill: string; tint: string; edge: string }
> = {
  neutral: {
    text: "text-ink-soft",
    fill: "bg-ink-soft",
    tint: "bg-paper-sunken",
    edge: "border-rule-strong",
  },
  live: {
    text: "text-live",
    fill: "bg-live",
    tint: "bg-live-tint",
    edge: "border-live",
  },
  work: {
    text: "text-work",
    fill: "bg-work",
    tint: "bg-work-tint",
    edge: "border-work",
  },
  fault: {
    text: "text-fault",
    fill: "bg-fault",
    tint: "bg-fault-tint",
    edge: "border-fault",
  },
  vector: {
    text: "text-vector",
    fill: "bg-vector",
    tint: "bg-vector-tint",
    edge: "border-vector",
  },
  retrieve: {
    text: "text-retrieve",
    fill: "bg-retrieve",
    tint: "bg-retrieve-tint",
    edge: "border-retrieve",
  },
};

export interface PixelStateConfig {
  label: string;
  hint: string;
  tone: PixelTone;
  shape: PixelShape;
  /** Work is in flight; the glyph pulses (and stops under reduced motion). */
  busy: boolean;
}

export const pixelStates: Record<PixelState, PixelStateConfig> = {
  pending: {
    label: "New",
    hint: "Not indexed yet",
    tone: "neutral",
    shape: "hollow",
    busy: false,
  },
  indexing: {
    label: "Indexing",
    hint: "Building the vector index",
    tone: "work",
    shape: "half",
    busy: true,
  },
  ready: {
    label: "Ready",
    hint: "Indexed and queryable",
    tone: "live",
    shape: "check",
    busy: false,
  },
  failed: {
    label: "Failed",
    hint: "Did not complete",
    tone: "fault",
    shape: "cross",
    busy: false,
  },
  retrieving: {
    label: "Retrieving",
    hint: "Searching the index for relevant code",
    tone: "retrieve",
    shape: "diamond",
    busy: true,
  },
  streaming: {
    label: "Streaming",
    hint: "Receiving the answer",
    tone: "vector",
    shape: "dots",
    busy: true,
  },
  authenticated: {
    label: "Signed in",
    hint: "Authenticated with GitHub",
    tone: "live",
    shape: "solid",
    busy: false,
  },
  unauthenticated: {
    label: "Signed out",
    hint: "Not authenticated",
    tone: "neutral",
    shape: "dash",
    busy: false,
  },
};

const fromIndexStatus: Record<IndexStatus, PixelState> = {
  PENDING: "pending",
  INDEXING: "indexing",
  READY: "ready",
  FAILED: "failed",
};

/** The backend's index status maps one-to-one onto four of the states. */
export function pixelStateFromIndexStatus(status: IndexStatus): PixelState {
  return fromIndexStatus[status];
}
