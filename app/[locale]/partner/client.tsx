"use client";

import { PartnerDashboard } from "@/components/PartnerDashboard";
import type { User } from "@/types/user";

export function PartnerDashboardClient({ user, locale }: { user: User; locale: string }) {
  return (
    <PartnerDashboard
      user={user}
      onLogout={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = `/${locale}/login`;
      }}
    />
  );
}
