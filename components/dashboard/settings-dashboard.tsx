"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { GitHubIcon } from "@/components/icons/github-icon";
import { Data, Micro } from "@/components/layout/listing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

/**
 * Settings is a definition list, not a stack of cards: each section is a
 * mono gutter label with its rows to the right, separated by the same hairline
 * that runs through the rest of the listing.
 */
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-rule py-5 last:border-b-0 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="lg:pr-4">
        <Micro>{label}</Micro>
      </div>
      <div className="mt-3 lg:mt-0">{children}</div>
    </section>
  );
}

function Row({
  term,
  children,
  hint,
}: {
  term: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-rule py-2.5 last:border-b-0">
      <div className="min-w-0">
        <span className="font-mono text-[0.8125rem] leading-tight tracking-tight text-ink">
          {term}
        </span>
        {hint && (
          <p className="mt-0.5 text-[0.6875rem] leading-4 text-ink-faint">
            {hint}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

export function SettingsDashboard() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="mx-auto flex w-full max-w-[56rem] flex-1 flex-col p-4 md:p-6">
      <div className="border-b border-rule pb-3">
        <h1 className="font-mono text-lg leading-tight font-semibold tracking-tight">
          Settings
        </h1>
        <Data className="mt-0.5 block">
          profile, appearance, and session
        </Data>
      </div>

      <Section label="profile">
        <div className="flex items-center gap-3 border-b border-rule pb-3">
          {/* Avatar rather than a bare <img>: a dead or 403 GitHub avatar URL
              has to fall back to initials, not a broken-image glyph. */}
          <Avatar className="size-10 rounded-[4px] border border-rule">
            <AvatarImage src={user?.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="label-mono rounded-[4px] bg-muted text-ink-soft">
              {(user?.displayName ?? "DP").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-semibold tracking-tight">
              {user?.displayName ?? "—"}
            </p>
            <Data className="block truncate">
              @{user?.githubUsername ?? "—"}
            </Data>
          </div>
        </div>

        <Row term="display name">
          <Data className="text-ink">{user?.displayName ?? "—"}</Data>
        </Row>
        <Row term="github username">
          <Data className="text-ink">@{user?.githubUsername ?? "—"}</Data>
        </Row>
        <Row term="authentication">
          <span className="flex items-center gap-1.5">
            <GitHubIcon className="size-3.5 text-ink-soft" />
            <Data className="text-ink">oauth</Data>
          </span>
        </Row>
      </Section>

      <Section label="appearance">
        <Row
          term="dark mode"
          hint="Inverts the sheet: ink on paper becomes blueprint."
        >
          <Sun aria-hidden className="size-3.5 text-ink-faint" />
          <Switch
            id="dark-mode"
            aria-label="Dark mode"
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
          <Moon aria-hidden className="size-3.5 text-ink-faint" />
        </Row>
        <Row term="theme" hint={`Currently following “${theme ?? "system"}”.`}>
          <ModeToggle />
        </Row>
      </Section>

      <Section label="session">
        <Row
          term="log out"
          hint="Clears the local auth cookie and the cached repository index."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-fault hover:bg-fault-tint hover:text-fault"
          >
            {logout.isPending ? (
              <Spinner data-icon="inline-start" className="size-3.5" />
            ) : (
              <LogOut data-icon="inline-start" />
            )}
            Log out
          </Button>
        </Row>
      </Section>
    </div>
  );
}
