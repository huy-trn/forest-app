import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth-helpers";
import { AdminDashboardClient } from "./client";

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || "en";
  const user = await getUserFromCookies();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "admin") redirect(`/${locale}`);

  return (
    <AdminDashboardClient
      locale={locale}
      user={{
        id: user.sub,
        name: user.name ?? "Admin",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: "admin",
      }}
    />
  );
}
