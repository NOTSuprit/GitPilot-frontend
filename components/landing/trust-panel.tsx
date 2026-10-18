import { PixelPanel, PixelSectionHeader } from "@/components/pixel";

/**
 * What connecting actually involves, stated plainly and checked against the
 * backend: the OAuth scopes configured, the GitHub requests the code makes,
 * what is stored, and what leaves for the model provider.
 *
 * Note the first row. GitHub's `repo` scope covers write access and cannot be
 * narrowed to read-only, so this page never calls the grant "read-only". What
 * it can truthfully say is that GitPilot's own code only issues read requests.
 */
const ROWS = [
  {
    term: "github scopes",
    value: (
      <>
        <span className="data-mono text-foreground">repo</span> and{" "}
        <span className="data-mono text-foreground">read:user</span>. GitHub’s{" "}
        <span className="data-mono">repo</span> scope is broad — it can read and
        write repositories — and GitHub does not offer a read-only version of it.
      </>
    ),
  },
  {
    term: "what gitpilot does",
    value:
      "Only read requests to GitHub: your repository list, a repository’s file tree, and the contents of the files it indexes. It does not write to your repositories.",
  },
  {
    term: "stored",
    value:
      "Your GitHub token (encrypted), repository metadata, chat sessions, and the chunks and embeddings of the files you index.",
  },
  {
    term: "sent to openai",
    value:
      "Chunk text, to create embeddings. Your question and the retrieved chunks, to write the answer.",
  },
  {
    term: "revoke",
    value: "In your GitHub account’s settings, at any time.",
  },
] as const;

export function TrustPanel() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="scroll-mt-20 border-t-2 border-rule-strong py-14 md:py-20"
    >
      <PixelSectionHeader
        label="before you connect"
        title={<span id="trust-heading">What access you are granting</span>}
        description="Answers are grounded in the chunks retrieved from your index. Here is exactly what that involves."
      />

      <PixelPanel raised className="mt-8 max-w-3xl">
        <dl>
          {ROWS.map((row, i) => (
            <div
              key={row.term}
              className={`grid gap-1 px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4 ${
                i > 0 ? "border-t border-rule" : ""
              }`}
            >
              <dt className="label-mono pt-0.5 text-ink-faint">{row.term}</dt>
              <dd className="text-sm leading-relaxed text-ink-soft">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </PixelPanel>
    </section>
  );
}
