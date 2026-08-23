import { Micro } from "@/components/layout/listing";

/**
 * Capabilities, each one a thing the application actually does, with the
 * concrete artifact it produces printed underneath in mono. The data line is
 * the point: it is the difference between "semantic search" as a claim and
 * `path:start-end` as a fact the product will hand you.
 *
 * Laid out as a hairline grid — `gap-px` over a `bg-rule` parent — so the
 * dividers are the structure and no cell needs a border of its own.
 */
const CAPABILITIES = [
  {
    label: "identity",
    title: "GitHub is the only account",
    body: "One OAuth grant lists your repositories and reads them for indexing. There is no separate password, and no write scope.",
    data: "scope · repo, read:user",
  },
  {
    label: "corpus",
    title: "Public and private repositories",
    body: "Your repositories arrive with language, default branch, visibility and description, and can be re-synced from GitHub on demand.",
    data: "GET /api/repos",
  },
  {
    label: "index",
    title: "Chunking you can watch",
    body: "Source files are split on structure and embedded into a vector store. The build reports files processed against files total, so a large repository is never a blank wait.",
    data: "filesProcessed / filesTotal",
  },
  {
    label: "state",
    title: "Four honest index states",
    body: "New, indexing, ready, failed. A failure keeps the message that caused it and the repository can be re-indexed from the tile it failed on.",
    data: "PENDING · INDEXING · READY · FAILED",
  },
  {
    label: "retrieval",
    title: "Answers assembled from chunks",
    body: "A question is embedded and matched against the repository's chunks; only what comes back is given to the model. Chat stays locked until an index exists to retrieve from.",
    data: "top-k chunks per question",
  },
  {
    label: "provenance",
    title: "Citations to exact line ranges",
    body: "Every answer lists the chunks behind it in a monospace gutter — file path and line range, each one a link to that range on your default branch.",
    data: "lib/auth/session.ts:118-151",
  },
  {
    label: "transport",
    title: "Streamed responses",
    body: "Tokens arrive as the model produces them, and the sources attach when the answer completes. Long answers start reading immediately.",
    data: "text/event-stream",
  },
  {
    label: "sessions",
    title: "Threads scoped to a repository",
    body: "Chats belong to the repository they interrogate, so context never leaks between codebases. Past threads stay in the rail.",
    data: "sessions per repositoryId",
  },
];

export function Capabilities() {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="scroll-mt-12 border-t border-rule py-14 md:py-20"
    >
      <div className="lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="lg:border-r lg:border-rule lg:pr-4">
          <Micro>capabilities</Micro>
        </div>
        <div className="mt-3 lg:mt-0 lg:pl-6">
          <h2
            id="capabilities-heading"
            className="max-w-2xl font-mono text-xl leading-tight font-semibold tracking-tight text-balance sm:text-2xl"
          >
            What is actually in the box.
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
            No roadmap items, no “coming soon”. Each line below is a surface you
            reach within a minute of signing in.
          </p>
        </div>
      </div>

      <ul className="mt-9 grid gap-px border-y border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {CAPABILITIES.map((item) => (
          <li key={item.label} className="flex flex-col bg-paper p-4">
            <Micro className="text-live">{item.label}</Micro>
            <h3 className="mt-2.5 font-mono text-sm leading-snug font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              {item.body}
            </p>
            <p className="mt-3 border-t border-rule pt-2">
              <span className="data-mono text-[0.6875rem] leading-4 break-all text-ink-soft">
                {item.data}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
