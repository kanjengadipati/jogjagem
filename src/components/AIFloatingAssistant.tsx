'use client';

import React, { useState, useEffect } from 'react';
import { Bot, ChevronUp, ChevronDown, Sparkles, MapPin, Coffee, Sun } from 'lucide-react';
import { Destination } from '@/types';
import { ai } from '@/lib/api';
import { LiveWeather } from '@/lib/weather';
import { useLocation } from '@/contexts/LocationContext';
import { useLocale } from '@/contexts/LocaleContext';

interface AIFloatingAssistantProps {
  destination: Destination;
  liveWeather: LiveWeather | null;
  liveCrowdLevel: 'Low' | 'Moderate' | 'High';
}

export default function AIFloatingAssistant({ destination, liveWeather, liveCrowdLevel }: AIFloatingAssistantProps) {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [advice, setAdvice] = useState<string>(t('ai_floating.loading'));
  const [loading, setLoading] = useState(false);
  const { coords } = useLocation();



  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const weatherText = liveWeather ? `${liveWeather.temp}°C, ${liveWeather.condition}` : 'Unknown';
      const locationText = coords ? `(My GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : '';
      const prompt = `Destination: ${destination.name}. Time: ${currentTime}. Weather: ${weatherText}. Crowd Level: ${liveCrowdLevel}. ${locationText}. Give me short, 1-2 sentence real-time travel advice based on this context. Start with a warm local greeting.`;
      
      ai.query(prompt)
        .then(res => {
          if (res.status === 'success' && res.data) {
            setAdvice((res.data as any).reply);
          } else {
            setAdvice(t('ai_floating.fallback_advice'));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, destination.name, liveWeather, liveCrowdLevel, currentTime, coords?.lat, coords?.lng]);

  const navigateToViewpoint = () => {
    // Scroll to the detail map section
    const element = document.getElementById('detail-map-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 bg-royal-950 text-white rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-fade-in">
          <div className="p-4 bg-gold-400 text-royal-950 font-bold flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>{t('ai_floating.heading')}</span>
            </span>
            <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{currentTime}</span>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm font-light leading-relaxed">{loading ? t('ai_floating.thinking') : advice}</p>
            <div className="space-y-2">
              <button onClick={navigateToViewpoint} className="flex items-center space-x-2 w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs">
                <MapPin className="h-4 w-4 text-gold-400" />
                <span>{t('ai_floating.view_on_map')}</span>
              </button>

              <button className="flex items-center space-x-2 w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs">
                <Sparkles className="h-4 w-4 text-gold-400" />
                <span>{t('ai_floating.get_tips')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-14 w-14 rounded-full bg-gold-400 text-royal-950 shadow-xl hover:scale-105 transition-transform"
      >
        {isOpen ? <ChevronDown className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  );
}
