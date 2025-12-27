"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Login } from "@/components/Login";
import "@/i18n";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError("Invalid credentials");
      return;
    }

    // Fetch session to decide where to go
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;
    if (role === "admin") router.replace("/admin");
    else if (role === "partner") router.replace("/partner");
    else if (role === "investor") router.replace("/investor");
    else router.replace("/");
  };

  return <Login onLogin={handleLogin} loading={loading} error={error} />;
}
