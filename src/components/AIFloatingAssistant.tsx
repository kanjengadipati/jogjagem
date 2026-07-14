'use client';

import React, { useState, useEffect } from 'react';
import { Bot, ChevronUp, ChevronDown, Sparkles, MapPin, Coffee, Sun } from 'lucide-react';
import { Destination } from '@/types';

interface AIFloatingAssistantProps {
  destination: Destination;
}

export default function AIFloatingAssistant({ destination }: AIFloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const getLiveAdvice = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "It's the perfect morning hour! The air is crisp and the site is less crowded. Focus on outdoor exploration.";
    if (hour < 15) return "Mid-day sun is intense. Consider finding shaded spots or visiting indoor museum zones.";
    return "The golden hour approaches. Prepare for the best photography lighting!";
  };

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 bg-royal-950 text-white rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-fade-in">
          <div className="p-4 bg-gold-400 text-royal-950 font-bold flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Jogja Live Assistant</span>
            </span>
            <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{currentTime}</span>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm font-light leading-relaxed">{getLiveAdvice()}</p>
            <div className="space-y-2">
              <button className="flex items-center space-x-2 w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs">
                <MapPin className="h-4 w-4 text-gold-400" />
                <span>Navigate to best viewpoint</span>
              </button>
              <button className="flex items-center space-x-2 w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs">
                <Coffee className="h-4 w-4 text-gold-400" />
                <span>Find local cafe nearby</span>
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
