"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signIn, getSession } from "next-auth/react";
import { Login } from "@/components/Login";
import "@/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: identifier,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError(res.error === "PASSWORD_RESET_REQUIRED" ? t("login.resetRequired", { defaultValue: "Complete onboarding first." }) : t("login.invalid", { defaultValue: "Invalid credentials" }));
      return;
    }

    // Read session to decide where to go
    const session = await getSession();
    const role = session?.user?.role;
    if (role === "admin") router.replace("/admin");
    else if (role === "partner") router.replace("/partner");
    else if (role === "investor") router.replace("/investor");
    else router.replace("/");
  };

  return <Login onLogin={handleLogin} loading={loading} error={error} />;
}
