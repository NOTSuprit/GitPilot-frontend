"use client";

/**
 * THE HERO FIGURE — "the listing becomes the index".
 *
 * This is not an ornament. It is a diagram of the only thing devPilot does,
 * drawn from the same corpus the rest of the page quotes (`index-model.ts`),
 * and it runs the pipeline in order:
 *
 *   01 repository  file rows land in a listing — length is line count, indent is depth
 *   02 chunk       each row splits along its length into the chunks that tile it
 *   03 embed       those chunks lift off the page into a vector space, clustered by area
 *   04 retrieve    a question embeds into the same space; its nearest chunks light up
 *   05 cite        each retrieved chunk draws a line back to the exact lines it came from
 *
 * Acts 01–03 build once. Acts 04–05 then loop, one question at a time, because
 * that is the part a user actually lives in.
 *
 * The palette is the product's own six tokens, resolved from CSS at runtime so
 * the figure follows the theme. Two of them carry meaning here exactly as they
 * do in the app: `work` marks a chunk being embedded, `live` marks a chunk that
 * is queryable and cited. Nothing is coloured for decoration.
 *
 * Cost control: two InstancedMeshes (rows, chunks) and two LineSegments — four
 * draw calls for the whole scene, no lights, no shadows, no post-processing.
 * Depth comes from fog tinted to the page background. The loop is suspended
 * whenever the figure is off-screen or the tab is hidden, and
 * `prefers-reduced-motion` renders one composed frame and stops.
 */

import {
  Color,
  DynamicDrawUsage,
  Fog,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  LinearSRGBColorSpace,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  BoxGeometry,
  BufferGeometry,
  BufferAttribute,
  OctahedronGeometry,
  Mesh,
  WebGLRenderer,
} from "three";
import { useEffect, useRef } from "react";

import {
  CHUNKS,
  MAX_FILE_LINES,
  RETRIEVALS,
  SOURCE_FILES,
  type Chunk,
} from "@/components/landing/index-model";
import { resolveLinearOr } from "@/components/landing/token-color";
import {
  LOOP_BACK_AT,
  LOOP_END_AT,
  PIPELINE_ACTS,
  type PipelineAct,
} from "@/components/landing/stages";

export type SceneStage = {
  /** 1-based act number, for the `01`–`05` marker in the caption. */
  act: number;
  /** Act name, lowercase, matching the product's micro-label voice. */
  label: string;
  /** The question being answered, once act 04 has begun. */
  question: string | null;
};

export type SceneReadout = {
  /** `lib/auth/session.ts:120-153` for the chunk under the cursor, if any. */
  hovered: string | null;
};

/* ---------------------------------------------------------------- layout --- */

/* Proportions are tuned so the composition is about 2:1 — wide and shallow —
   because the plate it sits in is a wide rectangle. A taller arrangement forces
   the auto-framing below to fit on height, which throws away the horizontal
   space and shrinks everything. The listing is deliberately given a third of
   the width: it carries the most information and reads worst when small. */
const ROW_GAP = 0.34;
const ROW_INDENT = 0.26;
const BAR_MIN = 0.7;
const BAR_MAX = 5.2;
const BAR_LEFT = -3.0;

/** Yaw of the listing plane, so the page recedes instead of facing us flat. */
const LISTING_YAW = 0.48;
const LISTING_ORIGIN = new Vector3(-5.2, 0, 0.5);

const CLOUD_ORIGIN = new Vector3(3.9, 0, -0.3);
const CLUSTER_SPREAD = 1.5;

/** One centre per top-level directory in `CLUSTER_KEYS`, in that order. */
const CLUSTER_CENTRES: ReadonlyArray<readonly [number, number, number]> = [
  [0.05, 1.92, -0.5],
  [-1.58, 0.18, 0.92],
  [1.72, 0.6, 0.62],
  [0.3, -1.62, 1.0],
  [1.14, -1.24, -1.3],
];

/** Deterministic hash noise — the figure must compose identically every run. */
function noise(seed: number, salt: number) {
  const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rowY(index: number, count: number) {
  return ((count - 1) / 2 - index) * ROW_GAP;
}

function barExtent(lines: number, depth: number) {
  const left = BAR_LEFT + depth * ROW_INDENT;
  const length = BAR_MIN + BAR_MAX * (lines / MAX_FILE_LINES);
  return { left, length };
}

/** Local listing coordinates → world, applying the plane's yaw by hand so that
 *  rows, chunks and citation lines all share one coordinate space.
 *
 *  The `-sin` on z is not a choice: `Object3D.rotation.y` builds the matrix
 *  whose local +x maps to `(cos, 0, -sin)`. Rows and chunk tiles are boxes
 *  scaled along their local x and yawed by that same angle, so if this mapping
 *  used `+sin` the bars would extend along the mirror of the plane their
 *  centres sit on — left edges fanning out in proportion to bar length. */
function toWorld(lx: number, ly: number, out: Vector3) {
  const cos = Math.cos(LISTING_YAW);
  const sin = Math.sin(LISTING_YAW);
  return out.set(
    LISTING_ORIGIN.x + lx * cos,
    LISTING_ORIGIN.y + ly,
    LISTING_ORIGIN.z - lx * sin
  );
}

type ChunkLayout = {
  /** Where the chunk sits on its file's row, in the listing. */
  listing: Vector3;
  /** Where the chunk sits in the embedding space. */
  cloud: Vector3;
  /** Chunk tile width along the bar, in world units. */
  width: number;
  /** Stagger offsets so rows and clusters don't move in lockstep. */
  splitDelay: number;
  flightDelay: number;
};

function layoutChunks(): ChunkLayout[] {
  /* Cluster sizes are uneven (a repository has more `lib` than `test`), so the
     seat count has to be known before placing anything — otherwise the polar
     distribution is computed against the wrong denominator and each cluster
     collapses onto part of a shell instead of filling one. */
  const clusterSize = new Map<number, number>();
  for (const chunk of CHUNKS) {
    clusterSize.set(chunk.cluster, (clusterSize.get(chunk.cluster) ?? 0) + 1);
  }

  const perCluster = new Map<number, number>();

  return CHUNKS.map((chunk, index) => {
    const file = SOURCE_FILES[chunk.file];
    const { left, length } = barExtent(file.lines, file.depth);

    const s0 = (chunk.startLine - 1) / file.lines;
    const s1 = Math.min(1, chunk.endLine / file.lines);
    const mid = left + length * ((s0 + s1) / 2);
    const width = Math.max(0.05, length * (s1 - s0) * 0.82);

    const listing = toWorld(mid, rowY(chunk.file, SOURCE_FILES.length), new Vector3());

    const seat = perCluster.get(chunk.cluster) ?? 0;
    perCluster.set(chunk.cluster, seat + 1);

    const centre = CLUSTER_CENTRES[chunk.cluster] ?? CLUSTER_CENTRES[0];
    const size = clusterSize.get(chunk.cluster) ?? 1;
    const golden = seat * 2.399963;
    const shell = 0.34 + 0.6 * Math.sqrt(noise(index, 3));
    /* Even spacing over the whole sphere: cos(polar) walks -1 → 1 linearly.
       The parentheses matter — `1 - 2 * x % 1` would bind the modulo to the
       multiply and only ever produce the upper hemisphere. */
    const polar = Math.acos(1 - 2 * ((seat + 0.5) / size));

    const cloud = new Vector3(
      CLOUD_ORIGIN.x + centre[0] * CLUSTER_SPREAD + shell * Math.sin(polar) * Math.cos(golden),
      CLOUD_ORIGIN.y + centre[1] * CLUSTER_SPREAD + shell * Math.cos(polar),
      CLOUD_ORIGIN.z + centre[2] * CLUSTER_SPREAD + shell * Math.sin(polar) * Math.sin(golden)
    );

    return {
      listing,
      cloud,
      width,
      splitDelay: noise(index, 7) * 0.5 + (chunk.file / SOURCE_FILES.length) * 0.5,
      flightDelay: noise(index, 11) * 0.55 + (chunk.cluster / CLUSTER_CENTRES.length) * 0.4,
    };
  });
}

/**
 * Bounding box of the whole figure: every chunk at both ends of its journey,
 * and both ends of every file row. Depth is folded into the half-width so a
 * chunk that swings toward the camera cannot clip out of frame.
 */
function measure(layout: ChunkLayout[]) {
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  const grow = (v: Vector3) => {
    min.min(v);
    max.max(v);
  };

  for (const item of layout) {
    grow(item.listing);
    grow(item.cloud);
  }

  const end = new Vector3();
  for (let i = 0; i < SOURCE_FILES.length; i += 1) {
    const file = SOURCE_FILES[i];
    const { left, length } = barExtent(file.lines, file.depth);
    const y = rowY(i, SOURCE_FILES.length);
    grow(toWorld(left, y, end));
    grow(toWorld(left + length, y, end));
  }

  const centre = new Vector3().addVectors(min, max).multiplyScalar(0.5);
  const depth = (max.z - min.z) / 2;
  return {
    centre,
    halfWidth: (max.x - min.x) / 2 + depth * 0.35,
    halfHeight: (max.y - min.y) / 2 + 0.35,
  };
}

/* ------------------------------------------------------------- timeline --- */

const ACTS = PIPELINE_ACTS;

/* Stagger budgets. A staggered ease is written `f(p * GAIN - delay)`, so GAIN
   has to exceed `1 + maxDelay` or the latest instance stalls short of 1. These
   are the worst-case delays the layout above can produce, plus a margin. */
const ROW_STAGGER = 0.35;
const ROW_GAIN = 1 + ROW_STAGGER + 0.1;
const SPLIT_STAGGER = 1.0; // 0.5 noise + 0.5 file order
const SPLIT_GAIN = 1 + SPLIT_STAGGER + 0.1;
const FLIGHT_STAGGER = 0.55 + 0.4; // 0.55 noise + 0.4 cluster order
const FLIGHT_GAIN = 1 + FLIGHT_STAGGER + 0.1;
const LINK_STAGGER = 0.16 * 4;
const LINK_GAIN = 1 + LINK_STAGGER + 0.15;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
/** Slight overshoot-free ease-out, for travel that should feel decisive. */
const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);

/** Progress through a window, given the elapsed clock. */
const phase = (t: number, from: number, span: number) => clamp01((t - from) / span);

/* --------------------------------------------------------------- colour --- */

const TOKENS = [
  "--paper",
  "--ink",
  "--ink-faint",
  "--rule",
  "--rule-strong",
  "--live",
  "--work",
] as const;

type TokenName = (typeof TOKENS)[number];

/**
 * Token → swatch. The parsing and colour-space maths live in `token-color.ts`,
 * which has no Three.js dependency and is exercised directly — the failure mode
 * it guards against (a colour form the parser does not recognise) is invisible
 * on screen except as a wrong picture, so it is worth testing away from WebGL.
 *
 * `resolveLinearOr` returns **linear** sRGB, which is Three's working space, so
 * the values go in via `LinearSRGBColorSpace` with no further conversion.
 */
const TOKEN_FALLBACK = { r: 0.25, g: 0.25, b: 0.25 };

function readTokens(el: HTMLElement): Record<TokenName, Color> {
  const style = getComputedStyle(el);
  const out = {} as Record<TokenName, Color>;
  for (const token of TOKENS) {
    const { r, g, b } = resolveLinearOr(
      style.getPropertyValue(token),
      TOKEN_FALLBACK
    );
    out[token] = new Color().setRGB(r, g, b, LinearSRGBColorSpace);
  }
  return out;
}

/* ---------------------------------------------------------------- scene --- */

export default function IndexScene({
  onStage,
  onReadout,
  className,
}: {
  onStage?: (stage: SceneStage) => void;
  onReadout?: (readout: SceneReadout) => void;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(onStage);
  const readoutRef = useRef(onReadout);

  /* The scene effect must not re-run when a callback identity changes — it owns
     a renderer and a WebGL context. So the callbacks are reached through refs,
     kept current here rather than during render. */
  useEffect(() => {
    stageRef.current = onStage;
    readoutRef.current = onReadout;
  }, [onStage, onReadout]);

  useEffect(() => {
    /* Narrowing does not reach inside hoisted function declarations, and the
       draw/resize helpers below are hoisted, so `host` is declared non-null. */
    if (!hostRef.current) return;
    const host: HTMLDivElement = hostRef.current;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      // No WebGL: the caller's static fallback is already on screen.
      return;
    }

    const layout = layoutChunks();
    const chunkCount = layout.length;
    const fileCount = SOURCE_FILES.length;

    let tokens = readTokens(document.documentElement);

    const scene = new Scene();
    const fog = new Fog(0x000000, 12, 30);
    fog.color.copy(tokens["--paper"]);
    scene.fog = fog;

    const camera = new PerspectiveCamera(38, 1, 0.1, 100);
    const target = new Vector3(0.4, 0, 0);

    renderer.setClearAlpha(0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    /* --- file rows ------------------------------------------------------- */

    const rowGeometry = new BoxGeometry(1, 0.075, 0.075);
    const rowMaterial = new MeshBasicMaterial({ transparent: true, opacity: 1 });
    const rows = new InstancedMesh(rowGeometry, rowMaterial, fileCount);
    rows.instanceMatrix.setUsage(DynamicDrawUsage);
    rows.frustumCulled = false;
    scene.add(rows);

    /* --- the gutter rule -------------------------------------------------- */

    /* One hairline down the left of the listing. It is the product's signature
       mark — the rule that separates provenance from content on every surface —
       so the figure earns the word "listing" rather than just implying it. */
    const listingTop = rowY(0, fileCount);
    const listingBottom = rowY(fileCount - 1, fileCount);
    const gutterGeometry = new BoxGeometry(0.05, listingTop - listingBottom + ROW_GAP * 2, 0.05);
    const gutterMaterial = new MeshBasicMaterial({ transparent: true, opacity: 1 });
    const gutter = new Mesh(gutterGeometry, gutterMaterial);
    toWorld(BAR_LEFT - 0.28, (listingTop + listingBottom) / 2, gutter.position);
    gutter.rotation.y = LISTING_YAW;
    scene.add(gutter);

    /* --- chunk tiles ----------------------------------------------------- */

    const chunkGeometry = new BoxGeometry(1, 0.1, 0.1);
    const chunkMaterial = new MeshBasicMaterial({ transparent: true, opacity: 1 });
    const chunks = new InstancedMesh(chunkGeometry, chunkMaterial, chunkCount);
    chunks.instanceMatrix.setUsage(DynamicDrawUsage);
    chunks.frustumCulled = false;
    scene.add(chunks);

    /* --- the embedded question ------------------------------------------ */

    const queryGeometry = new OctahedronGeometry(0.17, 0);
    const queryMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0 });
    const query = new Mesh(queryGeometry, queryMaterial);
    query.visible = false;
    scene.add(query);

    /* --- lines: query→chunk (retrieval) and chunk→listing (citation) ----- */

    const MAX_LINKS = RETRIEVALS.reduce((m, r) => Math.max(m, r.chunks.length), 0);

    const makeLines = (count: number, opacity: number) => {
      const geometry = new BufferGeometry();
      const positions = new Float32Array(count * 6);
      const attribute = new BufferAttribute(positions, 3);
      attribute.setUsage(DynamicDrawUsage);
      geometry.setAttribute("position", attribute);
      const material = new LineBasicMaterial({ transparent: true, opacity });
      const lines = new LineSegments(geometry, material);
      lines.frustumCulled = false;
      lines.visible = false;
      scene.add(lines);
      return { geometry, positions, attribute, material, lines };
    };

    const reach = makeLines(MAX_LINKS, 0.5); // question → its nearest chunks
    const cite = makeLines(MAX_LINKS, 0.95); // chunk → the lines it came from

    /* --- per-instance state --------------------------------------------- */

    const dummy = new Object3D();
    const scratch = new Vector3();
    const colorScratch = new Color();
    const position = new Vector3();

    /** 0 = on the page, 1 = in the vector space. Interpolated per chunk. */
    const travel = new Float32Array(chunkCount);
    /** 0 = welded into its row, 1 = split out as its own tile. */
    const split = new Float32Array(chunkCount);

    let hoveredInstance = -1;
    let reportedHover: string | null = null;
    let retrievalIndex = 0;
    let retrieved = new Set<number>(RETRIEVALS[0]?.chunks ?? []);
    let citedFiles = new Set<number>();
    const recomputeCited = () => {
      citedFiles = new Set(Array.from(retrieved, (i) => CHUNKS[i].file));
    };
    recomputeCited();

    let reportedAct = -1;
    let reportedQuestion: string | null = null;

    /* --- interaction ----------------------------------------------------- */

    const pointer = new Vector2(0, 0); // -1..1, for parallax
    const ndc = new Vector2(0, 0); // -1..1, for raycasting
    let pointerInside = false;
    let parallaxX = 0;
    let parallaxY = 0;
    let scrollBias = 0;

    const raycaster = new Raycaster();

    function onPointerMove(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      pointer.set(nx, ny);
      ndc.set(nx, -ny);
      pointerInside = true;
    }

    function onPointerLeave() {
      pointerInside = false;
      pointer.set(0, 0);
      if (hoveredInstance !== -1) {
        hoveredInstance = -1;
        if (reportedHover !== null) {
          reportedHover = null;
          readoutRef.current?.({ hovered: null });
        }
      }
    }

    if (!coarse.matches) {
      renderer.domElement.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
      renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    }

    /* --- sizing ---------------------------------------------------------- */

    /* Auto-frame from the bounding box of everything that will be drawn —
       both resting places of every chunk, plus the ends of every file row — so
       the fit cannot drift out of step with the layout constants above. */
    const bounds = measure(layout);
    target.copy(bounds.centre);

    function resize() {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const aspect = width / height;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse.matches ? 1.5 : 2));
      renderer.setSize(width, height, false);

      camera.aspect = aspect;
      const halfFov = (camera.fov * Math.PI) / 360;
      const distH = bounds.halfHeight / Math.tan(halfFov);
      const distW = bounds.halfWidth / (Math.tan(halfFov) * aspect);
      cameraDistance = Math.max(distH, distW) * 1.08;
      // Depth cue, re-pinned to wherever the auto-fit put the camera.
      fog.near = cameraDistance - 4.5;
      fog.far = cameraDistance + 11;
      camera.updateProjectionMatrix();
    }

    let cameraDistance = 16;
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    /* --- drawing --------------------------------------------------------- */

    function paintRows(t: number) {
      const arrive = phase(t, ACTS[0].at, 2.0);
      const ghost = phase(t, ACTS[2].at, 1.6);

      for (let i = 0; i < fileCount; i += 1) {
        const file = SOURCE_FILES[i];
        const { left, length } = barExtent(file.lines, file.depth);

        // Rows land one after another, top to bottom.
        const local = easeOut(arrive * ROW_GAIN - (i / fileCount) * ROW_STAGGER);
        const grown = length * local;
        toWorld(left + grown / 2, rowY(i, fileCount), position);

        dummy.position.copy(position);
        // Drop in from slightly behind the page as they land.
        dummy.position.z -= (1 - local) * 0.9;
        dummy.rotation.set(0, LISTING_YAW, 0);
        dummy.scale.set(Math.max(0.0001, grown), 1, 1);
        dummy.updateMatrix();
        rows.setMatrixAt(i, dummy.matrix);

        // Once the chunks have flown off, the listing stays as the record that
        // citations point back to — present, but no longer the subject.
        const base = citedFiles.has(i) && t >= ACTS[4].at ? tokens["--live"] : tokens["--rule-strong"];
        colorScratch.copy(base);
        if (!citedFiles.has(i) || t < ACTS[4].at) {
          colorScratch.lerp(tokens["--rule"], ghost * 0.55);
        }
        colorScratch.multiplyScalar(local);
        rows.setColorAt(i, colorScratch);
      }

      rows.instanceMatrix.needsUpdate = true;
      if (rows.instanceColor) rows.instanceColor.needsUpdate = true;

      gutterMaterial.color.copy(tokens["--rule-strong"]);
      gutterMaterial.opacity = smooth(arrive * 2) * (1 - ghost * 0.35);
    }

    function paintChunks(t: number, spin: number) {
      const splitting = phase(t, ACTS[1].at, 1.9);
      const flying = phase(t, ACTS[2].at, 2.6);
      const focusing = phase(t, ACTS[3].at, 0.9);

      const cos = Math.cos(spin);
      const sin = Math.sin(spin);

      for (let i = 0; i < chunkCount; i += 1) {
        const item = layout[i];

        split[i] = smooth(splitting * SPLIT_GAIN - item.splitDelay);
        travel[i] = easeOut(flying * FLIGHT_GAIN - item.flightDelay);

        // Cloud positions rotate slowly about the cloud's own axis.
        const dx = item.cloud.x - CLOUD_ORIGIN.x;
        const dz = item.cloud.z - CLOUD_ORIGIN.z;
        scratch.set(
          CLOUD_ORIGIN.x + dx * cos - dz * sin,
          item.cloud.y,
          CLOUD_ORIGIN.z + dx * sin + dz * cos
        );

        position.lerpVectors(item.listing, scratch, travel[i]);
        // A shallow arc, so the migration reads as leaving the page.
        position.y += Math.sin(travel[i] * Math.PI) * 0.55;

        const isHit = retrieved.has(i);
        const isHover = hoveredInstance === i;

        // Tiles are their chunk's width on the page and cubes in the space.
        const width = item.width + (0.16 - item.width) * travel[i];
        const thick = 1 + travel[i] * 0.55 + (isHover ? 0.6 : 0);
        const pop = isHit ? 1 + focusing * 0.45 : 1;

        dummy.position.copy(position);
        dummy.rotation.set(0, LISTING_YAW * (1 - travel[i]), 0);
        dummy.scale.set(
          Math.max(0.02, width * pop),
          thick * pop,
          thick * pop
        );
        dummy.updateMatrix();
        chunks.setMatrixAt(i, dummy.matrix);

        /* Colour carries the state, exactly as it does in the app:
           `work` while a chunk is being embedded, `live` once it is retrieved. */
        if (isHit && t >= ACTS[3].at) {
          colorScratch.copy(tokens["--ink-faint"]).lerp(tokens["--live"], focusing);
        } else {
          const embedding = split[i] * (1 - travel[i]);
          colorScratch
            .copy(tokens["--rule-strong"])
            .lerp(tokens["--ink-faint"], travel[i])
            .lerp(tokens["--work"], embedding * 0.85);
          // Everything that is not retrieved recedes while an answer is formed.
          if (t >= ACTS[3].at) colorScratch.lerp(tokens["--rule"], focusing * 0.5);
        }
        if (isHover) colorScratch.lerp(tokens["--live"], 0.75);

        // Chunks only exist once their file has been split.
        colorScratch.multiplyScalar(Math.max(split[i], travel[i]));
        chunks.setColorAt(i, colorScratch);
      }

      chunks.instanceMatrix.needsUpdate = true;
      if (chunks.instanceColor) chunks.instanceColor.needsUpdate = true;
    }

    /** Where chunk `i` is being drawn right now, for the line endpoints. */
    function chunkAt(i: number, spin: number, out: Vector3) {
      const item = layout[i];
      const cos = Math.cos(spin);
      const sin = Math.sin(spin);
      const dx = item.cloud.x - CLOUD_ORIGIN.x;
      const dz = item.cloud.z - CLOUD_ORIGIN.z;
      scratch.set(
        CLOUD_ORIGIN.x + dx * cos - dz * sin,
        item.cloud.y,
        CLOUD_ORIGIN.z + dx * sin + dz * cos
      );
      out.lerpVectors(item.listing, scratch, travel[i]);
      out.y += Math.sin(travel[i] * Math.PI) * 0.55;
      return out;
    }

    const queryPoint = new Vector3();
    const endPoint = new Vector3();

    function paintLinks(t: number, spin: number) {
      const active = Array.from(retrieved);
      const reaching = phase(t, ACTS[3].at, 0.95);
      const citing = phase(t, ACTS[4].at, 1.5);

      if (t < ACTS[3].at || active.length === 0) {
        query.visible = false;
        reach.lines.visible = false;
        cite.lines.visible = false;
        return;
      }

      // The question is embedded into the same space its answers live in, so it
      // is placed at the centroid of what it retrieved — which is what nearest
      // neighbour search means, read backwards.
      queryPoint.set(0, 0, 0);
      for (const i of active) {
        chunkAt(i, spin, endPoint);
        queryPoint.add(endPoint);
      }
      queryPoint.multiplyScalar(1 / active.length);

      query.visible = true;
      query.position.copy(queryPoint);
      query.rotation.y = spin * 2.2;
      query.rotation.x = spin * 1.4;
      queryMaterial.color.copy(tokens["--live"]);
      queryMaterial.opacity = smooth(reaching);
      const s = 0.6 + smooth(reaching) * 0.4;
      query.scale.setScalar(s);

      // Question → chunk: what the retriever matched.
      reach.lines.visible = true;
      reach.material.color.copy(tokens["--live"]);
      reach.material.opacity = 0.65 * smooth(reaching) * (1 - citing * 0.35);
      for (let n = 0; n < MAX_LINKS; n += 1) {
        const o = n * 6;
        if (n >= active.length) {
          reach.positions.fill(0, o, o + 6);
          continue;
        }
        const grow = easeOut(reaching * LINK_GAIN - n * 0.12);
        chunkAt(active[n], spin, endPoint);
        endPoint.lerpVectors(queryPoint, endPoint, grow);
        reach.positions[o] = queryPoint.x;
        reach.positions[o + 1] = queryPoint.y;
        reach.positions[o + 2] = queryPoint.z;
        reach.positions[o + 3] = endPoint.x;
        reach.positions[o + 4] = endPoint.y;
        reach.positions[o + 5] = endPoint.z;
      }
      reach.attribute.needsUpdate = true;

      // Chunk → listing: the citation. This is the line that makes the answer
      // checkable, so it is the brightest thing in the figure.
      if (t < ACTS[4].at) {
        cite.lines.visible = false;
        return;
      }
      cite.lines.visible = true;
      cite.material.color.copy(tokens["--live"]);
      cite.material.opacity = smooth(citing);
      for (let n = 0; n < MAX_LINKS; n += 1) {
        const o = n * 6;
        if (n >= active.length) {
          cite.positions.fill(0, o, o + 6);
          continue;
        }
        const index = active[n];
        const grow = easeOut(citing * LINK_GAIN - n * 0.16);
        chunkAt(index, spin, position);
        endPoint.lerpVectors(position, layout[index].listing, grow);
        cite.positions[o] = position.x;
        cite.positions[o + 1] = position.y;
        cite.positions[o + 2] = position.z;
        cite.positions[o + 3] = endPoint.x;
        cite.positions[o + 4] = endPoint.y;
        cite.positions[o + 5] = endPoint.z;
      }
      cite.attribute.needsUpdate = true;
    }

    function reportStage(t: number) {
      let current: PipelineAct = ACTS[0];
      for (const act of ACTS) if (t >= act.at) current = act;

      const question =
        t >= ACTS[3].at ? RETRIEVALS[retrievalIndex]?.question ?? null : null;

      if (current.act !== reportedAct || question !== reportedQuestion) {
        reportedAct = current.act;
        reportedQuestion = question;
        stageRef.current?.({
          act: current.act,
          label: current.label,
          question,
        });
      }
    }

    function pickHover() {
      if (!pointerInside || coarse.matches) return;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(chunks, false);
      // Only tiles that have actually left the page are meaningful to name.
      const hit = hits.find((h) => h.instanceId != null && travel[h.instanceId] > 0.6);
      const next = hit?.instanceId ?? -1;
      if (next === hoveredInstance) return;
      hoveredInstance = next;
      const label = next === -1 ? null : refOf(CHUNKS[next]);
      if (label !== reportedHover) {
        reportedHover = label;
        readoutRef.current?.({ hovered: label });
      }
    }

    function placeCamera(t: number) {
      // Cursor parallax, eased toward the pointer so it never snaps.
      const targetX = pointerInside ? pointer.x : Math.sin(t * 0.14) * 0.35;
      const targetY = pointerInside ? pointer.y : Math.sin(t * 0.11) * 0.25;
      parallaxX += (targetX - parallaxX) * 0.045;
      parallaxY += (targetY - parallaxY) * 0.045;

      const yaw = parallaxX * 0.3 - scrollBias * 0.22;
      const pitch = parallaxY * 0.18 + scrollBias * 0.1;
      const dist = cameraDistance * (1 + scrollBias * 0.1);

      camera.position.set(
        target.x + Math.sin(yaw) * dist,
        target.y + pitch * dist * 0.5 + 0.5,
        target.z + Math.cos(yaw) * dist
      );
      camera.lookAt(target);
    }

    function draw(t: number) {
      const spin = t * 0.11;
      paintRows(t);
      paintChunks(t, spin);
      paintLinks(t, spin);
      placeCamera(t);
      pickHover();
      reportStage(t);
      renderer.render(scene, camera);
    }

    /* --- loop ------------------------------------------------------------ */

    let raf = 0;
    let last = 0;
    let clock = 0;
    let running = false;
    let onScreen = true;
    let still = reduceMotion.matches;

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      clock += dt;

      if (clock >= LOOP_END_AT) {
        clock = LOOP_BACK_AT;
        retrievalIndex = (retrievalIndex + 1) % RETRIEVALS.length;
        retrieved = new Set(RETRIEVALS[retrievalIndex].chunks);
        recomputeCited();
      }
      draw(clock);
    }

    function start() {
      if (running || still) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    }

    /** Reduced motion: compose the finished diagram and stop there. */
    function drawStill() {
      stop();
      still = true;
      // Past the last act, so every transition has settled.
      clock = LOOP_END_AT - 1.2;
      parallaxX = 0;
      parallaxY = 0;
      draw(clock);
    }

    function onMotionChange() {
      if (reduceMotion.matches) {
        drawStill();
      } else {
        still = false;
        clock = 0;
        if (onScreen && !document.hidden) start();
      }
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (onScreen && !still) start();
    }

    function onScroll() {
      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 while the figure is centred, rising as it leaves the viewport.
      const past = clamp01((-rect.top + vh * 0.1) / Math.max(rect.height, 1));
      scrollBias = past;
      if (still) draw(clock);
    }

    const intersection = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        if (onScreen && !document.hidden && !still) start();
        else if (!onScreen) stop();
      },
      { rootMargin: "120px" }
    );
    intersection.observe(host);

    /* Theme changes swap every token, so re-read and repaint. */
    const themeObserver = new MutationObserver(() => {
      tokens = readTokens(document.documentElement);
      fog.color.copy(tokens["--paper"]);
      if (still) draw(clock);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    reduceMotion.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (still) drawStill();
    else start();

    return () => {
      stop();
      intersection.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      reduceMotion.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);

      rowGeometry.dispose();
      rowMaterial.dispose();
      gutterGeometry.dispose();
      gutterMaterial.dispose();
      chunkGeometry.dispose();
      chunkMaterial.dispose();
      queryGeometry.dispose();
      queryMaterial.dispose();
      reach.geometry.dispose();
      reach.material.dispose();
      cite.geometry.dispose();
      cite.material.dispose();
      rows.dispose();
      chunks.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}

/** `lib/auth/session.ts:120-153` — same shape `lib/format.ts` prints. */
function refOf(chunk: Chunk) {
  const file = SOURCE_FILES[chunk.file];
  return `${file.path}:${chunk.startLine}-${chunk.endLine}`;
}
