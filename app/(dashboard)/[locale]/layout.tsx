import type { ReactNode } from "react";
import { LocaleInitializer } from "@/components/LocaleInitializer";

export default function DashboardLocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  return (
    <>
      <LocaleInitializer locale={params.locale} />
      {children}
    </>
  );
}
