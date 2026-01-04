"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { LogOut, Home, Menu, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  const handleLocaleChange = (nextLocale: string) => {
    if (!pathname) return;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return;
    // swap the locale segment (first segment)
    segments[0] = nextLocale;
    const search = searchParams.toString();
    router.push(`/${segments.join("/")}${search ? `?${search}` : ""}`);
  };

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
      if (typeof document !== "undefined") {
        document.documentElement.lang = locale;
      }
    }
  }, [locale]);

  useEffect(() => {
    // Using Radix DropdownMenu's built-in outside interaction handling.
  }, [menuOpen]);

  return (
    <header className="bg-white border-b md:sticky md:top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push(`/${locale}`)}
              aria-label={i18n.t("common.home", { defaultValue: "Home" }) as string}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-green-600 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg truncate">{title}</h1>
              {subtitle ? <p className="text-xs sm:text-sm text-gray-600 truncate">{subtitle}</p> : null}
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" aria-hidden />
              <label className="sr-only" htmlFor="locale-select">Language</label>
              <Select value={i18n.language} onValueChange={(val) => handleLocaleChange(val)}>
                <SelectTrigger id="locale-select" className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {locales.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <p className="text-sm leading-tight">{userName}</p>
              {userEmail ? <p className="text-xs text-gray-600 leading-tight">{userEmail}</p> : null}
            </div>
            <Button variant="outline" onClick={onLogout} className="whitespace-nowrap">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile menu: reverted to dropdown, language select anchored with popper */}
          <div className="md:hidden w-auto" ref={menuRef}>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="inline-flex items-center justify-center size-9 rounded-md hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64"
                onInteractOutside={(event) => {
                  const target = event.target as HTMLElement | null;
                  if (!target) return;
                  // Prevent closing when interacting with the Select popper
                  if (
                    target.closest('[data-slot="select-content"]') ||
                    target.closest('[data-slot="select-trigger"]')
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                <div className="px-3 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Language</span>
                  </div>
                  <Select value={i18n.language} onValueChange={(val) => { handleLocaleChange(val); setMenuOpen(false); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {locales.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => { e.preventDefault(); setMenuOpen(false); onLogout(); }}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
