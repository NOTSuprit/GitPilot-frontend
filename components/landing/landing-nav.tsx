import Link from "next/link";

import { GithubCta } from "@/components/landing/github-cta";
import { BrandMark } from "@/components/layout/app-shell";
import { ModeToggle } from "@/components/ui/mode-toggle";

/**
 * The public bar. Same 44px height and hairline underline as the app's own
 * AppBar, so arriving at the dashboard after sign-in is not a change of scene.
 *
 * Three anchors is too few to justify a disclosure menu, so on small screens
 * they are simply dropped rather than hidden behind a button that would cost a
 * client component and a state machine. The CTA — the only thing on this page
 * that has to be reachable at every width — stays.
 */
const SECTIONS = [
  { href: "#how", label: "how it works" },
  { href: "#capabilities", label: "capabilities" },
  { href: "#pipeline", label: "pipeline" },
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur-sm">
      <div className="mx-auto flex h-11 w-full max-w-[78rem] items-center gap-4 px-4">
        <Link
          href="/"
          className="rounded-[3px]"
          aria-label="devPilot — home"
        >
          <BrandMark />
        </Link>

        <nav aria-label="Sections" className="ml-2 hidden md:block">
          <ul className="flex items-center gap-4">
            {SECTIONS.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="label-mono rounded-[3px] text-ink-soft transition-colors hover:text-ink"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ModeToggle />
          <GithubCta size="sm">Sign in</GithubCta>
        </div>
      </div>
    </header>
  );
}
