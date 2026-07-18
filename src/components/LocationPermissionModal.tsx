'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, X, Shield, Zap, Navigation } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { useLocale } from '@/contexts/LocaleContext';

export default function LocationPermissionModal() {
  const { permission, hasPrompted, requestLocation, dismissPrompt } = useLocation();
  const { t } = useLocale();
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasPrompted && permission === 'prompt') {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [hasPrompted, permission]);

  if (hasPrompted || permission !== 'prompt') return null;

  const handleAllow = async () => {
    setClosing(true);
    setTimeout(async () => {
      await requestLocation();
    }, 300);
  };

  const handleDismiss = () => {
    setClosing(true);
    setTimeout(dismissPrompt, 300);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-all duration-300 ${closing ? 'opacity-0' : visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${closing ? 'opacity-0' : ''}`}
        onClick={handleDismiss}
      />

      {/* Bottom sheet mobile / centered card desktop */}
      <div
        className={`relative w-full sm:max-w-[340px] bg-white sm:rounded-[2rem] rounded-t-[2rem] overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.12)] transition-all duration-300 sm:mb-0 mb-0 ${
          closing
            ? 'translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0'
            : visible
            ? 'translate-y-0 sm:translate-y-0 sm:scale-100 sm:opacity-100'
            : 'translate-y-full sm:translate-y-8 sm:opacity-0'
        }`}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-8 h-1 rounded-full bg-stone-300" />
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pt-4 pb-6 sm:pt-6 sm:pb-7">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
                <Navigation className="h-6 w-6 text-white -rotate-45" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <MapPin className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-5">
            <h2 className="font-manrope text-[17px] font-extrabold text-royal-950 mb-1.5 tracking-tight">
              {t('location_permission.heading')}
            </h2>
            <p className="text-[13px] text-stone-500 leading-relaxed">
              {t('location_permission.description')}
            </p>
          </div>

          {/* Benefits */}
          <div className="flex gap-2 mb-5">
            <div className="flex-1 bg-gold-50 rounded-xl px-3 py-2.5 flex flex-col items-center text-center gap-1">
              <Zap className="h-3.5 w-3.5 text-gold-600" />
              <span className="text-[10px] font-semibold text-gold-700 leading-tight">{t('location_permission.realtime_label')}</span>
            </div>
            <div className="flex-1 bg-gold-50 rounded-xl px-3 py-2.5 flex flex-col items-center text-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-gold-600" />
              <span className="text-[10px] font-semibold text-gold-700 leading-tight">{t('location_permission.direct_nav_label')}</span>
            </div>
            <div className="flex-1 bg-gold-50 rounded-xl px-3 py-2.5 flex flex-col items-center text-center gap-1">
              <Shield className="h-3.5 w-3.5 text-gold-600" />
              <span className="text-[10px] font-semibold text-gold-700 leading-tight">{t('location_permission.privacy_label')}</span>
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={handleAllow}
            className="w-full py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-600 active:scale-[0.98] text-white text-[13px] font-bold transition-all shadow-md shadow-gold-500/25 flex items-center justify-center gap-1.5"
          >
            <MapPin className="h-4 w-4" />
            {t('location_permission.enable_btn')}
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-2xl text-stone-400 text-[13px] font-semibold transition-all hover:text-stone-600 mt-1"
          >
            {t('location_permission.skip_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
