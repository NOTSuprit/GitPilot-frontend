/**
 * The five acts of the hero figure, shared by the scene that animates them and
 * the caption that names them. Kept in its own module so the caption — which is
 * part of the initial page — can label the pipeline without pulling Three.js
 * into the bundle.
 *
 * The `at` values are the scene's timeline, in seconds.
 */
export const PIPELINE_ACTS = [
  {
    at: 0.0,
    act: 1,
    label: "repository",
    note: "every source file, length to scale",
  },
  {
    at: 2.3,
    act: 2,
    label: "chunk",
    note: "split on structure, with overlap",
  },
  {
    at: 4.5,
    act: 3,
    label: "embed",
    note: "written to pgvector, clustered by area",
  },
  {
    at: 7.6,
    act: 4,
    label: "retrieve",
    note: "the question's nearest neighbours",
  },
  {
    at: 9.6,
    act: 5,
    label: "cite",
    note: "back to the exact line range",
  },
] as const;

export type PipelineAct = (typeof PIPELINE_ACTS)[number];

/** Act 04 — where the loop restarts. The index does not get rebuilt per question. */
export const LOOP_BACK_AT = PIPELINE_ACTS[3].at;
export const LOOP_END_AT = 13.4;
