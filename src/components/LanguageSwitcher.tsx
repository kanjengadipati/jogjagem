"use client";

import { useLocale } from "@/contexts/LocaleContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="relative group">
      {/* Trigger */}
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 border border-white/0 hover:border-white/15">
        <span className="text-sm leading-none">{locale === "id" ? "🇮🇩" : "🇬🇧"}</span>
        <span className="uppercase tracking-wide">{locale === "id" ? "ID" : "EN"}</span>
        <svg className="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-36 py-1.5 bg-royal-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
        <button
          onClick={() => setLocale("id")}
          className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
            locale === "id" ? "text-gold-400 bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="text-base leading-none">🇮🇩</span>
          Indonesia
          {locale === "id" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />}
        </button>
        <button
          onClick={() => setLocale("en")}
          className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors ${
            locale === "en" ? "text-gold-400 bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="text-base leading-none">🇬🇧</span>
          English
          {locale === "en" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />}
        </button>
      </div>
    </div>
  );
}
