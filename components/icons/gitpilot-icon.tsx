import type { SVGProps } from "react";

/**
 * The mark is the product's thesis at 24px: a source listing with a gutter.
 * Three lines of code, one of them cited — rendered in `live`, the same colour
 * the app uses everywhere to mean "this corpus can answer questions."
 */
export function GitPilotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <rect width="32" height="32" rx="7.5" fill="var(--ink)" />

      {/* the gutter: line numbers, then the rule */}
      <g fill="var(--paper)" fillOpacity="0.4">
        <rect x="6" y="10.25" width="2.5" height="1.5" rx="0.75" />
        <rect x="6" y="15.25" width="2.5" height="1.5" rx="0.75" />
        <rect x="6" y="20.25" width="2.5" height="1.5" rx="0.75" />
      </g>
      <rect
        x="11"
        y="6.5"
        width="1.25"
        height="19"
        rx="0.6"
        fill="var(--paper)"
        fillOpacity="0.25"
      />

      {/* the listing — the middle line is the citation */}
      <g strokeWidth="2.25" strokeLinecap="round">
        <path d="M15.25 11h10.5" stroke="var(--paper)" strokeOpacity="0.7" />
        <path d="M15.25 16h7" stroke="var(--live)" />
        <path d="M15.25 21h9" stroke="var(--paper)" strokeOpacity="0.7" />
      </g>
    </svg>
  );
}
