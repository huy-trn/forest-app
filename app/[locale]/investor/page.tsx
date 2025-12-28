import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth-helpers";
import { InvestorDashboardClient } from "./client";

export default async function InvestorPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || "en";
  const user = await getUserFromCookies();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "investor" && user.role !== "admin") redirect(`/${locale}`);

  return (
    <InvestorDashboardClient
      locale={locale}
      user={{
        id: user.sub,
        name: user.name ?? "Investor",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: "investor",
      }}
    />
  );
}
