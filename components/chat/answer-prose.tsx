"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A deliberately small markdown renderer.
 *
 * The answer stream is plain markdown and arrives token by token, so the
 * renderer has to tolerate half-written syntax: an unterminated fence must show
 * as a code block being written, not as literal backticks. It handles what the
 * model actually emits — fences, inline code, emphasis, links, lists, headings,
 * quotes, rules — and leaves anything else as text rather than guessing.
 */

type Block =
  | { kind: "code"; lang: string | null; lines: string[]; open: boolean }
  | { kind: "heading"; level: number; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "quote"; lines: string[] }
  | { kind: "rule" }
  | { kind: "para"; lines: string[] };

const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/;
const HEADING = /^ {0,3}(#{1,6})\s+(.*)$/;
const RULE = /^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
const BULLET = /^ {0,3}[-*+]\s+(.*)$/;
const NUMBERED = /^ {0,3}\d{1,9}[.)]\s+(.*)$/;
const QUOTE = /^ {0,3}>\s?(.*)$/;

function parse(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const fence = FENCE.exec(line);
    if (fence) {
      const char = fence[1][0];
      const closer = new RegExp(`^ {0,3}\\${char}{3,}\\s*$`);
      const body: string[] = [];
      let closed = false;
      i += 1;
      while (i < lines.length) {
        if (closer.test(lines[i])) {
          closed = true;
          i += 1;
          break;
        }
        body.push(lines[i]);
        i += 1;
      }
      blocks.push({
        kind: "code",
        lang: fence[2] || null,
        lines: body,
        open: !closed,
      });
      continue;
    }

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1].length,
        text: heading[2].trim(),
      });
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ kind: "rule" });
      i += 1;
      continue;
    }

    const ordered = NUMBERED.test(line);
    if (ordered || BULLET.test(line)) {
      const pattern = ordered ? NUMBERED : BULLET;
      const items: string[] = [];
      while (i < lines.length) {
        const item = pattern.exec(lines[i]);
        if (item) {
          items.push(item[1]);
          i += 1;
          continue;
        }
        // A wrapped continuation line belongs to the item above it.
        if (items.length && /^\s{2,}\S/.test(lines[i])) {
          items[items.length - 1] += ` ${lines[i].trim()}`;
          i += 1;
          continue;
        }
        break;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length) {
        const quoted = QUOTE.exec(lines[i]);
        if (!quoted) break;
        body.push(quoted[1]);
        i += 1;
      }
      blocks.push({ kind: "quote", lines: body });
      continue;
    }

    const body: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      if (
        FENCE.test(lines[i]) ||
        HEADING.test(lines[i]) ||
        RULE.test(lines[i]) ||
        QUOTE.test(lines[i]) ||
        BULLET.test(lines[i]) ||
        NUMBERED.test(lines[i])
      ) {
        break;
      }
      body.push(lines[i]);
      i += 1;
    }
    blocks.push({ kind: "para", lines: body });
  }

  return blocks;
}

const INLINE =
  /(`+)([^`]*?)\1|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|\[([^\]\n]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>()]+)/g;

function inline(text: string, prefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = new RegExp(INLINE.source, "g");
  let last = 0;
  let n = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match[0].length === 0) {
      re.lastIndex += 1;
      continue;
    }
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${prefix}-${n++}`;

    if (match[2] !== undefined) {
      out.push(
        <code
          key={key}
          className="data-mono rounded-[3px] border border-rule bg-muted px-1 py-px text-[0.8125em] text-ink"
        >
          {match[2]}
        </code>
      );
    } else if (match[3] || match[4]) {
      out.push(
        <strong key={key} className="font-semibold text-ink">
          {match[3] ?? match[4]}
        </strong>
      );
    } else if (match[5]) {
      out.push(<em key={key}>{match[5]}</em>);
    } else if (match[6] && match[7]) {
      out.push(
        <a
          key={key}
          href={match[7]}
          target="_blank"
          rel="noreferrer"
          className="text-live underline decoration-live/40 underline-offset-2 hover:decoration-live"
        >
          {match[6]}
        </a>
      );
    } else if (match[8]) {
      out.push(
        <a
          key={key}
          href={match[8]}
          target="_blank"
          rel="noreferrer"
          className="data-mono break-all text-live underline decoration-live/40 underline-offset-2 hover:decoration-live"
        >
          {match[8]}
        </a>
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

function CodeBlock({
  lang,
  lines,
  open,
}: {
  lang: string | null;
  lines: string[];
  open: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const text = lines.join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* selectable on screen regardless */
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-md border border-rule bg-muted/60">
      <div className="flex items-center gap-2 border-b border-rule px-2.5 py-1">
        <span className="label-mono text-ink-faint">{lang ?? "code"}</span>
        {open && (
          <span className="label-mono text-work" aria-live="off">
            writing
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="ml-auto rounded-[3px] p-1 text-ink-faint transition-colors hover:bg-accent hover:text-ink"
        >
          {copied ? (
            <Check className="size-3 text-live" />
          ) : (
            <Copy className="size-3" />
          )}
        </button>
      </div>
      {/* Line numbers make the gutter idea literal inside the answer too. */}
      <pre className="overflow-x-auto px-0 py-2 text-xs leading-5">
        <code className="data-mono block">
          {lines.map((line, index) => (
            <span key={index} className="flex">
              <span
                aria-hidden
                className="sticky left-0 w-9 shrink-0 border-r border-rule bg-muted/60 pr-2 text-right text-ink-faint select-none"
              >
                {index + 1}
              </span>
              <span className="pr-3 pl-3 whitespace-pre text-ink">
                {line || " "}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

const HEADING_SIZE: Record<number, string> = {
  1: "text-base",
  2: "text-sm",
  3: "text-sm",
  4: "text-[0.8125rem]",
  5: "text-[0.8125rem]",
  6: "text-[0.8125rem]",
};

export function AnswerProse({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = React.useMemo(() => parse(content), [content]);

  return (
    <div className={cn("text-sm leading-relaxed text-ink-soft", className)}>
      {blocks.map((block, index) => {
        const key = `b${index}`;

        switch (block.kind) {
          case "code":
            return (
              <CodeBlock
                key={key}
                lang={block.lang}
                lines={block.lines}
                open={block.open}
              />
            );

          case "heading": {
            const Tag = `h${Math.min(block.level + 2, 6)}` as "h3";
            return (
              <Tag
                key={key}
                className={cn(
                  "mt-4 mb-1.5 font-semibold text-ink first:mt-0",
                  HEADING_SIZE[block.level] ?? "text-sm"
                )}
              >
                {inline(block.text, key)}
              </Tag>
            );
          }

          case "rule":
            return <hr key={key} className="my-4 border-rule" />;

          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag
                key={key}
                className={cn(
                  "my-2 space-y-1 pl-5",
                  block.ordered ? "list-decimal" : "list-disc"
                )}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-0.5 marker:text-ink-faint">
                    {inline(item, `${key}-${itemIndex}`)}
                  </li>
                ))}
              </Tag>
            );
          }

          case "quote":
            return (
              <blockquote
                key={key}
                className="my-3 border-l-2 border-rule-strong pl-3 text-ink-faint italic"
              >
                {inline(block.lines.join(" "), key)}
              </blockquote>
            );

          default:
            return (
              <p key={key} className="my-2 first:mt-0 last:mb-0">
                {inline(block.lines.join("\n"), key)}
              </p>
            );
        }
      })}
    </div>
  );
}
