import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth-helpers";
import { PartnerDashboardClient } from "./client";

export default async function PartnerPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || "en";
  const user = await getUserFromCookies();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "partner" && user.role !== "admin") redirect(`/${locale}`);

  return (
    <PartnerDashboardClient
      locale={locale}
      user={{
        id: user.sub,
        name: user.name ?? "Partner",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: "partner",
      }}
    />
  );
}
