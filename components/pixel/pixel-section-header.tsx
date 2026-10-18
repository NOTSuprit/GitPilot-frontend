import { cn } from "@/lib/utils";

/**
 * Page/section header: a small pixel label, a pixel display title, an
 * optional description, and an actions slot, over a 2px rule.
 */
export function PixelSectionHeader({
  as: Heading = "h2",
  label,
  title,
  description,
  actions,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  label?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      data-slot="pixel-section-header"
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b-2 border-rule-strong pb-3",
        className
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {label ? <p className="pixel-label text-ink-faint">{label}</p> : null}
        <Heading className="pixel-display text-2xl text-foreground">
          {title}
        </Heading>
        {description ? (
          <p className="max-w-prose text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
