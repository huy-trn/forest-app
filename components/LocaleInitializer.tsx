"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function LocaleInitializer({ locale }: { locale: string }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const target = locale || "en";
    if (i18n.language !== target) {
      void i18n.changeLanguage(target);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = target;
    }
  }, [locale, i18n]);

  return null;
}
