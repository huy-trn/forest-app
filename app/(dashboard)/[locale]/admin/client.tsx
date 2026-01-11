"use client";

import { AdminDashboard } from "@/components/AdminDashboard";
import type { User } from "@/types/user";
import { signOut } from "next-auth/react";

export function AdminDashboardClient({ user, locale }: { user: User; locale: string }) {
  return (
    <AdminDashboard
      user={user}
      locale={locale}
      onLogout={async () => {
        await signOut({ redirect: false });
        window.location.href = `/${locale}/login`;
      }}
    />
  );
}
