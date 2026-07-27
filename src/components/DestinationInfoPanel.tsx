'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight, Award, MapPin, MessageCircle } from 'lucide-react';
import { Destination } from '@/types';
import { EcosystemPartner } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';
import { IntentProfile } from '@/lib/travelerIntent';
import { getHouseAd, getHouseAdLink } from '@/lib/houseAds';
import SponsoredBadge from './SponsoredBadge';

export interface AIRecommendation {
  text: string;
  time: string;
}

export interface DestinationInfoPanelProps {
  destination: Destination;
  // Live journey panel
  currentAssistantTime: string;
  liveCrowdLevel: 'Low' | 'Moderate' | 'High';
  aiRecommendations: AIRecommendation[];
  selectedJourneyActionIdx: number | null;
  onSelectJourneyAction: (idx: number | null) => void;
  // Ecosystem panel
  activeEcosystemTab: 'stay' | 'eat' | 'experience' | 'shop' | 'move' | 'guide';
  onSelectEcosystemTab: (tab: 'stay' | 'eat' | 'experience' | 'shop' | 'move' | 'guide') => void;
  ecosystemPausedUntilRef: React.MutableRefObject<number>;
  activeEcosystemPartners: EcosystemPartner[];
  onSelectPartner: (partner: EcosystemPartner) => void;
  travelerIntent: IntentProfile | null;
  // Similar destinations
  similarDestinations: Destination[];
  onNavigateToSimilar: (dest: Destination) => void;
}

export default function DestinationInfoPanel({
  destination,
  currentAssistantTime,
  liveCrowdLevel,
  aiRecommendations,
  selectedJourneyActionIdx,
  onSelectJourneyAction,
  activeEcosystemTab,
  onSelectEcosystemTab,
  ecosystemPausedUntilRef,
  activeEcosystemPartners,
  onSelectPartner,
  similarDestinations,
  onNavigateToSimilar,
}: DestinationInfoPanelProps) {
  const { t } = useLocale();

  return (
    <div className="lg:col-span-4 space-y-6">

      {/* 16. AI LIVE JOURNEY MODE (Signature travel companion) */}
      <div className="sticky top-22 z-20 bg-royal-950 text-white rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-gold-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gold-300 font-bold">{t('destination_detail.journey_assistant')}</span>
          </div>
          <span className="text-[9px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-gold-200 font-bold">{t('destination_detail.live_journey')}</span>
        </div>

        <div className="space-y-1 text-left">
          <span className="text-[9px] text-white/50 font-mono tracking-wider">{t('destination_detail.exploring_now')}</span>
          <h4 className="font-display text-xl text-white tracking-tight">{destination.name}</h4>
        </div>

        {/* Live Context metrics strip */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="bg-white/5 p-2 rounded-xl text-center">
            <span className="block text-[8px] font-mono text-white/40 uppercase">{t('destination_detail.time')}</span>
            <span className="text-xs font-bold text-gold-300 font-mono mt-0.5 block">{currentAssistantTime}</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl text-center">
            <span className="block text-[8px] font-mono text-white/40 uppercase">{t('destination_detail.weather')}</span>
            <span className="text-xs font-bold text-gold-300 font-mono mt-0.5 block">{destination.weather.temp} ☀</span>
          </div>
          <div className="bg-white/5 p-2 rounded-xl text-center">
            <span className="block text-[8px] font-mono text-white/40 uppercase">{t('destination_detail.crowd')}</span>
            <span className={`text-xs font-bold font-mono mt-0.5 block ${liveCrowdLevel === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>
              {liveCrowdLevel === 'High' ? t('destination_detail.crowd_high') : liveCrowdLevel === 'Moderate' ? t('destination_detail.crowd_moderate') : t('destination_detail.crowd_low')}
            </span>
          </div>
        </div>

        {/* Dynamic recommendation list */}
        <div className="space-y-2.5 text-left pt-1">
          <span className="text-[9px] font-mono text-gold-400/90 tracking-widest uppercase font-bold block">{t('destination_detail.live_recommendations')}</span>
          {aiRecommendations.map((rec, i) => (
            <div
              key={i}
              onClick={() => onSelectJourneyAction(i === selectedJourneyActionIdx ? null : i)}
              className={`p-3 rounded-xl cursor-pointer border text-xs transition-all flex justify-between items-start gap-3 text-left ${
                selectedJourneyActionIdx === i
                  ? 'bg-gold-400/20 border-gold-400 text-white'
                  : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
              }`}
            >
              <div className="space-y-0.5">
                <p className="font-medium">{rec.text}</p>
                <span className="text-[9px] font-mono text-white/40">{t('destination_detail.expected_completion')} {rec.time}</span>
              </div>
              <ChevronRight className={`h-4 w-4 text-gold-400 shrink-0 transform transition-transform ${selectedJourneyActionIdx === i ? 'rotate-90' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      {/* 11. TOURISM ECOSYSTEM INTENT RAILS */}
      <div id="ecosystem-section" className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm space-y-4 text-left scroll-mt-20">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-1.5">
            <Award className="h-4 w-4 text-gold-600" />
            <span className="text-xs font-manrope font-bold text-stone-900">{t('destination_detail.ecosystem_intent_rail')}</span>
          </div>
          <span className="text-[9px] font-mono bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full font-bold">{t('destination_detail.monetized_partners')}</span>
        </div>

        {/* Horiz intent slider */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-stone-100">
          {[
            { id: 'stay' as const, label: t('destination_detail.tab_stay') },
            { id: 'eat' as const, label: t('destination_detail.tab_culinary') },
            { id: 'experience' as const, label: t('destination_detail.tab_vibe') },
            { id: 'shop' as const, label: t('destination_detail.tab_shop') },
            { id: 'guide' as const, label: t('destination_detail.tab_guide') },
            { id: 'move' as const, label: t('destination_detail.tab_move') },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                onSelectEcosystemTab(item.id);
                ecosystemPausedUntilRef.current = Date.now() + 8000;
              }}
              className={`relative text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-full shrink-0 transition-all overflow-hidden ${
                activeEcosystemTab === item.id
                  ? 'bg-royal-950 text-white font-bold'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/10'
              }`}
            >
              {activeEcosystemTab === item.id && (
                <span
                  key={item.id + '-bar'}
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-gold-400 origin-left"
                  style={{ animation: 'ecosystem-progress 3s linear forwards' }}
                />
              )}
              {item.label}
            </button>
          ))}
        </div>

        {/* Slideshow progress dots */}
        <div className="flex justify-center gap-1.5 pt-2 pb-1">
          {(['stay','eat','experience','shop','guide','move'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                onSelectEcosystemTab(tab);
                ecosystemPausedUntilRef.current = Date.now() + 8000;
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                activeEcosystemTab === tab ? 'w-4 bg-royal-950' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>

        {/* Partner Card list */}
        <div className="space-y-3 pt-1">
          {activeEcosystemPartners.length === 0 && (
            <p className="py-4 text-center text-xs italic text-stone-500">{t('destination_detail.no_partner_found')}</p>
          )}

          {activeEcosystemPartners.length > 0 &&
            [...activeEcosystemPartners]
              .sort((a, b) => {
                const tierA = a.isSponsored ? (a.sponsorTier || 99) : 100;
                const tierB = b.isSponsored ? (b.sponsorTier || 99) : 100;
                return tierA - tierB;
              })
              .map(partner => (
              <div
                key={partner.id}
                onClick={() => onSelectPartner(partner)}
                className={`group border p-2.5 rounded-xl flex space-x-3 hover:border-gold-300 hover:bg-stone-50/50 transition-all duration-300 text-left cursor-pointer ${
                  partner.isSponsored ? 'border-gold-200 bg-gold-50/30' : 'border-stone-100'
                }`}
              >
                <Image src={partner.image} alt={partner.name} className="h-14 w-14 rounded-lg object-cover border shrink-0 bg-stone-100" width={56} height={56} />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[8px] font-mono font-bold tracking-widest text-gold-700 uppercase leading-none">{partner.category}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {partner.isSponsored && <SponsoredBadge />}
                        <span className="text-[9px] font-bold text-amber-500 font-mono">★ {partner.rating}</span>
                      </div>
                    </div>
                    <h4 className="font-manrope text-xs font-bold text-stone-900 group-hover:text-gold-700 transition-all truncate mt-0.5">{partner.name}</h4>
                    <p className="text-[9px] text-stone-500 font-light truncate">{partner.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-stone-100/60 pt-1 mt-1 text-[9px] font-mono text-stone-500">
                    <span className="font-bold text-stone-800">{partner.price}</span>
                    <div className="flex items-center gap-2">
                      <span>{partner.distance}</span>
                      <MapPin className="h-2.5 w-2.5 text-stone-400 group-hover:text-gold-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          }

          {(() => {
            const houseAd = getHouseAd('destination_detail');

            return (
              <a
                href={getHouseAdLink(houseAd)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-dashed border-stone-300 p-2.5 text-left transition-all duration-300 hover:border-gold-300 hover:bg-stone-50/50"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50">
                  <MessageCircle className="h-5 w-5 text-stone-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-manrope truncate text-xs font-bold text-stone-700">{houseAd.headline}</h4>
                  <p className="truncate text-[9px] font-light text-stone-500">{houseAd.subline}</p>
                  <span className="mt-0.5 inline-block text-[9px] font-bold text-gold-700">{houseAd.ctaLabel} -&gt;</span>
                </div>
              </a>
            );
          })()}
        </div>
      </div>

      {/* 13. SIMILAR DESTINATIONS */}
      <div className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm text-left space-y-4">
        <span className="text-[9px] font-mono font-bold tracking-widest text-gold-700 uppercase block leading-none">{t('destination_detail.people_also_explored')}</span>

        <div className="space-y-3.5">
          {similarDestinations.map(similar => (
            <div
              key={similar.id}
              onClick={() => onNavigateToSimilar(similar)}
              className="group flex items-center space-x-3 cursor-pointer text-left"
            >
              <Image src={similar.images[0]?.url || ''} alt={similar.name} className="h-12 w-16 rounded-xl object-cover shrink-0 bg-stone-100" width={64} height={48} />
              <div className="flex-1 min-w-0">
                <h4 className="font-manrope text-xs font-bold text-stone-900 group-hover:text-gold-600 transition-all truncate leading-tight">{similar.name}</h4>
                <p className="text-[9px] text-stone-500 font-light truncate mt-0.5">{similar.tagline}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400 shrink-0 group-hover:text-gold-600 transition-all" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
