"use client";

import { useRef } from "react";
import { CornerDownLeft, Square } from "lucide-react";

import { Micro } from "@/components/layout/listing";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * The composer keeps the thread's gutter, so what you are about to ask sits in
 * the same column as everything already asked. Controlled from above so the
 * example prompts in an empty thread can seed it.
 */
export function ChatComposer({
  value,
  onValueChange,
  disabled,
  streaming,
  onSend,
  onStop,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  streaming?: boolean;
  onSend: (content: string) => void | Promise<void>;
  onStop?: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = Boolean(value.trim()) && !disabled && !streaming;

  async function submit() {
    const content = value.trim();
    if (!content || disabled || streaming) return;
    onValueChange("");
    await onSend(content);
  }

  return (
    <div className="shrink-0 border-t border-rule bg-background/90 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-5xl px-4 py-3">
        <div className="lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
          <div className="hidden lg:block lg:border-r lg:border-rule lg:pr-4">
            <Micro className="text-ink-faint">ask</Micro>
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

          <div className="lg:pl-5">
            <div
              className={cn(
                "flex items-end gap-2 rounded-md border border-rule bg-card px-2 py-1.5 transition-colors",
                "focus-within:border-live/60 focus-within:ring-2 focus-within:ring-live/20"
              )}
            >
              <Textarea
                ref={ref}
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
                className="data-mono max-h-56 min-h-8 flex-1 resize-none border-0 bg-transparent px-1 py-1 text-[0.8125rem] leading-relaxed shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-[0.8125rem]"
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
                  variant="outline"
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
