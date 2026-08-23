/**
 * CSS colour token → linear sRGB.
 *
 * The design tokens are authored in `oklch()`, but what a browser hands back
 * from `getComputedStyle().getPropertyValue()` is *not* what was authored:
 * Chrome resolves colour-valued custom properties to `lab()` at computed-value
 * time, and normalising through a canvas `fillStyle` yields `lab()` as well.
 * `THREE.Color` parses neither — it warns and silently leaves the swatch white,
 * which is a failure mode with no visible symptom other than a wrong picture.
 *
 * So the conversion happens here instead, covering every form a browser is
 * likely to produce for these tokens. The output is **linear** sRGB, which is
 * the space Three.js works in, so callers hand it straight to
 * `Color.setRGB(r, g, b, LinearSRGBColorSpace)` with no further conversion.
 *
 * This module deliberately imports nothing, so the maths can be exercised
 * directly rather than only through a WebGL canvas.
 */

export type LinearRgb = { r: number; g: number; b: number };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Reference white for `lab()`/`lch()`, which CSS defines against D50. */
const D50_X = 0.3457 / 0.3585;
const D50_Y = 1;
const D50_Z = (1 - 0.3457 - 0.3585) / 0.3585;

const LAB_E = 216 / 24389;
const LAB_K = 24389 / 27;

function labToXyzD50(L: number, a: number, b: number) {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;

  const fx3 = fx * fx * fx;
  const fz3 = fz * fz * fz;

  const xr = fx3 > LAB_E ? fx3 : (116 * fx - 16) / LAB_K;
  const yr = L > LAB_K * LAB_E ? fy * fy * fy : L / LAB_K;
  const zr = fz3 > LAB_E ? fz3 : (116 * fz - 16) / LAB_K;

  return { x: xr * D50_X, y: yr * D50_Y, z: zr * D50_Z };
}

/** Bradford-adapted D50 → D65, then D65 XYZ → linear sRGB. */
function xyzD50ToLinear(x: number, y: number, z: number): LinearRgb {
  const x65 = 0.9554734527042182 * x - 0.023098536874261423 * y + 0.0632593086610217 * z;
  const y65 = -0.028369706963208136 * x + 1.0099954580058226 * y + 0.021041398966943008 * z;
  const z65 = 0.012314001688319899 * x - 0.020507696433477912 * y + 1.3303659366080753 * z;

  return {
    r: 3.2409699419045226 * x65 - 1.537383177570094 * y65 - 0.4986107602930034 * z65,
    g: -0.9692436362808796 * x65 + 1.8759675015077202 * y65 + 0.04155505740717559 * z65,
    b: 0.05563007969699366 * x65 - 0.20397695888897652 * y65 + 1.0569715142428786 * z65,
  };
}

function oklabToLinear(L: number, a: number, b: number): LinearRgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function srgbToLinear(v: number) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** `<number>` or `<percentage>`, scaled so 100% maps to `full`. */
function scalar(value: string, full: number) {
  const percent = value.endsWith("%");
  const n = Number.parseFloat(percent ? value.slice(0, -1) : value);
  if (!Number.isFinite(n)) return 0;
  return percent ? (n / 100) * full : n;
}

/** Hue in any CSS angle unit, normalised to degrees. */
function hue(value: string) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  if (value.endsWith("turn")) return n * 360;
  if (value.endsWith("rad")) return (n * 180) / Math.PI;
  if (value.endsWith("grad")) return n * 0.9;
  return n;
}

/** Pull the comma/space separated arguments out of `fn(a b c / alpha)`. */
function args(raw: string, fn: string) {
  const open = raw.indexOf("(");
  if (open === -1 || raw.slice(0, open).trim().toLowerCase() !== fn) return null;
  const close = raw.lastIndexOf(")");
  if (close <= open) return null;
  const body = raw.slice(open + 1, close).split("/")[0];
  const parts = body.trim().split(/[\s,]+/).filter(Boolean);
  return parts.length >= 3 ? parts : null;
}

const HEX = /^#([\da-f]{3,8})$/i;

function parseHex(raw: string): LinearRgb | null {
  const m = HEX.exec(raw);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length < 6) return null;
  const int = Number.parseInt(hex.slice(0, 6), 16);
  return {
    r: srgbToLinear(((int >> 16) & 255) / 255),
    g: srgbToLinear(((int >> 8) & 255) / 255),
    b: srgbToLinear((int & 255) / 255),
  };
}

/**
 * Resolve one CSS colour string to linear sRGB, or `null` if the form is not
 * recognised — callers decide what to substitute rather than getting a silently
 * wrong colour.
 *
 * Handles the forms these tokens actually appear as in the wild: `oklch()` as
 * authored, `lab()` as Chrome computes it, plus `oklab()`, `lch()`,
 * `color(srgb …)`, `color(srgb-linear …)`, `rgb()` and hex.
 */
export function resolveLinear(input: string): LinearRgb | null {
  const raw = input.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  let parts: string[] | null;

  if ((parts = args(lower, "oklch"))) {
    const L = scalar(parts[0], 1);
    const C = scalar(parts[1], 0.4);
    const h = (hue(parts[2]) * Math.PI) / 180;
    return oklabToLinear(L, C * Math.cos(h), C * Math.sin(h));
  }

  if ((parts = args(lower, "oklab"))) {
    return oklabToLinear(
      scalar(parts[0], 1),
      scalar(parts[1], 0.4),
      scalar(parts[2], 0.4)
    );
  }

  if ((parts = args(lower, "lab"))) {
    const { x, y, z } = labToXyzD50(
      scalar(parts[0], 100),
      scalar(parts[1], 125),
      scalar(parts[2], 125)
    );
    return xyzD50ToLinear(x, y, z);
  }

  if ((parts = args(lower, "lch"))) {
    const L = scalar(parts[0], 100);
    const C = scalar(parts[1], 150);
    const h = (hue(parts[2]) * Math.PI) / 180;
    const { x, y, z } = labToXyzD50(L, C * Math.cos(h), C * Math.sin(h));
    return xyzD50ToLinear(x, y, z);
  }

  if ((parts = args(lower, "color"))) {
    const space = parts[0];
    const [r, g, b] = parts.slice(1, 4).map((v) => scalar(v, 1));
    if (space === "srgb-linear") return { r, g, b };
    if (space === "srgb") {
      return { r: srgbToLinear(r), g: srgbToLinear(g), b: srgbToLinear(b) };
    }
    return null;
  }

  if ((parts = args(lower, "rgb")) || (parts = args(lower, "rgba"))) {
    const [r, g, b] = parts.slice(0, 3).map((v) => scalar(v, 255) / 255);
    return { r: srgbToLinear(r), g: srgbToLinear(g), b: srgbToLinear(b) };
  }

  return parseHex(lower);
}

/** Same, clamped into gamut and never null — for callers that must draw. */
export function resolveLinearOr(input: string, fallback: LinearRgb): LinearRgb {
  const resolved = resolveLinear(input);
  if (!resolved) return fallback;
  return {
    r: clamp01(resolved.r),
    g: clamp01(resolved.g),
    b: clamp01(resolved.b),
  };
}
