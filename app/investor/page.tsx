import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { InvestorDashboard } from "@/components/InvestorDashboard";
import { authOptions } from "@/lib/auth";
import "@/i18n";

export default async function InvestorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "investor" && session.user.role !== "admin") redirect("/");

  return (
    <InvestorDashboard
      user={{
        id: session.user.id,
        name: session.user.name ?? "Investor",
        email: session.user.email ?? "",
        phone: session.user.phone ?? "",
        role: "investor",
      }}
      onLogout={() => {}}
    />
  );
}
