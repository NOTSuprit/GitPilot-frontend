"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GitPilotIcon } from "@/components/icons/gitpilot-icon";
import { AccountMenu } from "@/components/layout/account-menu";
import { PixelGridBackground, PixelWordmark } from "@/components/pixel";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { dashboardNavGroups, isDashboardNavActive } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

/**
 * The nav rail is a ruled strip down the left edge; the content sits on a faint
 * pixel grid. Active nav items get a raised field and a 3px `live` marker in
 * their own left gutter — the same gesture the citation gutter uses in chat, so
 * "you are here" and "this line is cited" read as one language. On mobile the
 * rail becomes an off-canvas sheet opened from the bar's trigger.
 */
const NAV_ITEM_CLASS =
  "relative rounded-[2px] font-mono text-[0.8125rem] tracking-tight before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:bg-transparent data-active:bg-sidebar-accent data-active:before:bg-live group-data-[collapsible=icon]:before:hidden";

export function AppShell({
  children,
  crumb,
  actions,
}: {
  children: React.ReactNode;
  /** Where you are, shown in the bar as `gitpilot / <crumb>`. Not a heading — the page owns its `<h1>`. */
  crumb?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r-2 border-rule-strong">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={<Link href="/dashboard" />}
                tooltip="GitPilot"
                className="gap-2.5"
              >
                <GitPilotIcon className="size-7 rounded-[3px]" />
                <div className="grid flex-1 text-left leading-tight">
                  <PixelWordmark className="truncate text-lg" />
                  <span className="label-mono truncate text-ink-faint">
                    repo → index → answer
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {dashboardNavGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="pixel-label text-ink-faint">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isDashboardNavActive(
                          pathname,
                          item.href,
                          item.exact
                        )}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                        className={NAV_ITEM_CLASS}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <AccountMenu shape="rail" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <AppBar crumb={crumb} actions={actions} />
        <div className="relative isolate flex min-w-0 flex-1 flex-col">
          <PixelGridBackground
            variant="grid"
            fade="bottom"
            className="opacity-40"
          />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * A single 44px bar. It always renders — the sidebar trigger is the only way
 * back to nav on mobile, so hiding the bar per-page is not an option.
 */
function AppBar({
  crumb,
  actions,
}: {
  crumb?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-1.5 border-b-2 border-rule-strong bg-background px-2.5">
      <SidebarTrigger className="text-ink-soft" />
      <Separator orientation="vertical" className="mx-0.5 !h-4 bg-rule-strong" />
      <Crumb crumb={crumb} />
      <div className="ml-auto flex items-center gap-1.5">
        {actions}
        <ModeToggle />
      </div>
    </header>
  );
}

function Crumb({ crumb }: { crumb?: string }) {
  return (
    <p className="min-w-0 truncate">
      <span className="pixel-label text-ink-faint">gitpilot</span>
      {crumb && (
        <>
          <span aria-hidden className="pixel-label mx-1.5 text-rule-strong">
            /
          </span>
          <span className="pixel-label text-ink">{crumb}</span>
        </>
      )}
    </p>
  );
}

/** Wordmark for the unauthenticated pages, which have no rail to hang it on. */
export function BrandMark({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <GitPilotIcon className="size-7 rounded-[3px]" />
      <span className="grid leading-tight">
        <PixelWordmark className="text-lg" />
        {showTagline && (
          <span className="label-mono text-ink-faint">
            repo → index → answer
          </span>
        )}
      </span>
    </span>
  );
}
