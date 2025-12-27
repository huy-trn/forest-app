import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PartnerDashboardClient } from "./client";

export default async function PartnerPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "partner" && session.user.role !== "admin") redirect("/");

  return (
    <PartnerDashboardClient
      user={{
        id: session.user.id,
        name: session.user.name ?? "Partner",
        email: session.user.email ?? "",
        phone: session.user.phone ?? "",
        role: "partner",
      }}
    />
  );
}
