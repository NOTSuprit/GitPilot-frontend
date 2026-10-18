import { GitHubIcon } from "@/components/icons/github-icon";
import { Button } from "@/components/ui/button";
import { getGithubLoginUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

/**
 * Every sign-in affordance on the landing page and /login routes through here,
 * and here routes through `getGithubLoginUrl()`. That points at the backend's
 * `/oauth2/authorization/github`, which redirects to GitHub and ultimately
 * returns to `/auth/callback`. There is no second auth path, and no
 * client-side auth logic: it is a plain link, so it works before any
 * JavaScript has loaded.
 */
export function GithubCta({
  children = "Connect with GitHub",
  size = "lg",
  className,
  variant = "pixel",
}: {
  children?: React.ReactNode;
  size?: "sm" | "default" | "lg";
  className?: string;
  variant?: "default" | "outline" | "ghost" | "pixel" | "pixel-outline";
}) {
  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      nativeButton={false}
      render={<a href={getGithubLoginUrl()} />}
    >
      <GitHubIcon
        data-icon="inline-start"
        className={cn(size === "sm" ? "size-3.5" : "size-4")}
      />
      {children}
    </Button>
  );
}
