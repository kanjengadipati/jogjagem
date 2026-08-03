'use client';

import { useLocale } from '@/contexts/LocaleContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLanguage = () => {
    const nextLocale = locale === 'id' ? 'en' : 'id';
    setLocale(nextLocale);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-gold-400/50 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 select-none"
    >
      <span className="text-sm leading-none">{locale === 'id' ? '🇮🇩' : '🇬🇧'}</span>
      <span className="uppercase tracking-wider font-extrabold text-gold-300">{locale === 'id' ? 'ID' : 'EN'}</span>
    </button>
  );
}
