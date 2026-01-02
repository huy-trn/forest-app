"use client";

import { InvestorDashboard } from "@/components/InvestorDashboard";
import type { User } from "@/types/user";

export function InvestorDashboardClient({ user, locale }: { user: User; locale: string }) {
  return (
    <InvestorDashboard
      user={user}
      locale={locale}
      onLogout={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = `/${locale}/login`;
      }}
    />
  );
}
