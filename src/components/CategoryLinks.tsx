import React, { useState, useEffect } from 'react';
import { config } from '../lib/api';
import { useLocale } from '@/contexts/LocaleContext';
import {
  TuguJogjaIcon,
  HiddenGemsIcon,
  NatureEscapesIcon,
  CulinaryLegendsIcon,
  HeritageIcon,
  AdventureIcon,
  BeachesIcon,
  FamilyFriendlyIcon,
  WeekendIdeasIcon,
} from './CategoryIcons';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'hidden-gem', name: 'Hidden Gems',      icon: 'HiddenGems',     description: 'Unexplored, pristine secret wonders' },
  { id: 'nature',     name: 'Nature Escapes',   icon: 'NatureEscapes',  description: 'Verdant forests, mountains, and parks' },
  { id: 'culinary',   name: 'Culinary Legends', icon: 'CulinaryLegends',description: 'Rich sweet-savory traditional tastes' },
  { id: 'heritage',   name: 'Heritage & Culture',icon: 'Heritage',      description: 'Ancient empires and royal palaces' },
  { id: 'adventure',  name: 'Adventure',        icon: 'Adventure',      description: 'Thrilling volcanic offroads and caves' },
  { id: 'beach',      name: 'Beaches & Sunsets',icon: 'Beaches',        description: 'Vast golden sand cliffside coastlines' },
  { id: 'family',     name: 'Family Friendly',  icon: 'FamilyFriendly', description: 'Amusements and cultural experiences' },
  { id: 'weekend',    name: 'Weekend Ideas',    icon: 'WeekendIdeas',   description: 'Short-trip custom curated escapes' },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  HiddenGems:     HiddenGemsIcon,
  NatureEscapes:  NatureEscapesIcon,
  CulinaryLegends:CulinaryLegendsIcon,
  Heritage:       HeritageIcon,
  // also handle API-returned names
  Castle:         HeritageIcon,
  Adventure:      AdventureIcon,
  Compass:        AdventureIcon,
  Beaches:        BeachesIcon,
  Sun:            BeachesIcon,
  FamilyFriendly: FamilyFriendlyIcon,
  Users:          FamilyFriendlyIcon,
  WeekendIdeas:   WeekendIdeasIcon,
  CalendarDays:   WeekendIdeasIcon,
  Sparkles:       HiddenGemsIcon,
  Leaf:           NatureEscapesIcon,
  Utensils:       CulinaryLegendsIcon,
};

interface CategoryLinksProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryLinks({ selectedCategory, onSelectCategory }: CategoryLinksProps) {
  const { t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    config.getCategories().then(res => {
      if (res.status === 'success' && res.data) {
        const translated = res.data.map(cat => ({
          ...cat,
          name: t(`category.${cat.id}`) || cat.name,
          description: t(`category.${cat.id}_desc`) || cat.description,
        }));
        setCategories(translated);
      }
    }).catch(() => {});
  }, [t]);

  useEffect(() => {
    config.getCategories().then(res => {
      if (res.status === 'success' && res.data) setCategories(res.data);
    }).catch(() => {});
  }, []);

  const iconCls = 'h-7 w-7';

  const iconContainerCls = (selected: boolean) =>
    `w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
      selected
        ? 'bg-gold-500/20 text-gold-400'
        : 'bg-white text-gold-600 shadow-sm border border-stone-100'
    }`;

  const cardCls = (selected: boolean) =>
    `flex-shrink-0 w-36 h-32 sm:w-32 sm:h-28 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer ${
      selected
        ? 'bg-[#1C1A17] border-[#1C1A17] text-white shadow-lg -translate-y-0.5'
        : 'bg-stone-50/70 border-stone-200/50 text-stone-800 hover:bg-stone-100/70'
    }`;

  return (
    <div id="category-links-section" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 overflow-hidden">
      <div
        id="categories-pill-row"
        className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {/* All Journeys — Tugu Jogja */}
        <button onClick={() => onSelectCategory(null)} className={cardCls(selectedCategory === null)}>
          <div className={iconContainerCls(selectedCategory === null)}>
            <TuguJogjaIcon className={iconCls} />
          </div>
          <span className="text-xs sm:text-[11px] font-bold tracking-tight">{t('category.all_journeys')}</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = ICON_MAP[cat.icon] || ICON_MAP[cat.id] || HiddenGemsIcon;
          return (
            <button
              key={cat.id}
              id={`category-btn-${cat.id}`}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={cardCls(isSelected)}
            >
              <div className={iconContainerCls(isSelected)}>
                <IconComponent className={iconCls} />
              </div>
              <span className="text-xs sm:text-[11px] font-bold tracking-tight text-center px-2 leading-tight">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
