"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Trees, LogOut } from "lucide-react";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  userName: ReactNode;
  userEmail?: ReactNode;
  onLogout: () => void;
  locale: string;
  locales?: string[];
};

export function DashboardHeader({
  title,
  subtitle,
  userName,
  userEmail,
  onLogout,
  locale,
  locales = ["en", "vi"],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { i18n } = useTranslation();

  const handleLocaleChange = (nextLocale: string) => {
    if (!pathname) return;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return;
    // swap the locale segment (first segment)
    segments[0] = nextLocale;
    router.push(`/${segments.join("/")}`);
  };

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
      if (typeof document !== "undefined") {
        document.documentElement.lang = locale;
      }
    }
  }, [locale])

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Trees className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1>{title}</h1>
            {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="sr-only" htmlFor="locale-select">Language</label>
            <select
              id="locale-select"
              className="border rounded-md px-2 py-1 text-sm"
              value={i18n.language}
              onChange={(e) => handleLocaleChange(e.target.value)}
            >
              {locales.map((loc) => (
                <option key={loc} value={loc}>{loc.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <p>{userName}</p>
            {userEmail ? <p className="text-sm text-gray-600">{userEmail}</p> : null}
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
