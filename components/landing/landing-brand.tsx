import { GitPilotIcon } from "@/components/icons/gitpilot-icon";
import { PixelWordmark } from "@/components/pixel";
import { cn } from "@/lib/utils";

/** Icon + pixel wordmark, shared by the landing bar and the login screen. */
export function LandingBrand({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <GitPilotIcon className="size-7 rounded-[3px]" />
      <PixelWordmark className="text-xl" />
    </span>
  );
}
