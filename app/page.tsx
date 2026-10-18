import { FinalCta } from "@/components/landing/final-cta";
import { GithubCta } from "@/components/landing/github-cta";
import { HeroWorkbench } from "@/components/landing/hero-workbench";
import { LandingNav } from "@/components/landing/landing-nav";
import { PipelineSteps } from "@/components/landing/pipeline-steps";
import { TrustPanel } from "@/components/landing/trust-panel";
import { PixelGridBackground, PixelTerminalLabel } from "@/components/pixel";

/**
 * The public landing page. A Server Component: the headline, copy, trust note
 * and CTA are all server-rendered HTML, and the illustration is script-free
 * SVG with a CSS-only loop. The CTA is a plain `<a>`, so sign-in does not
 * depend on hydration.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingNav />

      <main id="main" className="flex-1">
        <section
          aria-labelledby="hero-heading"
          className="relative isolate overflow-hidden"
        >
          <PixelGridBackground variant="grid" fade="bottom" className="opacity-50" />

          <div className="mx-auto w-full max-w-[78rem] px-4 pt-12 pb-14 md:pt-20 md:pb-20">
            <PixelTerminalLabel>repo → index → answer</PixelTerminalLabel>

            <h1
              id="hero-heading"
              className="pixel-display mt-4 max-w-4xl text-[2.5rem] text-balance text-foreground sm:text-6xl lg:text-7xl"
            >
              Your codebase.{" "}
              <span className="text-vector">Mapped.</span>{" "}
              <span className="text-live">Searchable.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              GitPilot indexes a GitHub repository you connect, then answers
              your questions from the source-code chunks it retrieves — each
              answer cited to the files and line ranges it came from.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <GithubCta />
              <p className="max-w-md text-xs leading-relaxed text-ink-soft">
                Uses GitHub’s <span className="data-mono">repo</span> scope,
                which GitHub doesn’t offer read-only. GitPilot only makes read
                requests.{" "}
                <a
                  href="#trust"
                  className="rounded-[3px] text-foreground underline underline-offset-4 hover:text-live"
                >
                  Exactly what that means
                </a>
              </p>
            </div>

            <HeroWorkbench className="mt-12 md:mt-16" />
          </div>
        </section>

        <div className="mx-auto w-full max-w-[78rem] px-4">
          <PipelineSteps />
          <TrustPanel />
          <FinalCta />
        </div>
      </main>

      <footer className="border-t-2 border-rule-strong">
        <div className="mx-auto flex w-full max-w-[78rem] flex-wrap items-center justify-between gap-3 px-4 py-5">
          <span className="pixel-label text-ink-faint">
            gitpilot · repo → index → answer
          </span>
        </div>
      </footer>
    </div>
  );
}
