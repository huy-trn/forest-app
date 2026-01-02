"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

type Props = {
  href: string;
  kind: "dashboard" | "login";
  className?: string;
};

export function AuthLink({ href, kind, className }: Props) {
  const { t } = useTranslation();
  const label = kind === "dashboard" ? t("investor.dashboard.title") : t("login.signIn");
  return (
    <Link href={href} className={className ?? "text-sm text-green-700 hover:text-green-900 font-medium"}>
      {label}
    </Link>
  );
}
