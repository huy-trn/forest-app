import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trees } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { PhoneInput } from "./ui/phone-input";

interface LoginProps {
  onLogin: (identifier: string, password: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function Login({ onLogin, loading, error }: LoginProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = mode === "phone" ? phone.trim() : identifier.trim();
    if (id && password) {
      onLogin(id, password);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.25),_transparent_55%),radial-gradient(circle_at_15%_80%,_rgba(14,116,144,0.18),_transparent_50%),linear-gradient(120deg,_#f8fafc,_#ecfeff)]">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-emerald-300/40 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
          <div className="grid w-full gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 text-slate-900">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Forest OS
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                {t("login.title")}
              </h1>
              <p className="text-lg text-slate-600">
                Centralize projects, coordinate field teams, and keep investors aligned in one living dashboard.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live project tracking
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Secure multi-role access
                </div>
              </div>
            </div>

            <Card className="w-full max-w-md border-white/60 bg-white/80 shadow-[var(--shadow-soft)] backdrop-blur">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg">
                    <Trees className="w-9 h-9 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error ? (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                  {mode === "email" ? (
                    <div className="space-y-2">
                      <Label htmlFor="identifier">{t("login.email")}</Label>
                      <Input
                        id="identifier"
                        type="text"
                        placeholder={t("login.emailPlaceholder")}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                      />
                      <div className="w-full text-right">
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 h-auto text-sm text-emerald-700"
                          onClick={() => setMode("phone")}
                        >
                          {t("login.loginWithPhone")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <PhoneInput
                        label={t("login.phone")}
                        value={phone}
                        onChange={setPhone}
                        placeholder={t("login.phonePlaceholder")}
                      />
                      <div className="w-full text-right">
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 h-auto text-sm text-emerald-700"
                          onClick={() => setMode("email")}
                        >
                          {t("login.loginWithEmail")}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("login.password") ?? "Password"}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t("login.loading") ?? "Signing in..." : t("login.signIn")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
