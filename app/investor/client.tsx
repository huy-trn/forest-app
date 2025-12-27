"use client";

import { signOut } from "next-auth/react";
import { InvestorDashboard } from "@/components/InvestorDashboard";
import type { User } from "@/types/user";

export function InvestorDashboardClient({ user }: { user: User }) {
  return (
    <InvestorDashboard
      user={user}
      onLogout={() => signOut({ callbackUrl: "/login" })}
    />
  );
}
