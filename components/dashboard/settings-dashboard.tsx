"use client";

import { useSyncExternalStore } from "react";
import { ExternalLink, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Data } from "@/components/layout/listing";
import {
  PixelBadge,
  PixelPanel,
  PixelSectionHeader,
  PixelStateBadge,
} from "@/components/pixel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/**
 * Settings shows what is actually known and actually adjustable — nothing else.
 *
 *   account      read-only: the fields /api/auth/me returns
 *   connection   read-only: how this session was established
 *   appearance   the one real preference: theme, kept in this browser
 *   session      the one real action: log out
 *
 * There are no API-key, model, embedding or token controls, no save button,
 * no disconnect and no account deletion, because the backend has none of those.
 * Model, chunking and retrieval parameters live in the server's configuration.
 */
function SettingsPanel({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <PixelPanel className="shadow-pixel-sm">
      <div className="flex items-center justify-between gap-3 border-b-2 border-rule px-4 py-2.5">
        <h2 className="pixel-display text-base text-foreground">{title}</h2>
        {badge}
      </div>
      <div className="px-4">{children}</div>
    </PixelPanel>
  );
}

function Row({
  term,
  hint,
  children,
}: {
  term: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b border-rule py-3 last:border-b-0">
      <div className="min-w-0 sm:max-w-[60%]">
        <span className="font-mono text-[0.8125rem] leading-tight tracking-tight text-ink">
          {term}
        </span>
        {hint && (
          <p className="mt-0.5 text-[0.6875rem] leading-4 text-ink-faint">
            {hint}
          </p>
        )}
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

const THEMES = [
  { value: "light", label: "light", icon: Sun },
  { value: "dark", label: "dark", icon: Moon },
  { value: "system", label: "system", icon: Monitor },
] as const;

function noopSubscribe() {
  return () => {};
}

export function SettingsDashboard() {
  const { data: user, isLoading, isError } = useCurrentUser();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();

  // `theme` is only known after hydration; withhold the pressed state until
  // then instead of rendering a wrong one and correcting it.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  return (
    <div className="mx-auto flex w-full max-w-[56rem] flex-1 flex-col gap-6 p-4 md:p-6">
      <PixelSectionHeader
        as="h1"
        label="workspace"
        title="Settings"
        description="Your account details, how you are signed in, and how GitPilot looks on this device."
      />

      <SettingsPanel
        title="Account"
        badge={<PixelBadge tone="neutral">read-only</PixelBadge>}
      >
        {isLoading ? (
          <div className="flex items-center gap-3 py-4" aria-busy>
            <Skeleton className="size-12 rounded-none" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-none" />
              <Skeleton className="h-3 w-24 rounded-none" />
            </div>
          </div>
        ) : isError || !user ? (
          <p role="alert" className="py-4 text-xs leading-relaxed text-fault">
            Couldn’t load your account details. Reload the page, or sign in
            again.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-rule py-4">
              {/* Avatar rather than a bare <img>: a dead or 403 GitHub avatar
                  URL has to fall back to initials, not a broken-image glyph. */}
              <Avatar className="size-12 rounded-[2px] border-2 border-rule-strong">
                <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="label-mono rounded-[2px] bg-muted text-ink-soft">
                  {(user.displayName || user.githubUsername || "GP")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="pixel-display truncate text-lg text-foreground">
                  {user.displayName || user.githubUsername}
                </p>
                <Data className="block truncate">@{user.githubUsername}</Data>
              </div>
            </div>

            <Row term="display name">
              <Data className="truncate text-ink">{user.displayName || "—"}</Data>
            </Row>
            <Row term="github username">
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${user.githubUsername} on GitHub, new tab`}
                className="data-mono inline-flex items-center gap-1 text-xs text-ink underline underline-offset-4 hover:text-live"
              >
                @{user.githubUsername}
                <ExternalLink aria-hidden className="size-3" />
              </a>
            </Row>
            <Row term="github id">
              <Data className="tabular text-ink">{user.githubId}</Data>
            </Row>
            <p className="border-t border-rule py-3 text-[0.6875rem] leading-4 text-ink-faint">
              These come from your GitHub account when you sign in. To change
              them, edit your GitHub profile.
            </p>
          </>
        )}
      </SettingsPanel>

      <SettingsPanel
        title="Connection"
        badge={<PixelBadge tone="neutral">read-only</PixelBadge>}
      >
        <Row term="session">
          <PixelStateBadge state={user ? "authenticated" : "unauthenticated"} />
        </Row>
        <Row term="sign-in method" hint="Cookie-based session after GitHub login.">
          <Data className="text-ink">GitHub OAuth2</Data>
        </Row>
        <Row
          term="github scopes"
          hint="Requested at sign-in. GitHub’s repo scope can read and write repositories and has no read-only form; GitPilot’s own code only issues read requests."
        >
          <Data className="text-ink">repo · read:user</Data>
        </Row>
        <Row
          term="github token"
          hint="Stored encrypted on the server. It is never sent to this browser, so it cannot be shown here."
        >
          <Data className="text-ink-faint">not displayed</Data>
        </Row>
        <p className="border-t border-rule py-3 text-[0.6875rem] leading-4 text-ink-faint">
          To revoke GitPilot’s access to your GitHub account, do it in your
          GitHub account settings. Model, chunking and retrieval parameters are
          configured on the server and can’t be changed from the app.
        </p>
      </SettingsPanel>

      <SettingsPanel title="Appearance">
        <Row
          term="theme"
          hint={`Saved in this browser only${
            mounted && theme ? ` · currently “${theme}”` : ""
          }.`}
        >
          <div
            role="group"
            aria-label="Theme"
            className="inline-flex items-center gap-0.5 border-2 border-rule-strong bg-card p-0.5"
          >
            {THEMES.map(({ value, label, icon: Icon }) => {
              const active = mounted && theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "label-mono inline-flex h-7 items-center gap-1.5 px-2.5 transition-colors",
                    active
                      ? "bg-paper-field text-ink shadow-[inset_0_-2px_0_0_var(--ink)]"
                      : "text-ink-soft hover:bg-accent hover:text-ink"
                  )}
                >
                  <Icon aria-hidden className="size-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </Row>
      </SettingsPanel>

      <SettingsPanel title="Session">
        <Row
          term="log out"
          hint="Ends your GitPilot session and deletes its cookie. Your GitHub authorization stays in place until you revoke it on GitHub."
        >
          <Button
            variant="pixel-danger"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <Spinner data-icon="inline-start" className="size-3.5" />
            ) : (
              <LogOut data-icon="inline-start" />
            )}
            Log out
          </Button>
        </Row>
      </SettingsPanel>
    </div>
  );
}
