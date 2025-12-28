import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth-helpers";

const supportedLocales = ["en", "vi"] as const;
const fallbackLocale = "en";

function detectLocale(): string {
  const acceptLanguage = headers().get("accept-language");
  if (!acceptLanguage) return fallbackLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim()?.toLowerCase())
    .filter(Boolean)
    .map((locale) => locale.split("-")[0]);

  return candidates.find((locale) => supportedLocales.includes(locale as typeof supportedLocales[number])) ?? fallbackLocale;
}

export default async function HomePage() {
  const locale = detectLocale();
  const user = await getUserFromCookies();
  if (!user) redirect(`/${locale}/login`);

  const role = user.role;
  if (role === "admin") redirect(`/${locale}/admin`);
  if (role === "partner") redirect(`/${locale}/partner`);
  if (role === "investor") redirect(`/${locale}/investor`);

  redirect(`/${locale}/login`);
}
