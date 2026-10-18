"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

function initials(name: string | undefined) {
  const source = (name ?? "").trim();
  if (!source) return "GP";
  const parts = source.split(/\s+/);
  if (parts.length === 1) return source.slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * The account menu is the one piece of chrome that has to look identical in the
 * dashboard's sidebar footer and in the chat view's top bar, so it owns both
 * shapes: `rail` (avatar + name, full width) and `bar` (avatar only).
 */
export function AccountMenu({
  shape = "rail",
  className,
}: {
  shape?: "rail" | "bar";
  className?: string;
}) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const label = user?.displayName ?? "Account";
  const handle = user?.githubUsername;

  const avatar = (
    <Avatar className="size-6 rounded-[2px] border-2 border-rule-strong">
      <AvatarImage src={user?.avatarUrl ?? undefined} alt="" />
      <AvatarFallback className="label-mono rounded-[2px] bg-muted text-ink-soft">
        {initials(user?.displayName)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      {shape === "rail" ? (
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              size="lg"
              className={cn(
                "gap-2.5 data-[popup-open]:bg-sidebar-accent",
                className
              )}
              aria-label="Account menu"
            />
          }
        >
          {avatar}
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-mono text-xs font-semibold tracking-tight">
              {label}
            </span>
            {handle && (
              <span className="label-mono truncate text-ink-faint">
                @{handle}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          className={cn(
            "flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-accent",
            className
          )}
          aria-label="Account menu"
        >
          {avatar}
        </DropdownMenuTrigger>
      )}

      <DropdownMenuContent
        className="min-w-56"
        side={shape === "rail" ? "top" : "bottom"}
        align={shape === "rail" ? "start" : "end"}
        sideOffset={8}
      >
        <div className="flex items-center gap-2.5 px-1.5 py-2">
          {avatar}
          <div className="min-w-0">
            <p className="truncate font-mono text-xs font-semibold tracking-tight">
              {label}
            </p>
            <p className="label-mono flex items-center gap-1 text-ink-faint">
              <GitHubIcon className="size-3" aria-hidden />
              {handle ? `@${handle}` : "connected via github"}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="label-mono gap-2"
          render={<Link href="/dashboard/settings" />}
        >
          <Settings className="size-3.5 text-ink-faint" />
          settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="label-mono gap-2"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? (
            <Spinner className="size-3.5" />
          ) : (
            <LogOut className="size-3.5" />
          )}
          log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
