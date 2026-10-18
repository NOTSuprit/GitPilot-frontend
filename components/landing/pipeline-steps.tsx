import { StepMotif } from "@/components/landing/step-motifs";
import { PixelSectionHeader } from "@/components/pixel";

/**
 * The product, in four steps. Every claim here is something the backend does
 * today: file selection is by extension with build output, dependency folders
 * and very large files skipped; chunks overlap; vectors live in pgvector;
 * citations carry a file path and line range and link to the file on GitHub.
 */
const STEPS = [
  {
    kind: "connect",
    tone: "text-live",
    title: "Connect a repository",
    body: "Sign in with GitHub and GitPilot lists the repositories your account can see. Pick one to work with. Nothing is indexed until you start it.",
    detail: "github oauth · repository list",
  },
  {
    kind: "index",
    tone: "text-vector",
    title: "Index it into chunks and embeddings",
    body: "Eligible source, config and docs files are split into overlapping chunks and embedded into a pgvector store. Build output, dependency folders, lockfiles and very large files are skipped. Progress is reported as files processed.",
    detail: "eligible files · chunks · embeddings",
  },
  {
    kind: "retrieve",
    tone: "text-retrieve",
    title: "Ask, and retrieve the relevant context",
    body: "Your question is embedded into the same space. The nearest chunks of that repository become the context the model answers from, and the answer streams in as it is written.",
    detail: "question → nearest chunks → answer",
  },
  {
    kind: "cite",
    tone: "text-live",
    title: "Inspect the citations",
    body: "Each answer lists the files and line ranges it was built from, and each one links to that file on GitHub, so you can check the answer against the code.",
    detail: "file path · line range · link",
  },
] as const;

export function PipelineSteps() {
  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="scroll-mt-20 border-t-2 border-rule-strong py-14 md:py-20"
    >
      <PixelSectionHeader
        label="how it works"
        title={<span id="how-heading">From repository to cited answer</span>}
      />

      <ol className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-5">
            <span
              aria-hidden
              className={`pixel-display w-12 shrink-0 text-5xl leading-none ${step.tone}`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <StepMotif kind={step.kind} />
              <h3 className="pixel-display mt-4 text-xl text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                {step.body}
              </p>
              <p className="label-mono mt-3 text-ink-faint">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
