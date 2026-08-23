import { Capabilities } from "@/components/landing/capabilities";
import { FinalCta } from "@/components/landing/final-cta";
import { GithubCta } from "@/components/landing/github-cta";
import { HeroFigure } from "@/components/landing/hero-figure";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNav } from "@/components/landing/landing-nav";
import { PipelineLedger } from "@/components/landing/pipeline-ledger";
import { Micro } from "@/components/layout/listing";

/**
 * The public landing page.
 *
 * This is a Server Component and stays one. The only client JavaScript the page
 * ships is the theme toggle and the hero figure — and the figure's Three.js is
 * behind `next/dynamic({ ssr: false })`, so the headline, the copy and the
 * GitHub CTA are all server-rendered HTML that work before any script arrives.
 * The CTA in particular is a plain `<a>`: sign-in does not depend on hydration.
 *
 * Structure follows the app's own "listing" grammar — an 11rem monospace gutter
 * naming each section, a hairline separating it from the measure, and rules
 * instead of cards for every division. It should read as the same product as
 * the dashboard, shot on a longer lens.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingNav />

      <main id="main" className="flex-1">
        {/* ---------------------------------------------------------- hero --- */}
        <section
          aria-labelledby="hero-heading"
          className="mx-auto w-full max-w-[78rem] px-4 pt-10 pb-14 md:pt-16 md:pb-20"
        >
          <div className="lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
            <div className="lg:border-r lg:border-rule lg:pr-4">
              <Micro>grounded code assistant</Micro>
            </div>

            <div className="mt-4 lg:mt-0 lg:pl-6">
              <h1
                id="hero-heading"
                className="max-w-3xl font-mono text-[1.75rem] leading-[1.12] font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]"
              >
                Ask your codebase a question.
                <br className="hidden sm:block" />{" "}
                <span className="text-ink-soft">
                  Get the lines that answer it.
                </span>
              </h1>

              <p className="mt-5 max-w-[46rem] text-sm leading-relaxed text-ink-soft sm:text-base">
                GitPilot indexes a GitHub repository into a vector store, then
                answers from the chunks it retrieves — never from memory of the
                internet. Every response arrives with the file paths and line
                ranges it was built from, each one a link into your default
                branch.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
                <GithubCta />
                <span className="label-mono text-ink-soft">
                  read-only access · no writes to your repositories
                </span>
              </div>
            </div>
          </div>

          {/* The figure gets the full measure — it is the argument, not a
              garnish beside the copy. */}
          <div className="mt-10 md:mt-14">
            <HeroFigure />
          </div>
        </section>

        <div className="mx-auto w-full max-w-[78rem] px-4">
          <HowItWorks />
          <PipelineLedger />
          <Capabilities />
          <FinalCta />
        </div>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex w-full max-w-[78rem] flex-wrap items-center justify-between gap-3 px-4 py-5">
          <Micro>gitpilot · repo → index → answer</Micro>
          <Micro className="text-rule-strong">
            end of page
          </Micro>
        </div>
      </footer>
    </div>
  );
}
