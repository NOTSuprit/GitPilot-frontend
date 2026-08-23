"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { BrandMark } from "@/components/layout/app-shell";
import { Data, Micro } from "@/components/layout/listing";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/hooks/use-auth";
import { getGithubLoginUrl } from "@/lib/api";

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
    <div className="flex min-h-svh flex-col">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-rule px-4">
        <Link href="/" className="rounded-[3px]">
          <BrandMark />
        </Link>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="border-b border-rule pb-3">
            <Micro>authenticate</Micro>
            <h1 className="mt-1.5 font-mono text-lg leading-tight font-semibold tracking-tight">
              Sign in to devPilot
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              GitHub is the only identity here — the same token that lists your
              repositories is the one that reads them for indexing.
            </p>
          </div>

          {error && (
            <div className="mt-4 border-l-2 border-fault bg-fault-tint/60 px-3 py-2.5">
              <Micro className="text-fault">sign-in failed</Micro>
              <p className="mt-1 text-xs leading-relaxed text-ink">
                GitHub did not return a usable session. Try again.
              </p>
            </div>
          )}

          <div className="mt-5">
            <Button
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<a href={getGithubLoginUrl()} />}
            >
              <GitHubIcon data-icon="inline-start" className="size-4" />
              Continue with GitHub
            </Button>
          </div>

          <dl className="mt-6 border-t border-rule">
            {[
              ["scope", "repo · read:user"],
              ["writes", "none"],
              ["stored", "chunks + embeddings"],
            ].map(([term, value]) => (
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
