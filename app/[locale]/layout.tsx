import { LocaleInitializer } from "@/components/LocaleInitializer";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <>
      <LocaleInitializer locale={params.locale} />
      {children}
    </>
  );
}
