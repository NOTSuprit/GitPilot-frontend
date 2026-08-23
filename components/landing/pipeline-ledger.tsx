import { ArrowUpRight } from "lucide-react";

import {
  CHUNKS,
  RETRIEVALS,
  SOURCE_FILES,
  chunkRef,
} from "@/components/landing/index-model";
import { Data, Micro } from "@/components/layout/listing";
import { lineRef, num, shortPath } from "@/lib/format";

/**
 * THE MECHANISM, WORKED THROUGH ONCE.
 *
 * The hero animates the pipeline; this section holds it still and labels every
 * intermediate value, because the audience for devPilot is people who will not
 * trust a retrieval system they cannot inspect. Left column is what the system
 * does, right column is what the user is handed — and the right column is
 * deliberately the app's own signature element, a numbered citation gutter
 * beside the prose it produced.
 *
 * Every path, line range and count below is read out of `index-model.ts`, the
 * same corpus the 3D figure indexes. Nothing here is a placeholder string.
 */

const QUESTION = RETRIEVALS[0];
const CITED = QUESTION.chunks.map((index) => ({
  index,
  chunk: CHUNKS[index],
  ref: chunkRef(CHUNKS[index]),
}));

/** The chunk the ledger follows from split to citation. */
const SPECIMEN = CITED[0];
const SPECIMEN_FILE = SOURCE_FILES[SPECIMEN.chunk.file];

/** A deterministic bar strip standing in for the chunk's embedding. It is a
 *  shape, not a claim: no dimension count is asserted anywhere. */
const VECTOR_BARS = Array.from({ length: 44 }, (_, i) => {
  const v = Math.sin(i * 1.37 + 0.6) * Math.cos(i * 0.41 + 1.2);
  return { i, v };
});

/** Stands in for a streamed answer's code block, so the cell shows the shape of
 *  the real thing rather than trailing off into empty space. */
const ANSWER_SNIPPET = `res.cookie(COOKIE, token, {
  httpOnly: true,
  sameSite: "lax",
  secure: isProd,
});`;

const STAGES = [
  {
    act: 1,
    label: "repository",
    head: `${num(SOURCE_FILES.length)} source files`,
    body: "Read over the GitHub API at the default branch. Vendored and binary paths are skipped.",
  },
  {
    act: 2,
    label: "chunk",
    head: `${SPECIMEN.ref}`,
    body: `Split on structure with overlap, so a function is not cut in half. ${SPECIMEN_FILE.path} yields ${num(
      CHUNKS.filter((c) => c.file === SPECIMEN.chunk.file).length
    )} chunks across ${num(SPECIMEN_FILE.lines)} lines.`,
    mono: true,
  },
  {
    act: 3,
    label: "embed",
    head: "one vector per chunk",
    body: "Each chunk is embedded and stored alongside its path and line range, so a match can always be traced back to source.",
    vector: true,
  },
  {
    act: 4,
    label: "retrieve",
    head: `${num(CITED.length)} nearest chunks`,
    body: `The question is embedded into that same space. Only its closest neighbours are passed to the model — the rest of the repository is not in the prompt.`,
  },
  {
    act: 5,
    label: "cite",
    head: "path + line range, per chunk",
    body: "The answer carries the chunks it was built from. Each one links to that exact range on your default branch, so a wrong answer is a checkable one.",
  },
];

export function PipelineLedger() {
  return (
    <section
      id="pipeline"
      aria-labelledby="pipeline-heading"
      className="scroll-mt-12 border-t border-rule py-14 md:py-20"
    >
      <div className="lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="lg:border-r lg:border-rule lg:pr-4">
          <Micro>the pipeline</Micro>
        </div>
        <div className="mt-3 lg:mt-0 lg:pl-6">
          <h2
            id="pipeline-heading"
            className="max-w-3xl font-mono text-xl leading-tight font-semibold tracking-tight text-balance sm:text-2xl"
          >
            Repository → chunks → embeddings → retrieval → citations.
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
            Traced end to end on one question, with the intermediate values left
            in. This is the whole system; there is no hidden step.
          </p>
        </div>
      </div>

      <div className="mt-9 grid gap-px border border-rule bg-rule lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* --- left: the mechanism, stage by stage --- */}
        <ol className="bg-paper">
          {STAGES.map((stage) => (
            <li
              key={stage.label}
              className="grid grid-cols-[3.75rem_minmax(0,1fr)] border-b border-rule last:border-b-0"
            >
              <div className="flex items-start gap-1.5 border-r border-rule px-3 py-3.5">
                <span className="data-mono tabular text-[0.6875rem] leading-4 text-ink-faint">
                  {String(stage.act).padStart(2, "0")}
                </span>
              </div>
              <div className="px-3.5 py-3.5">
                <Micro className="text-live">{stage.label}</Micro>
                <p
                  className={
                    stage.mono
                      ? "data-mono mt-1 text-xs leading-snug break-all text-ink"
                      : "mt-1 font-mono text-[0.8125rem] leading-snug font-semibold tracking-tight text-ink"
                  }
                >
                  {stage.head}
                </p>

                {stage.vector && (
                  <svg
                    viewBox="0 0 176 22"
                    className="mt-2 h-[22px] w-full max-w-[16rem]"
                    aria-hidden="true"
                    preserveAspectRatio="none"
                  >
                    {VECTOR_BARS.map(({ i, v }) => {
                      const h = Math.max(1.5, Math.abs(v) * 9);
                      return (
                        <rect
                          key={i}
                          x={i * 4}
                          y={11 - (v > 0 ? h : 0)}
                          width="2.4"
                          height={h}
                          fill={i % 7 === 3 ? "var(--live)" : "var(--rule-strong)"}
                        />
                      );
                    })}
                  </svg>
                )}

                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                  {stage.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* --- right: what the user is handed --- */}
        <div className="flex flex-col bg-paper">
          <div className="border-b border-rule px-3.5 py-3">
            <Micro>question</Micro>
            <p className="data-mono mt-1 text-xs leading-snug text-ink">
              {QUESTION.question}
            </p>
          </div>

          {/* The citation gutter, in the same grammar the chat thread uses. */}
          <div className="grid flex-1 grid-cols-[minmax(0,11.75rem)_minmax(0,1fr)]">
            <div className="border-r border-rule px-3 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <Micro>sources</Micro>
                <Data className="tabular text-ink-soft">{CITED.length}</Data>
              </div>
              <ol className="mt-2 space-y-2">
                {CITED.map((item, i) => (
                  <li key={item.index} className="flex gap-1.5">
                    <span className="data-mono tabular text-[0.625rem] leading-4 text-ink-faint">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="data-mono block truncate text-[0.6875rem] leading-4 text-ink-soft">
                        {shortPath(SOURCE_FILES[item.chunk.file].path)}
                      </span>
                      <span className="data-mono block text-[0.6875rem] leading-4 text-live">
                        L
                        {lineRef(item.chunk.startLine, item.chunk.endLine)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="px-3.5 py-3">
              <Micro>answer</Micro>
              <div className="mt-1.5 space-y-2 text-xs leading-relaxed text-ink-soft">
                <p>
                  The cookie is written in{" "}
                  <code className="data-mono rounded-[3px] bg-paper-field px-1 py-0.5 text-[0.6875rem] text-ink">
                    createSession()
                  </code>
                  , which sets it{" "}
                  <code className="data-mono rounded-[3px] bg-paper-field px-1 py-0.5 text-[0.6875rem] text-ink">
                    HttpOnly
                  </code>{" "}
                  and reads it back on every request through the auth
                  middleware.
                </p>
                <pre className="overflow-x-auto rounded-[3px] border border-rule bg-paper-sunken/70 px-2.5 py-2">
                  <code className="data-mono text-[0.6875rem] leading-5 text-ink">
                    {ANSWER_SNIPPET}
                  </code>
                </pre>
                <p className="text-ink-soft">
                  Illustrative answer. The sources beside it are the chunks this
                  question actually retrieves from the corpus above.
                </p>
              </div>

              <p className="mt-3 flex items-center gap-1 border-t border-rule pt-2">
                <ArrowUpRight
                  aria-hidden
                  className="size-3 text-rule-strong"
                  strokeWidth={2}
                />
                <span className="label-mono text-ink-soft">
                  each source opens on github
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
