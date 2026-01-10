"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { LogOut, Home, Menu, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SelectLng } from "../ui/select-lng";

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
  const { i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
    <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur md:sticky md:top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push(`/${locale}`)}
              aria-label={i18n.t("common.home", { defaultValue: "Home" }) as string}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
              {subtitle ? <p className="text-xs sm:text-sm text-slate-500 truncate">{subtitle}</p> : null}
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm leading-tight text-slate-900">{userName}</p>
              {userEmail ? <p className="text-xs text-slate-500 leading-tight">{userEmail}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="locale-select">Language</label>
              <SelectLng />
            </div>
            <Button size="sm" variant="outline" onClick={onLogout} className="whitespace-nowrap border-slate-200 bg-white/70">
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
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-500">Language</span>
                  </div>
                  <SelectLng
                    value={i18n.language}
                    onChange={() => setMenuOpen(false)}
                    options={locales.map((loc) => ({ value: loc, label: loc.toUpperCase() }))}
                    triggerClassName="w-full"
                  />
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
