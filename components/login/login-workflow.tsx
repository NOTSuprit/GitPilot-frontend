import { StepMotif } from "@/components/landing/step-motifs";
import { PixelPanel } from "@/components/pixel";

/**
 * A compact picture of what happens after you sign in. Static, text-first, and
 * the same four stages the landing page explains.
 */
const STEPS = [
  { kind: "connect", title: "Connect", body: "Sign in with GitHub and pick a repository." },
  { kind: "index", title: "Index", body: "Eligible files become chunks and embeddings." },
  { kind: "retrieve", title: "Ask", body: "Your question retrieves the nearest chunks." },
  { kind: "cite", title: "Cite", body: "Answers link to files and line ranges." },
] as const;

export function LoginWorkflow({ className }: { className?: string }) {
  return (
    <PixelPanel tone="sunken" className={className}>
      <div className="border-b-2 border-rule px-4 py-3">
        <p className="pixel-label text-ink-faint">after you sign in</p>
      </div>
      <ol className="relative flex flex-col">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex items-center gap-4 border-b border-rule px-4 py-3 last:border-b-0"
          >
            <span
              aria-hidden
              className="pixel-display w-7 shrink-0 text-2xl text-live"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <StepMotif kind={step.kind} className="w-16 shrink-0 sm:w-20" />
            <div className="min-w-0">
              <p className="pixel-display text-base text-foreground">
                {step.title}
              </p>
              <p className="text-xs leading-relaxed text-ink-soft">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </PixelPanel>
  );
}
