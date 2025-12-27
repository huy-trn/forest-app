"use client";

import { signOut } from "next-auth/react";
import { PartnerDashboard } from "@/components/PartnerDashboard";
import type { User } from "@/types/user";

export function PartnerDashboardClient({ user }: { user: User }) {
  return (
    <PartnerDashboard
      user={user}
      onLogout={() => signOut({ callbackUrl: "/login" })}
    />
  );
}
