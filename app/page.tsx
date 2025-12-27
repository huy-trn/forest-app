import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role === "admin") redirect("/admin");
  if (role === "partner") redirect("/partner");
  if (role === "investor") redirect("/investor");
  redirect("/login");
}
