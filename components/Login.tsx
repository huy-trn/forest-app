import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trees } from "lucide-react";
import { SelectLng } from "./ui/select-lng";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="absolute top-4 right-4">
        <SelectLng />
      </div>
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Trees className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle>{t("login.title")}</CardTitle>
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
                    className="px-0 h-auto text-sm"
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
                    className="px-0 h-auto text-sm"
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
            <p className="text-xs text-gray-500">
              Demo users (password: password123): admin@example.com, nguyenvana@example.com, tranthib@example.com, levanc@example.com
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
