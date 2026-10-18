import { cn } from "@/lib/utils";

/**
 * A CRT terminal in real HTML — the question, the retrieval line, the answer
 * and its citations are text, selectable and readable by assistive tech.
 *
 * The session is an EXAMPLE of the shape of a GitPilot answer. It is labelled
 * as such on the screen itself, and it does not describe the visitor's
 * repository.
 */
export function PixelTerminal({ className }: { className?: string }) {
  return (
    <div
      data-slot="pixel-terminal"
      className={cn("flex flex-col items-center", className)}
    >
      <div className="w-full border-4 border-scene-edge bg-scene-panel p-2 shadow-pixel">
        <div className="relative isolate overflow-hidden bg-scene p-3 font-mono text-xs leading-relaxed text-scene-ink">
          <div
            aria-hidden
            className="pixel-scanlines pointer-events-none absolute inset-0 -z-10"
          />

          <div className="flex items-center justify-between gap-2 border-b border-scene-edge pb-2">
            <span className="pixel-label text-scene-dim">gitpilot · session</span>
            <span className="pixel-label text-scene-work">example</span>
          </div>

          <p className="mt-3">
            <span aria-hidden className="text-scene-live">
              &gt;{" "}
            </span>
            how does a request get authenticated?
          </p>

          <p className="scene-s4 mt-2 text-scene-retrieve">
            <span aria-hidden>~ </span>retrieved the nearest chunks
          </p>

          <p className="scene-s5 mt-2 text-scene-ink">
            A filter reads the session cookie, resolves the user, and hands the
            request to the controller.
          </p>

          <ul className="scene-s5 mt-3 flex flex-col gap-1.5">
            {["src/auth/filter.ts:12–48", "src/auth/session.ts:5–31"].map(
              (cite) => (
                <li key={cite}>
                  <span className="inline-block border border-scene-retrieve px-1.5 py-0.5 text-[0.6875rem] text-scene-retrieve">
                    {cite}
                  </span>
                </li>
              )
            )}
          </ul>

          <p className="mt-3">
            <span aria-hidden className="text-scene-live">
              &gt;{" "}
            </span>
            <span aria-hidden className="caret-live" />
            <span className="sr-only">ready for the next question</span>
          </p>
        </div>
      </div>
      {/* stand and base */}
      <div aria-hidden className="h-3 w-10 bg-scene-edge" />
      <div aria-hidden className="h-1.5 w-28 bg-scene-edge" />
    </div>
  );
}
