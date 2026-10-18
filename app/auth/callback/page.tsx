"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  PixelGridBackground,
  PixelPanel,
  PixelProgress,
  PixelTerminalLabel,
} from "@/components/pixel";
import { useCurrentUser } from "@/hooks/use-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: user, isLoading, isError, isFetched } = useCurrentUser();

  useEffect(() => {
    if (!isFetched || isLoading) return;

    if (user) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login?error=session");
  }, [user, isLoading, isFetched, isError, router]);

  // By the time GitHub sends the browser here the backend has already
  // exchanged the code and set the session cookie. All that is left to do is
  // ask `/api/auth/me` whether that session is real, so that is all this
  // screen says it is doing.
  const noSession = isFetched && !isLoading && !user;

  return (
    <main
      id="main"
      className="relative isolate flex min-h-svh items-center justify-center px-4"
    >
      <PixelGridBackground variant="grid" fade="edges" className="opacity-50" />

      <PixelPanel
        raised
        studs
        role="status"
        aria-live="polite"
        className="w-full max-w-md p-6"
      >
        <PixelTerminalLabel cursor>auth · github callback</PixelTerminalLabel>
        <h1 className="pixel-display mt-3 text-2xl text-foreground">
          Finishing sign-in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {noSession
            ? "No session was found. Taking you back to sign in…"
            : "Checking your session with GitPilot…"}
        </p>

        {/* Unknown duration, so an indeterminate bar rather than a percentage. */}
        <PixelProgress
          value={null}
          tone="live"
          label="Checking your session"
          className="mt-5"
        />

        <p className="mt-4 text-[0.6875rem] leading-4 text-ink-faint">
          If nothing happens,{" "}
          <Link
            href="/login"
            className="rounded-[3px] text-foreground underline underline-offset-4 hover:text-live"
          >
            return to sign in
          </Link>
          .
        </p>
      </PixelPanel>
    </main>
  );
}
