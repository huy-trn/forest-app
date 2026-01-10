"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Login } from "@/components/Login";
import "@/i18n";

export default function LoginPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locale = params.locale || "en";
  const localePrefix = `/${locale}`;

  const handleLogin = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t("login.invalid", { defaultValue: "Invalid credentials" }));
      return;
    }

    const data = await res.json().catch(() => ({} as any));
    // backend should set role in token; fallback to investor dashboard if missing
    const role: string | undefined = data?.role;
    let dest = `${localePrefix}/investor`;
    if (role === "admin" || role === "root") dest = `${localePrefix}/admin`;
    else if (role === "partner") dest = `${localePrefix}/partner`;
    else if (role === "investor") dest = `${localePrefix}/investor`;

    router.replace(dest);
  };

  return <Login onLogin={handleLogin} loading={loading} error={error} />;
}
