"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * `errorMessage` is the most actionable string in the whole data model — it is
 * the difference between "indexing broke" and "the clone hit a 404 because the
 * token lost repo scope". So it is shown verbatim, in mono, wrapped rather
 * than truncated, and it is copyable, because the next thing an engineer does
 * with a stack trace is paste it somewhere.
 */
const CLAMP_CHARS = 220;

export function IndexError({
  message,
  className,
  action,
}: {
  message: string | null | undefined;
  className?: string;
  action?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = message?.trim();
  const long = Boolean(text && text.length > CLAMP_CHARS);
  const shown = !text
    ? "The server did not report a reason."
    : long && !expanded
      ? `${text.slice(0, CLAMP_CHARS)}…`
      : text;

  async function copy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the text is on screen and selectable anyway */
    }
  }

  return (
    <div
      className={cn(
        "border-2 border-fault bg-fault-tint px-3 py-2.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="pixel-label text-fault">indexing failed</span>
        <div className="flex shrink-0 items-center gap-1">
          {text && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={copy}
              aria-label={copied ? "Error copied" : "Copy error message"}
            >
              {copied ? <Check className="text-live" /> : <Copy />}
            </Button>
          )}
          {action}
        </div>
      </div>

      <p className="data-mono mt-1 text-xs leading-relaxed break-words whitespace-pre-wrap text-ink">
        {shown}
      </p>

      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="label-mono mt-1.5 text-fault underline decoration-fault/40 underline-offset-2 hover:decoration-fault"
        >
          {expanded ? "collapse" : "show full error"}
        </button>
      )}
    </div>
  );
}
