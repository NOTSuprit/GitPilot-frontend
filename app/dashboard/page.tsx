"use client";

import { RepoDashboard } from "@/components/dashboard/repo-dashboard";
import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/providers/require-auth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <AppShell crumb="repositories">
        <RepoDashboard />
      </AppShell>
    </RequireAuth>
  );
}
