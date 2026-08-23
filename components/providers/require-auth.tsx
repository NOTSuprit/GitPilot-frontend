"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="flex items-center gap-2.5 border-l-2 border-live pl-3">
          <Spinner className="size-3.5 text-live" />
          <span className="label-mono text-ink-soft">opening workspace</span>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return <>{children}</>;
}
