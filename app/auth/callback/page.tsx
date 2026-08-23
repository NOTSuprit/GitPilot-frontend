"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Micro } from "@/components/layout/listing";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/hooks/use-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: user, isLoading, isError, isFetched } = useCurrentUser();

  useEffect(() => {
    if (!isFetched || isLoading) return;

    if (user) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login?error=session");
  }, [user, isLoading, isFetched, isError, router]);

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="border-l-2 border-live pl-3">
        <div className="flex items-center gap-2.5">
          <Spinner className="size-3.5 text-live" />
          <Micro className="text-ink-soft">finishing github sign-in</Micro>
        </div>
        <p className="mt-1 text-[0.6875rem] leading-4 text-ink-faint">
          Exchanging the callback code for a session.
        </p>
      </div>
    </div>
  );
}
