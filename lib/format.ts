import { formatDistanceToNowStrict } from "date-fns";

/**
 * Fixed locale so numbers rendered during hydration always match the server.
 */
const NUMBER = new Intl.NumberFormat("en-US");

export function num(value: number | null | undefined) {
  return typeof value === "number" ? NUMBER.format(value) : "—";
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${NUMBER.format(count)} ${count === 1 ? one : many}`;
}

/** "3d ago" / "just now" — short enough to sit in a gutter. */
export function ago(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const seconds = (Date.now() - date.getTime()) / 1000;
  if (seconds < 45) return "just now";
  return `${formatDistanceToNowStrict(date)} ago`;
}

/**
 * Compact form for fixed-width cells: `38m`, `4h`, `12d`. Same instant as
 * `ago()`, just narrow enough not to truncate in a tile ledger.
 */
export function agoShort(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 365) return `${days}d ago`;
  return `${Math.round(days / 365)}y ago`;
}

export function clockTime(iso: string | null | undefined) {  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** `src/auth/session.ts:41-68` — the canonical way this app names a chunk. */
export function citationRef(
  filePath: string,
  startLine: number | null | undefined,
  endLine: number | null | undefined
) {
  if (startLine == null) return filePath;
  return endLine && endLine !== startLine
    ? `${filePath}:${startLine}-${endLine}`
    : `${filePath}:${startLine}`;
}

/** `41-68` / `41` / null — just the line part, for a narrow gutter. */
export function lineRef(
  startLine: number | null | undefined,
  endLine: number | null | undefined
) {
  if (startLine == null) return null;
  return endLine && endLine !== startLine
    ? `${startLine}-${endLine}`
    : `${startLine}`;
}

/** Keep the leaf and one parent; a gutter is narrow and the leaf carries most meaning. */
export function shortPath(filePath: string, keep = 2) {
  const parts = filePath.split("/");
  if (parts.length <= keep) return filePath;
  return `…/${parts.slice(-keep).join("/")}`;
}
