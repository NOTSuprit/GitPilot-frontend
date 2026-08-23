"use client";

import { SettingsDashboard } from "@/components/dashboard/settings-dashboard";
import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/providers/require-auth";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <AppShell crumb="settings">
        <SettingsDashboard />
      </AppShell>
    </RequireAuth>
  );
}
