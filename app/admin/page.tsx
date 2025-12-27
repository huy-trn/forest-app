import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminDashboardClient } from "./client";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <AdminDashboardClient
      user={{
        id: session.user.id,
        name: session.user.name ?? "Admin",
        email: session.user.email ?? "",
        phone: session.user.phone ?? "",
        role: "admin",
      }}
    />
  );
}
