"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DevPilotIcon } from "@/components/icons/devpilot-icon";
import { AccountMenu } from "@/components/layout/account-menu";
import { Micro } from "@/components/layout/listing";
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
 * The nav rail is the desk; the inset panel is the sheet of paper on it. Active
 * nav items are marked with a 2px `live` bar in their own left gutter — the same
 * gesture the citation gutter uses in chat, so "you are here" and "this line is
 * cited" read as one language.
 */
const NAV_ITEM_CLASS =
  "relative font-mono text-[0.8125rem] tracking-tight before:absolute before:inset-y-1.5 before:left-0 before:w-[2px] before:rounded-full before:bg-transparent data-active:before:bg-live group-data-[collapsible=icon]:before:hidden";

export function AppShell({
  children,
  crumb,
  actions,
}: {
  children: React.ReactNode;
  /** Where you are, shown in the bar as `devpilot / <crumb>`. Not a heading — the page owns its `<h1>`. */
  crumb?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                render={<Link href="/dashboard" />}
                tooltip="devPilot"
                className="gap-2.5"
              >
                <DevPilotIcon className="size-7 rounded-[6px]" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-mono text-sm font-semibold tracking-tight">
                    devPilot
                  </span>
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
              <SidebarGroupLabel className="label-mono text-ink-faint">
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
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
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
    <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-1.5 border-b border-rule bg-background/85 px-2.5 backdrop-blur-sm md:rounded-t-xl">
      <SidebarTrigger className="text-ink-soft" />
      <Separator orientation="vertical" className="mx-0.5 !h-4 bg-rule" />
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
      <Micro className="text-ink-faint">devpilot</Micro>
      {crumb && (
        <>
          <span aria-hidden className="label-mono mx-1.5 text-rule-strong">
            /
          </span>
          <Micro className="text-ink">{crumb}</Micro>
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
      <DevPilotIcon className="size-7 rounded-[6px]" />
      <span className="grid leading-tight">
        <span className="font-mono text-sm font-semibold tracking-tight">
          devPilot
        </span>
        {showTagline && (
          <span className="label-mono text-ink-faint">
            repo → index → answer
          </span>
        )}
      </span>
    </span>
  );
}
