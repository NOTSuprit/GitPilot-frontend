import { PixelPipelineScene } from "@/components/landing/pixel-pipeline-scene";
import { PixelTerminal } from "@/components/landing/pixel-terminal";
import { PixelPanel } from "@/components/pixel";

const LEGEND = [
  { label: "repository", dot: "bg-live" },
  { label: "chunks", dot: "bg-vector" },
  { label: "embeddings", dot: "bg-ink-faint" },
  { label: "retrieval", dot: "bg-retrieve" },
  { label: "citations", dot: "bg-live" },
] as const;

/**
 * The hero plate: the drawn pipeline on the left, the terminal on the right,
 * and a real-text legend underneath. The frame is always "night" — the scene
 * uses the fixed scene palette — so it reads the same in both themes.
 */
export function HeroWorkbench({ className }: { className?: string }) {
  return (
    <figure className={className}>
      <PixelPanel raised studs className="bg-scene">
        <div className="grid items-center gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <PixelPipelineScene className="h-auto w-full" />
          <PixelTerminal className="mx-auto w-full max-w-sm lg:max-w-none" />
        </div>
      </PixelPanel>

      <figcaption className="mt-3 flex flex-col gap-2">
        <ol className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {LEGEND.map((item, i) => (
            <li key={item.label} className="flex items-center gap-2">
              <span aria-hidden className={`size-2 ${item.dot}`} />
              <span className="label-mono text-ink-soft">
                {String(i + 1).padStart(2, "0")} {item.label}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs leading-relaxed text-ink-faint">
          An illustration of the pipeline. The terminal shows an example of the
          shape of an answer, not your repository.
        </p>
      </figcaption>
    </figure>
  );
}
