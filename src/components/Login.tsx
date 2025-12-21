import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { UserRole } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Trees } from "lucide-react";
import { SelectLng } from "./ui/select-lng";

interface LoginProps {
  onLogin: (
    role: UserRole,
    email: string,
    name: string,
  ) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role && email && name) {
      onLogin(role, email, name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="absolute top-4 right-4">
        <SelectLng/>
      </div>
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Trees className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle>{t('login.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('login.name')}</Label>
              <Input
                id="name"
                placeholder={t('login.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('login.role')}</Label>
              <Select
                value={role || ""}
                onValueChange={(value:string) =>
                  setRole(value as UserRole)
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t('login.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    {t('login.admin')}
                  </SelectItem>
                  <SelectItem value="partner">
                    {t('login.partner')}
                  </SelectItem>
                  <SelectItem value="investor">
                    {t('login.investor')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              {t('login.signIn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}