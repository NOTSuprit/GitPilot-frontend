"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";

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

/** What assistive tech hears for a source: the real path and range, plus the target. */
function citationLabel(citation: Citation, lines: string | null) {
  return `${citation.filePath}${lines ? `, lines ${lines}` : ""} — open on GitHub, new tab`;
}

function LanguageChip({ language }: { language: string | null }) {
  const color = languageColor(language);
  if (!language) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <span
        aria-hidden
        className="size-2 shrink-0 ring-1 ring-foreground/25 ring-inset"
        style={color ? { backgroundColor: color } : undefined}
      />
      <span className="data-mono text-[0.625rem] text-ink-faint">{language}</span>
    </span>
  );
}

/**
 * THE SIGNATURE ELEMENT: the evidence column.
 *
 * Every answer is a printed listing: prose in the measure, provenance in the
 * margin. The chunks the retriever actually used are stacked beside the answer
 * they produced, numbered, each a link straight to that file and line range on
 * GitHub. Every field shown is a field the backend returned — file path, line
 * range, language. The backend does not return chunk text or relevance
 * scores, so none is shown; there is no excerpt because there is no source
 * text to excerpt.
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
      <ol className="flex flex-col gap-1.5">
        {citations.map((citation, index) => {
          const lines = lineRef(citation.startLine, citation.endLine);

          return (
            <li key={`${citation.filePath}-${index}`}>
              <a
                href={citationHref(repo, citation)}
                target="_blank"
                rel="noreferrer"
                aria-label={citationLabel(citation, lines)}
                title={`${citation.filePath}${lines ? `:${lines}` : ""}`}
                className="group/cite flex items-start gap-2 border-2 border-rule bg-card px-2 py-1.5 transition-colors hover:border-retrieve hover:bg-retrieve-tint"
              >
                <span
                  aria-hidden
                  className="data-mono tabular mt-px flex size-4 shrink-0 items-center justify-center bg-retrieve text-[0.625rem] leading-none text-retrieve-fg"
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="data-mono block truncate text-[0.6875rem] leading-4 text-ink">
                    {shortPath(citation.filePath)}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-2">
                    {lines && (
                      <span className="data-mono text-[0.625rem] leading-4 text-retrieve">
                        L{lines}
                      </span>
                    )}
                    <LanguageChip language={citation.language} />
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="mt-0.5 size-3 shrink-0 text-ink-faint group-hover/cite:text-retrieve"
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * The compact, collapsible form for narrow screens: a native disclosure, so it
 * is keyboard- and screen-reader-operable with no script. Full paths wrap
 * rather than truncate, because on a phone the path is the whole point.
 */
export function CitationDisclosure({
  repo,
  citations,
}: {
  repo: Repository;
  citations: Citation[];
}) {
  if (!citations.length) {
    return (
      <p className="data-mono mt-3 border-t-2 border-rule pt-2 text-[0.6875rem] text-ink-faint">
        no sources were returned for this answer
      </p>
    );
  }

  return (
    <details className="group/sources mt-3 border-t-2 border-rule pt-2">
      <summary className="label-mono flex cursor-pointer list-none items-center gap-1.5 text-retrieve [&::-webkit-details-marker]:hidden">
        <ChevronDown
          aria-hidden
          className="size-3 transition-transform group-open/sources:rotate-180"
        />
        sources · {citations.length}
      </summary>
      <nav aria-label={`Sources for this answer (${citations.length})`}>
        <ol className="mt-2 flex flex-col gap-1.5">
          {citations.map((citation, index) => {
            const lines = lineRef(citation.startLine, citation.endLine);
            return (
              <li key={`${citation.filePath}-${index}`}>
                <a
                  href={citationHref(repo, citation)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={citationLabel(citation, lines)}
                  className="flex items-start gap-2 border-2 border-rule bg-card px-2 py-1.5 hover:border-retrieve"
                >
                  <span
                    aria-hidden
                    className="data-mono tabular mt-px flex size-4 shrink-0 items-center justify-center bg-retrieve text-[0.625rem] leading-none text-retrieve-fg"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="data-mono block text-[0.6875rem] leading-4 break-all text-ink">
                      {citation.filePath}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2">
                      {lines && (
                        <span className="data-mono text-[0.625rem] leading-4 text-retrieve">
                          L{lines}
                        </span>
                      )}
                      <LanguageChip language={citation.language} />
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="mt-0.5 size-3 shrink-0 text-ink-faint"
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </details>
  );
}

/** The wrapped chip row. No longer used by the thread; kept for compatibility. */
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
      className="mt-2.5 border-t-2 border-rule pt-2"
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
                aria-label={citationLabel(citation, lines)}
                title={citation.filePath}
                className={cn(
                  "data-mono inline-flex max-w-full items-center gap-1 border-2 border-rule px-1.5 py-0.5",
                  "text-[0.6875rem] leading-4 text-ink-soft hover:border-retrieve hover:text-ink"
                )}
              >
                <span aria-hidden className="text-ink-faint">
                  {index + 1}
                </span>
                <span className="truncate">{shortPath(citation.filePath)}</span>
                {lines && <span className="text-retrieve">L{lines}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
