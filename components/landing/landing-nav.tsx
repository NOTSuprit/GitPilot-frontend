import Link from "next/link";

import { GithubCta } from "@/components/landing/github-cta";
import { LandingBrand } from "@/components/landing/landing-brand";
import { ModeToggle } from "@/components/ui/mode-toggle";

/**
 * The public bar: solid, ruled, no blur. Two anchors are too few to justify a
 * disclosure menu, so below `md` they are dropped rather than hidden behind a
 * button that would cost a client component. The CTA stays at every width.
 */
const SECTIONS = [
  { href: "#how", label: "how it works" },
  { href: "#trust", label: "before you connect" },
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-rule-strong bg-paper">
      <div className="mx-auto flex h-14 w-full max-w-[78rem] items-center gap-4 px-4">
        <Link
          href="/"
          className="rounded-[3px]"
          aria-label="GitPilot — home"
        >
          <LandingBrand />
        </Link>

        <nav aria-label="Sections" className="ml-2 hidden md:block">
          <ul className="flex items-center gap-5">
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

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <GithubCta size="sm">Sign in</GithubCta>
        </div>
      </div>
    </header>
  );
}
