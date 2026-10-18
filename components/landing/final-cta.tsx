import { GithubCta } from "@/components/landing/github-cta";
import { PixelPanel, PixelTerminalLabel } from "@/components/pixel";

/** The closing ask: one sentence, one button. The terms live in TrustPanel. */
export function FinalCta() {
  return (
    <section aria-labelledby="start-heading" className="pb-16 md:pb-24">
      <PixelPanel tone="live" raised studs className="px-6 py-10 sm:px-10">
        <PixelTerminalLabel cursor>ready when you are</PixelTerminalLabel>
        <h2
          id="start-heading"
          className="pixel-display mt-3 max-w-2xl text-3xl text-balance text-foreground sm:text-4xl"
        >
          Ask the question you would otherwise have to grep for.
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
          Connect GitHub, pick a repository, and start the index. Your first
          answer arrives with its sources attached.
        </p>
        <div className="mt-6">
          <GithubCta />
        </div>
      </PixelPanel>
    </section>
  );
}
