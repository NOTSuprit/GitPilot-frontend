"use client";

import { RefreshCw, Search, X } from "lucide-react";

import type { IndexStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
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
 * Selection is expressed by inverting the substrate (ink on paper becomes
 * paper on ink) rather than by tinting, so `live` stays reserved for
 * "queryable" and never doubles as "you clicked this".
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
        "label-mono inline-flex h-6 items-center gap-1.5 rounded-[3px] px-2 transition-colors",
        active
          ? "bg-ink text-paper"
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
      className="inline-flex items-center gap-0.5 rounded-md border border-rule bg-card p-0.5"
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
  readyCount,
  matchCount,
  onSync,
  isSyncing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  visibility: VisibilityFilter;
  onVisibilityChange: (value: VisibilityFilter) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  totalCount: number;
  readyCount: number;
  matchCount: number;
  onSync: () => void;
  isSyncing: boolean;
}) {
  const filtered = matchCount !== totalCount;

  return (
    <div className="flex flex-col gap-3 border-b border-rule pb-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-lg leading-tight font-semibold tracking-tight">
            Repositories
          </h1>
          <Data className="mt-0.5 block">
            {num(totalCount)} connected · {num(readyCount)} queryable
            {filtered && <> · {num(matchCount)} shown</>}
          </Data>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
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
              className="data-mono h-8 w-full pl-8 text-xs sm:w-80"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear filter"
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-[3px] p-1 text-ink-faint hover:bg-accent hover:text-ink"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
          >
            <RefreshCw
              data-icon="inline-start"
              className={cn(isSyncing && "animate-spin")}
            />
            {isSyncing ? "Syncing" : "Sync"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </div>
  );
}
