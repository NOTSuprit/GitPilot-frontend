import Link from "next/link";

import { PixelEmptyState, PixelGridBackground } from "@/components/pixel";
import { Button } from "@/components/ui/button";

/** Unknown route. Server-rendered, no data, nothing to fail. */
export default function NotFound() {
  return (
    <main
      id="main"
      className="relative isolate flex min-h-svh items-center justify-center px-4"
    >
      <PixelGridBackground variant="grid" fade="edges" className="opacity-50" />
      <div className="w-full max-w-lg">
        <PixelEmptyState
          as="h1"
          title="404 · page not found"
          description="That address doesn’t exist in GitPilot. Check the URL, or head back to somewhere that does."
        >
          <Button
            variant="pixel"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Go home
          </Button>
          <Button
            variant="pixel-outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Repositories
          </Button>
        </PixelEmptyState>
      </div>
    </main>
  );
}
