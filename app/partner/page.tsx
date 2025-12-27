import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { PartnerDashboard } from "@/components/PartnerDashboard";
import { authOptions } from "@/lib/auth";
import "@/i18n";

export default async function PartnerPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "partner" && session.user.role !== "admin") redirect("/");

  return (
    <PartnerDashboard
      user={{
        id: session.user.id,
        name: session.user.name ?? "Partner",
        email: session.user.email ?? "",
        phone: session.user.phone ?? "",
        role: "partner",
      }}
      onLogout={() => {}}
    />
  );
}
