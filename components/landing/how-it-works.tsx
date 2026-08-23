import {
  FolderGit2,
  ListTree,
  MessagesSquare,
  Boxes,
  Search,
} from "lucide-react";

import { Micro } from "@/components/layout/listing";

/**
 * Five steps, in the order a user performs them.
 *
 * The visual interest here is structural, not ornamental: each step owns a
 * column, and a single hairline runs across all of them at the tick marks —
 * one continuous pipeline rather than five detached cards. On narrow screens
 * the rule turns vertical and runs down the left edge instead, so the sequence
 * survives the reflow.
 */
const STEPS = [
  {
    icon: FolderGit2,
    label: "connect",
    title: "Authorise GitHub",
    body: "One OAuth grant, scoped to read your repositories. devPilot never writes to them.",
  },
  {
    icon: ListTree,
    label: "select",
    title: "Pick a repository",
    body: "Public or private. Your repos are listed with language, default branch, and index state.",
  },
  {
    icon: Boxes,
    label: "index",
    title: "Chunk and embed",
    body: "Source files are split on structure and written to a vector store. Progress is reported per file.",
  },
  {
    icon: Search,
    label: "retrieve",
    title: "Ground the question",
    body: "Your question is embedded into the same space, and the closest chunks become the model's context.",
  },
  {
    icon: MessagesSquare,
    label: "ask",
    title: "Read the answer",
    body: "Responses stream in, and every chunk they were built from is listed beside them.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="scroll-mt-12 border-t border-rule py-14 md:py-20"
    >
      <div className="lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="lg:border-r lg:border-rule lg:pr-4">
          <Micro>how it works</Micro>
        </div>
        <div className="mt-3 lg:mt-0 lg:pl-6">
          <h2
            id="how-heading"
            className="max-w-2xl font-mono text-xl leading-tight font-semibold tracking-tight text-balance sm:text-2xl"
          >
            Five steps from an OAuth grant to an answer you can check.
          </h2>
        </div>
      </div>

      {/* The pipeline. `border-l` on each step draws the tick marks; the shared
          top rule on md+ is the line they hang from. */}
      <ol className="mt-9 grid gap-px border-t border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step, i) => (
          <li
            key={step.label}
            className="group relative flex flex-col bg-paper p-4 transition-colors hover:bg-paper-sunken/60"
          >
            <div className="flex items-center gap-2">
              <span className="data-mono tabular text-[0.6875rem] leading-4 text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Micro className="text-live">{step.label}</Micro>
              <step.icon
                aria-hidden
                className="ml-auto size-3.5 text-rule-strong transition-colors group-hover:text-live"
                strokeWidth={1.75}
              />
            </div>
            <h3 className="mt-3 font-mono text-sm leading-snug font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
