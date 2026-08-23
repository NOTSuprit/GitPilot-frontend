"use client";

import * as React from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function noopSubscribe() {
  return () => {};
}

function hydrated() {
  return true;
}

function notHydrated() {
  return false;
}

const OPTIONS = [
  { value: "light", label: "light", icon: Sun },
  { value: "dark", label: "dark", icon: Moon },
  { value: "system", label: "system", icon: Monitor },
] as const;

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  // `theme` is only correct after hydration, so the checkmark is withheld on the
  // first paint rather than rendering a wrong one and correcting itself.
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    hydrated,
    notHydrated
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("relative text-ink-soft hover:text-ink", className)}
            aria-label="Change theme"
          >
            <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-36">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="label-mono gap-2"
          >
            <Icon className="size-3.5 text-ink-faint" />
            {label}
            {mounted && theme === value && (
              <Check className="ml-auto size-3.5 text-live" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
