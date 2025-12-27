"use client";

import { signOut } from "next-auth/react";
import { AdminDashboard } from "@/components/AdminDashboard";
import type { User } from "@/types/user";

export function AdminDashboardClient({ user }: { user: User }) {
  return (
    <AdminDashboard
      user={user}
      onLogout={() => signOut({ callbackUrl: "/login" })}
    />
  );
}
