/**
 * The corpus the hero scene indexes.
 *
 * The scene is a demonstration, not a decoration, so the thing it operates on
 * has to behave like a real repository: files with plausible lengths, nested
 * paths, chunk counts derived from file length, and line ranges that actually
 * tile the file. Everything here is computed once, deterministically, at module
 * load — the same listing renders on every machine, and the citations the scene
 * displays are consistent with the chunks it retrieves.
 *
 * The paths deliberately describe a generic application repository, not
 * devPilot's own source. This is the *user's* codebase in the diagram.
 */

export type SourceFile = {
  /** Full repository-relative path, as a citation would print it. */
  path: string;
  /** Line count — drives both bar length and how many chunks the file yields. */
  lines: number;
  /** Nesting depth, used to indent the bar like a tree listing. */
  depth: number;
  /** Index into {@link CLUSTER_KEYS}: which neighbourhood of the repo this is. */
  cluster: number;
};

export type Chunk = {
  /** Index into {@link SOURCE_FILES} — the file this chunk was split from. */
  file: number;
  startLine: number;
  endLine: number;
  cluster: number;
};

/**
 * Top-level directories double as semantic neighbourhoods: chunks from the same
 * area of the tree land near each other in the index, which is the behaviour an
 * embedding of source code actually exhibits.
 */
export const CLUSTER_KEYS = ["app", "lib", "services", "web", "test"] as const;

const FILES: ReadonlyArray<readonly [path: string, lines: number]> = [
  ["app/server.ts", 246],
  ["app/routes/users.ts", 184],
  ["app/routes/orders.ts", 322],
  ["app/routes/webhooks.ts", 142],
  ["lib/auth/session.ts", 214],
  ["lib/auth/tokens.ts", 158],
  ["lib/auth/middleware.ts", 126],
  ["lib/db/pool.ts", 94],
  ["lib/db/migrate.ts", 268],
  ["lib/db/schema.sql", 412],
  ["lib/queue/worker.ts", 232],
  ["lib/queue/jobs.ts", 148],
  ["lib/cache/redis.ts", 112],
  ["services/billing/invoice.ts", 344],
  ["services/billing/webhook.ts", 192],
  ["services/mailer/send.ts", 134],
  ["web/components/data-table.tsx", 386],
  ["web/components/form-field.tsx", 224],
  ["web/hooks/use-user.ts", 82],
  ["web/hooks/use-orders.ts", 96],
  ["test/auth.spec.ts", 172],
  ["test/billing.spec.ts", 242],
];

/** Chunk size in lines. Chunks tile the file with a small overlap, like a real splitter. */
const CHUNK_LINES = 34;
const CHUNK_OVERLAP = 6;

function clusterOf(path: string) {
  const top = path.slice(0, path.indexOf("/"));
  const index = CLUSTER_KEYS.indexOf(top as (typeof CLUSTER_KEYS)[number]);
  return index === -1 ? 0 : index;
}

export const SOURCE_FILES: SourceFile[] = FILES.map(([path, lines]) => ({
  path,
  lines,
  depth: path.split("/").length - 1,
  cluster: clusterOf(path),
}));

export const MAX_FILE_LINES = SOURCE_FILES.reduce(
  (max, file) => Math.max(max, file.lines),
  1
);

/**
 * Split every file into chunks. A file of 214 lines at 34 lines per chunk with
 * 6 lines of overlap yields 8 chunks, the last one short — which is exactly the
 * shape a chunk table has in practice.
 */
export const CHUNKS: Chunk[] = SOURCE_FILES.flatMap((file, fileIndex) => {
  const stride = CHUNK_LINES - CHUNK_OVERLAP;
  const chunks: Chunk[] = [];
  for (let start = 1; start <= file.lines; start += stride) {
    chunks.push({
      file: fileIndex,
      startLine: start,
      endLine: Math.min(start + CHUNK_LINES - 1, file.lines),
      cluster: file.cluster,
    });
    if (start + CHUNK_LINES - 1 >= file.lines) break;
  }
  return chunks;
});

/** `lib/auth/session.ts:120-153` — the same shape `lib/format.ts` prints. */
export function chunkRef(chunk: Chunk) {
  const file = SOURCE_FILES[chunk.file];
  return `${file.path}:${chunk.startLine}-${chunk.endLine}`;
}

export type Retrieval = {
  question: string;
  /** Indices into {@link CHUNKS}, in the order an answer would cite them. */
  chunks: number[];
};

/**
 * Four questions, each answered from chunks that genuinely belong to the files
 * a developer would expect — so the lines the scene draws back to the listing
 * are the lines that would actually be cited.
 */
const QUESTIONS: ReadonlyArray<readonly [question: string, files: string[]]> = [
  [
    "where is the session cookie set?",
    [
      "lib/auth/session.ts",
      "lib/auth/middleware.ts",
      "lib/auth/tokens.ts",
      "app/server.ts",
      "test/auth.spec.ts",
    ],
  ],
  [
    "how are failed webhook deliveries retried?",
    [
      "services/billing/webhook.ts",
      "lib/queue/worker.ts",
      "lib/queue/jobs.ts",
      "app/routes/webhooks.ts",
      "test/billing.spec.ts",
    ],
  ],
  [
    "what runs when an invoice is finalised?",
    [
      "services/billing/invoice.ts",
      "services/mailer/send.ts",
      "lib/db/schema.sql",
      "app/routes/orders.ts",
      "lib/queue/jobs.ts",
    ],
  ],
  [
    "which queries read the user table?",
    [
      "web/hooks/use-user.ts",
      "app/routes/users.ts",
      "lib/db/pool.ts",
      "lib/auth/session.ts",
      "web/components/data-table.tsx",
    ],
  ],
];

/**
 * Pick one chunk per cited file, spread across the file so consecutive
 * questions don't all cite line 1. `nth` walks a different offset per question.
 */
function chunkForFile(path: string, nth: number) {
  const fileIndex = SOURCE_FILES.findIndex((file) => file.path === path);
  if (fileIndex === -1) return -1;
  const owned: number[] = [];
  for (let i = 0; i < CHUNKS.length; i += 1) {
    if (CHUNKS[i].file === fileIndex) owned.push(i);
  }
  if (!owned.length) return -1;
  return owned[Math.floor(((nth + 1) * 0.37 * owned.length) % owned.length)];
}

export const RETRIEVALS: Retrieval[] = QUESTIONS.map(
  ([question, files], questionIndex) => ({
    question,
    chunks: files
      .map((path) => chunkForFile(path, questionIndex))
      .filter((index) => index >= 0),
  })
);
