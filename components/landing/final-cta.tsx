import { GithubCta } from "@/components/landing/github-cta";
import { Data, Micro } from "@/components/layout/listing";

/**
 * The closing ask. It repeats the grant terms rather than the sales pitch,
 * because the only thing standing between a developer and the product is
 * deciding whether to hand over read access — so the answer to that question
 * belongs next to the button, not in a policy page.
 */
const TERMS = [
  ["scope", "repo · read:user"],
  ["writes to your repos", "none"],
  ["stored", "chunks + embeddings"],
  ["revoke", "github settings, any time"],
];

export function FinalCta() {
  return (
    <section
      aria-labelledby="start-heading"
      className="border-t border-rule py-14 md:py-20"
    >
      <div className="lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="lg:border-r lg:border-rule lg:pr-4">
          <Micro>start</Micro>
        </div>

        <div className="mt-3 lg:mt-0 lg:pl-6">
          <h2
            id="start-heading"
            className="max-w-2xl font-mono text-xl leading-tight font-semibold tracking-tight text-balance sm:text-2xl"
          >
            Point it at a repository and ask it something you would have to grep
            for.
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">
            Sign in with GitHub, pick a repository, and start the index. The
            first answer arrives with its sources attached.
          </p>

          <div className="mt-6">
            <GithubCta>Continue with GitHub</GithubCta>
          </div>

          <dl className="mt-8 max-w-lg border-t border-rule">
            {TERMS.map(([term, value]) => (
              <div
                key={term}
                className="flex items-center justify-between gap-3 border-b border-rule py-2"
              >
                <dt>
                  <Micro>{term}</Micro>
                </dt>
                <dd>
                  <Data className="text-ink">{value}</Data>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
