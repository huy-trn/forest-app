import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth-helpers";

const supportedLocales = ["en", "vi"] as const;
const fallbackLocale = "en";

function normalizeLocale(locale: string | undefined) {
  if (!locale) return fallbackLocale;
  const base = locale.toLowerCase().split("-")[0];
  return (supportedLocales as readonly string[]).includes(base) ? base : fallbackLocale;
}

export default async function LocaleHomePage({ params }: { params: { locale: string } }) {
  const locale = normalizeLocale(params.locale);
  const user = await getUserFromCookies();

  if (!user) redirect(`/${locale}/login`);

  const role = user.role;
  if (role === "admin") redirect(`/${locale}/admin`);
  if (role === "partner") redirect(`/${locale}/partner`);
  if (role === "investor") redirect(`/${locale}/investor`);

  redirect(`/${locale}/login`);
}
