"use client";

import { Search, X } from "lucide-react";

import type { IndexStatus } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Data } from "@/components/layout/listing";
import { StatusGlyph, indexStatusLabel } from "@/components/dashboard/status-mark";
import { num } from "@/lib/format";
import { cn } from "@/lib/utils";

export type VisibilityFilter = "all" | "public" | "private";
export type StatusFilter = "ALL" | IndexStatus;

const VISIBILITY: { value: VisibilityFilter; label: string }[] = [
  { value: "all", label: "all" },
  { value: "public", label: "public" },
  { value: "private", label: "private" },
];

const STATUS: StatusFilter[] = ["ALL", "READY", "INDEXING", "PENDING", "FAILED"];

/**
 * Selection is a raised field with an ink underline, not a tint, so `live`
 * stays reserved for "queryable" and never doubles as "you clicked this".
 */
function Segment({
  active,
  children,
  ...props
}: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "label-mono inline-flex h-7 items-center gap-1.5 px-2.5 transition-colors",
        active
          ? "bg-paper-field text-ink shadow-[inset_0_-2px_0_0_var(--ink)]"
          : "text-ink-soft hover:bg-accent hover:text-ink"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SegmentGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-0.5 border-2 border-rule-strong bg-card p-0.5"
    >
      {children}
    </div>
  );
}

export function RepoToolbar({
  search,
  onSearchChange,
  visibility,
  onVisibilityChange,
  status,
  onStatusChange,
  totalCount,
  matchCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  visibility: VisibilityFilter;
  onVisibilityChange: (value: VisibilityFilter) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  totalCount: number;
  matchCount: number;
}) {
  const filtered = matchCount !== totalCount;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-80">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-faint"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="filter by name, description, language"
            aria-label="Filter repositories"
            className="data-mono h-8 w-full rounded-none border-2 pl-8 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear filter"
              className="absolute top-1/2 right-1.5 -translate-y-1/2 p-1 text-ink-faint hover:bg-accent hover:text-ink"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <SegmentGroup label="Filter by visibility">
          {VISIBILITY.map((item) => (
            <Segment
              key={item.value}
              active={visibility === item.value}
              onClick={() => onVisibilityChange(item.value)}
            >
              {item.label}
            </Segment>
          ))}
        </SegmentGroup>

        <SegmentGroup label="Filter by index status">
          {STATUS.map((value) => (
            <Segment
              key={value}
              active={status === value}
              onClick={() => onStatusChange(value)}
            >
              {value !== "ALL" && <StatusGlyph status={value} />}
              {value === "ALL" ? "all" : indexStatusLabel[value].toLowerCase()}
            </Segment>
          ))}
        </SegmentGroup>

        {filtered && (
          <Data className="ml-auto" aria-live="polite">
            {num(matchCount)} of {num(totalCount)} shown
          </Data>
        )}
      </div>
    </div>
  );
}
