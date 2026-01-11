"use client";

import { InvestorDashboard } from "@/components/InvestorDashboard";
import type { User } from "@/types/user";
import { signOut } from "next-auth/react";

export function InvestorDashboardClient({ user, locale }: { user: User; locale: string }) {
  return (
    <InvestorDashboard
      user={user}
      locale={locale}
      onLogout={async () => {
        await signOut({ redirect: false });
        window.location.href = `/${locale}/login`;
      }}
    />
  );
}
