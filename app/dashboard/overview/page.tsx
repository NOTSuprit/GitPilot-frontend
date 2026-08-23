"use client";

import { OverviewDashboard } from "@/components/dashboard/overview-dashboard";
import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/providers/require-auth";

export default function OverviewPage() {
  return (
    <RequireAuth>
      <AppShell crumb="overview">
        <OverviewDashboard />
      </AppShell>
    </RequireAuth>
  );
}
