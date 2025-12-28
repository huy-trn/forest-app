"use client";

import { AdminDashboard } from "@/components/AdminDashboard";
import type { User } from "@/types/user";

export function AdminDashboardClient({ user, locale }: { user: User; locale: string }) {
  return (
    <AdminDashboard
      user={user}
      onLogout={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = `/${locale}/login`;
      }}
    />
  );
}
