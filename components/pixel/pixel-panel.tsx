import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pixelPanelVariants = cva(
  "relative border-2 text-card-foreground",
  {
    variants: {
      tone: {
        default: "border-rule-strong bg-card",
        sunken: "border-rule bg-paper-sunken",
        live: "border-live bg-card",
        work: "border-work bg-card",
        fault: "border-fault bg-card",
        vector: "border-vector bg-card",
        retrieve: "border-retrieve bg-card",
      },
      raised: {
        true: "shadow-pixel",
        false: "",
      },
      studs: {
        true: "pixel-corners",
        false: "",
      },
    },
    defaultVariants: { tone: "default", raised: false, studs: false },
  }
);

/**
 * The pixel container: a 2px edge, optional hard offset shadow, optional
 * corner studs. Compose it with Panel's PanelHeader / PanelBody / Gutter from
 * `@/components/layout/listing` — those parts are unchanged.
 */
export function PixelPanel({
  className,
  tone,
  raised,
  studs,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof pixelPanelVariants>) {
  return (
    <div
      data-slot="pixel-panel"
      className={cn(pixelPanelVariants({ tone, raised, studs }), className)}
      {...props}
    />
  );
}

export { pixelPanelVariants };
