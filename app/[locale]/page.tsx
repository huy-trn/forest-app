import Link from "next/link";
import { getUserFromCookies } from "@/lib/auth-helpers";
import { PublicShowcase } from "@/components/investor/PublicShowcase";
import { getShowcaseContent } from "@/lib/showcase-service";
import { AuthLink } from "@/components/dashboard/AuthLink";

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
  const showcase = await getShowcaseContent(locale);

  const dashboardPath =
    user?.role === "admin"
      ? `/${locale}/admin`
      : user?.role === "partner"
        ? `/${locale}/partner`
        : user?.role === "investor"
          ? `/${locale}/investor`
          : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex justify-end">
          {dashboardPath ? (
            <AuthLink href={dashboardPath} kind="dashboard" />
          ) : (
            <AuthLink href={`/${locale}/login`} kind="login" />
          )}
        </div>
        <PublicShowcase locale={locale} content={showcase} />
      </div>
    </div>
  );
}
