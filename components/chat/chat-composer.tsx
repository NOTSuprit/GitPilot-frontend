"use client";

import { CornerDownLeft, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * The composer keeps the thread's gutter, so what you are about to ask sits in
 * the same column as everything already asked. Controlled from above so the
 * example prompts in an empty thread can seed it, and the textarea ref is
 * lifted so picking an example can focus it.
 *
 * Below `md` the page itself scrolls, so the composer is pinned to the bottom
 * edge rather than left at the end of a long thread.
 */
export function ChatComposer({
  value,
  onValueChange,
  disabled,
  streaming,
  onSend,
  onStop,
  textareaRef,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  streaming?: boolean;
  onSend: (content: string) => void | Promise<void>;
  onStop?: () => void;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
}) {
  const canSend = Boolean(value.trim()) && !disabled && !streaming;

  async function submit() {
    const content = value.trim();
    if (!content || disabled || streaming) return;
    onValueChange("");
    await onSend(content);
  }

  return (
    <div className="sticky bottom-0 z-10 shrink-0 border-t-2 border-rule-strong bg-background pb-[env(safe-area-inset-bottom)] md:static">
      <div className="mx-auto w-full max-w-5xl px-4 py-3">
        <div className="lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)]">
          <div className="hidden lg:block lg:border-r-2 lg:border-rule lg:pr-4">
            <span className="pixel-label text-ink-faint">ask</span>
            <p className="mt-1.5 text-[0.625rem] leading-4 text-ink-faint">
              <Kbd className="h-4 bg-muted px-1 text-[0.625rem]">Enter</Kbd>{" "}
              sends
              <br />
              <Kbd className="h-4 bg-muted px-1 text-[0.625rem]">Shift</Kbd>
              {" + "}
              <Kbd className="h-4 bg-muted px-1 text-[0.625rem]">Enter</Kbd>{" "}
              newline
            </p>
          </div>

          <div className="min-w-0 lg:pl-5">
            <div
              className={cn(
                "flex items-end gap-2 border-2 border-rule-strong bg-card px-2 py-1.5 transition-colors",
                "focus-within:border-live focus-within:shadow-pixel-sm"
              )}
            >
              <span
                aria-hidden
                className="data-mono mb-1.5 shrink-0 pl-1 text-[0.8125rem] text-live"
              >
                &gt;
              </span>
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                placeholder={
                  disabled
                    ? "Waiting for a session…"
                    : "Ask about a file, a flow, or a decision…"
                }
                disabled={disabled}
                rows={1}
                aria-label="Ask a question about this repository"
                className="data-mono max-h-56 min-h-8 min-w-0 flex-1 resize-none rounded-none border-0 bg-transparent px-1 py-1 text-[0.8125rem] leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-[0.8125rem]"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submit();
                  }
                }}
              />

              {streaming ? (
                <Button
                  size="sm"
                  variant="pixel-danger"
                  onClick={onStop}
                  aria-label="Stop generating"
                  className="mb-0.5 shrink-0"
                >
                  <Square data-icon="inline-start" className="fill-current" />
                  Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="pixel"
                  disabled={!canSend}
                  onClick={() => void submit()}
                  aria-label="Send message"
                  className="mb-0.5 shrink-0"
                >
                  <CornerDownLeft data-icon="inline-start" />
                  Send
                </Button>
              )}
            </div>

            <p className="mt-1.5 text-[0.625rem] leading-4 text-ink-faint lg:hidden">
              <Kbd className="h-4 bg-muted px-1 text-[0.625rem]">Enter</Kbd>{" "}
              sends ·{" "}
              <Kbd className="h-4 bg-muted px-1 text-[0.625rem]">Shift</Kbd>
              {" + "}
              <Kbd className="h-4 bg-muted px-1 text-[0.625rem]">Enter</Kbd> for
              a newline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
