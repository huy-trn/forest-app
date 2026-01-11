"use client";

import { PartnerDashboard } from "@/components/PartnerDashboard";
import type { User } from "@/types/user";
import { signOut } from "next-auth/react";

export function PartnerDashboardClient({ user, locale }: { user: User; locale: string }) {
  return (
    <PartnerDashboard
      user={user}
      locale={locale}
      onLogout={async () => {
        await signOut({ redirect: false });
        window.location.href = `/${locale}/login`;
      }}
    />
  );
}
