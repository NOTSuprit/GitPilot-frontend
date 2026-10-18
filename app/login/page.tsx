"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { GithubCta } from "@/components/landing/github-cta";
import { LandingBrand } from "@/components/landing/landing-brand";
import { LoginWorkflow } from "@/components/login/login-workflow";
import {
  PixelGridBackground,
  PixelPanel,
  PixelTerminalLabel,
} from "@/components/pixel";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/hooks/use-auth";

function LoginLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="flex items-center gap-2.5 border-l-2 border-live pl-3">
        <Spinner className="size-3.5 text-live" />
        <span className="label-mono text-ink-soft">checking session</span>
      </div>
    </div>
  );
}

function LoginContent() {
  const params = useSearchParams();
  const router = useRouter();
  const error = params.get("error");
  const next = params.get("next") || "/dashboard";
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(next.startsWith("/") ? next : "/dashboard");
    }
  }, [user, isLoading, next, router]);

  return (
    <div className="relative isolate flex min-h-svh flex-col">
      <PixelGridBackground variant="grid" fade="edges" className="opacity-50" />

      <header className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-rule-strong bg-paper px-4">
        <Link href="/" className="rounded-[3px]" aria-label="GitPilot — home">
          <LandingBrand />
        </Link>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </header>

      <main
        id="main"
        className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-4 py-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12"
      >
        <PixelPanel raised studs className="p-6">
          <PixelTerminalLabel cursor>auth · github oauth</PixelTerminalLabel>
          <h1 className="pixel-display mt-3 text-3xl text-foreground">
            Sign in to GitPilot
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            GitPilot indexes a GitHub repository and answers your questions
            from the source-code chunks it retrieves, citing the files and line
            ranges behind every answer.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 border-2 border-fault bg-fault-tint px-3 py-2.5"
            >
              <p className="pixel-label text-fault">sign-in failed</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground">
                GitHub did not return a usable session. Try again.
              </p>
            </div>
          )}

          <div className="mt-6">
            <GithubCta className="w-full">Connect with GitHub</GithubCta>
          </div>

          <dl className="mt-6 border-t-2 border-rule">
            {(
              [
                ["scopes", "repo · read:user"],
                ["github access", "read requests only"],
                ["stored", "encrypted token, chunks + embeddings"],
              ] as const
            ).map(([term, value]) => (
              <div
                key={term}
                className="flex items-baseline justify-between gap-3 border-b border-rule py-2"
              >
                <dt className="label-mono text-ink-faint">{term}</dt>
                <dd className="data-mono text-right text-xs text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            GitHub’s <span className="data-mono">repo</span> scope can read and
            write repositories and has no read-only form. GitPilot’s own code
            only issues read requests.
          </p>
        </PixelPanel>

        <LoginWorkflow />
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
