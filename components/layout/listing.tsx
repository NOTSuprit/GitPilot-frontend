import { cn } from "@/lib/utils";

/**
 * "The listing" — the shared vocabulary for every surface in the app.
 *
 * There is exactly one container (Panel) and it is defined by its rules, not
 * by a shadow or a dashed border. Content sits in a right-hand column; a
 * monospace Gutter on the left carries provenance and metadata. Everything
 * else in the product is composed from these pieces so the same grammar
 * appears on the dashboard, in settings, and in the chat thread.
 */

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "rounded-lg border border-rule bg-card text-card-foreground",
        className
      )}
      {...props}
    />
  );
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule px-4 py-3",
        className
      )}
      {...props}
    />
  );
}

function PanelTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="panel-title"
      className={cn(
        "font-mono text-sm leading-tight font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function PanelDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="panel-description"
      className={cn("text-xs leading-relaxed text-ink-soft", className)}
      {...props}
    />
  );
}

function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="panel-body" className={cn("p-4", className)} {...props} />
  );
}

/**
 * The gutter. Fixed character width so entries line up down the page like
 * line numbers, with the rule on its trailing edge.
 */
function Gutter({
  className,
  bordered = true,
  ...props
}: React.ComponentProps<"div"> & { bordered?: boolean }) {
  return (
    <div
      data-slot="gutter"
      className={cn(
        "shrink-0 pr-3 text-right",
        bordered && "border-r border-rule",
        className
      )}
      {...props}
    />
  );
}

/** Uppercase mono tag that names a gutter entry or a column. */
function Micro({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="micro"
      className={cn("label-mono text-ink-faint", className)}
      {...props}
    />
  );
}

/** Machine data: paths, branches, counts, timestamps. Tabular figures. */
function Data({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="data"
      className={cn("data-mono text-xs text-ink-soft", className)}
      {...props}
    />
  );
}

/** A `·`-joined run of metadata, so callers don't hand-place separators. */
function DataRun({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  const present = items.filter(Boolean);
  return (
    <span className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {present.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="text-rule-strong">·</span>}
          {item}
        </span>
      ))}
    </span>
  );
}

export {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelDescription,
  PanelBody,
  Gutter,
  Micro,
  Data,
  DataRun,
};
