"use client";

import { ArrowUpRight } from "lucide-react";

import { languageColor } from "@/components/dashboard/language-mark";
import type { Citation, Repository } from "@/lib/api";
import { lineRef, shortPath } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Unchanged from the original implementation — this URL shape is a contract
 * with GitHub's blob viewer, not a design decision.
 */
export function citationHref(repo: Repository, citation: Citation) {
  const line =
    citation.startLine != null
      ? `#L${citation.startLine}${
          citation.endLine && citation.endLine !== citation.startLine
            ? `-L${citation.endLine}`
            : ""
        }`
      : "";
  return `https://github.com/${repo.fullName}/blob/${repo.defaultBranch}/${citation.filePath}${line}`;
}

/**
 * THE SIGNATURE ELEMENT.
 *
 * Every answer is a printed listing: prose in the measure, provenance in the
 * margin. The chunks the retriever actually used are stacked in a monospace
 * gutter to the left of the answer they produced, numbered, each one a link
 * straight to that line range on GitHub. Nothing here is decoration — the
 * gutter is the audit trail, and its width is the reason the answer is
 * trustworthy rather than merely fluent.
 *
 * On narrow screens the gutter unfolds below the answer as a wrapped row; the
 * rule moves from the right edge to the top so the relationship survives.
 */
export function CitationGutter({
  repo,
  citations,
  className,
}: {
  repo: Repository;
  citations: Citation[];
  className?: string;
}) {
  if (!citations.length) return null;

  return (
    <nav
      aria-label={`Sources for this answer (${citations.length})`}
      className={className}
    >
      <ol className="flex flex-col gap-px">
        {citations.map((citation, index) => {
          const lines = lineRef(citation.startLine, citation.endLine);
          const color = languageColor(citation.language);

          return (
            <li key={`${citation.filePath}-${index}`}>
              <a
                href={citationHref(repo, citation)}
                target="_blank"
                rel="noreferrer"
                title={`${citation.filePath}${lines ? `:${lines}` : ""} — open on GitHub`}
                className="group/cite flex items-baseline gap-1.5 rounded-[3px] px-1 py-0.5 -mx-1 transition-colors hover:bg-accent"
              >
                <span
                  aria-hidden
                  className="data-mono w-3 shrink-0 text-right text-[0.625rem] text-ink-faint tabular"
                >
                  {index + 1}
                </span>
                {color && (
                  <span
                    aria-hidden
                    className="mt-[0.3rem] size-[5px] shrink-0 rounded-[1px]"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="data-mono block truncate text-[0.6875rem] leading-4 text-ink group-hover/cite:underline group-hover/cite:decoration-rule-strong group-hover/cite:underline-offset-2">
                    {shortPath(citation.filePath)}
                  </span>
                  {lines && (
                    <span className="data-mono block text-[0.625rem] leading-3 text-live">
                      L{lines}
                    </span>
                  )}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="mt-0.5 size-2.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover/cite:opacity-100"
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The wrapped, horizontal form used under the answer on narrow screens. */
export function CitationRow({
  repo,
  citations,
}: {
  repo: Repository;
  citations: Citation[];
}) {
  if (!citations.length) return null;

  return (
    <nav
      aria-label={`Sources for this answer (${citations.length})`}
      className="mt-2.5 border-t border-rule pt-2"
    >
      <ul className="flex flex-wrap gap-1">
        {citations.map((citation, index) => {
          const lines = lineRef(citation.startLine, citation.endLine);
          return (
            <li key={`${citation.filePath}-${index}`}>
              <a
                href={citationHref(repo, citation)}
                target="_blank"
                rel="noreferrer"
                title={citation.filePath}
                className={cn(
                  "data-mono inline-flex max-w-full items-center gap-1 rounded-[3px] border border-rule px-1.5 py-0.5",
                  "text-[0.6875rem] leading-4 text-ink-soft hover:border-rule-strong hover:text-ink"
                )}
              >
                <span aria-hidden className="text-ink-faint">
                  {index + 1}
                </span>
                <span className="truncate">{shortPath(citation.filePath)}</span>
                {lines && <span className="text-live">L{lines}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
