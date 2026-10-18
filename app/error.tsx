"use client";

import Link from "next/link";

import { PixelEmptyState, PixelGridBackground } from "@/components/pixel";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary: anything that throws while rendering lands here
 * instead of on the framework's default screen. In production Next withholds
 * the real message from the browser, so only its digest — a reference to find
 * the server log entry — is shown.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main"
      className="relative isolate flex min-h-svh items-center justify-center px-4"
    >
      <PixelGridBackground variant="grid" fade="edges" className="opacity-50" />
      <div className="w-full max-w-lg">
        <PixelEmptyState
          as="h1"
          tone="fault"
          title="Something went wrong"
          description={
            <>
              This page hit an unexpected error.
              {error.digest && (
                <span className="data-mono mt-2 block text-[0.6875rem] text-ink-faint">
                  reference: {error.digest}
                </span>
              )}
            </>
          }
        >
          <Button variant="pixel-outline" size="sm" onClick={() => reset()}>
            Try again
          </Button>
          <Button
            variant="pixel-outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Go home
          </Button>
        </PixelEmptyState>
      </div>
    </main>
  );
}
