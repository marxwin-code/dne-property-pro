"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import type { Lang } from "@/lib/i18n/home-hero";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "zh" || saved === "en") {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem("lang", next);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
