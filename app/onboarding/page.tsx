"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectLng } from "@/components/ui/select-lng";
import { PhoneInput } from "@/components/ui/phone-input";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const token = searchParams.get("token") || "";
  const identifier = searchParams.get("identifier") || "";
  const isPhone = identifier.startsWith("+") || /^\d+$/.test(identifier);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier || !token) {
      setError(t("onboarding.missing"));
      return;
    }
    if (!password || password !== confirm) {
      setError(t("onboarding.mismatch"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, token, password, name }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t("onboarding.failed"));
      return;
    }
    setSuccess(true);
    setTimeout(() => router.replace("/login"), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <div className="absolute top-4 right-4">
        <SelectLng />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("onboarding.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
            {success ? (
              <Alert className="mb-4">
              <AlertDescription>{t("onboarding.success")}</AlertDescription>
            </Alert>
          ) : null}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>{isPhone ? t("onboarding.phone") : t("onboarding.email")}</Label>
              {isPhone ? (
                <PhoneInput value={identifier} onChange={() => {}} disabled />
              ) : (
                <Input value={identifier} disabled />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t("onboarding.name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("onboarding.name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("onboarding.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("onboarding.confirm")}</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("onboarding.loading", { defaultValue: "Saving..." }) : t("onboarding.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
