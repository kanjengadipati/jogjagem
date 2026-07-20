import React, { useState, useEffect } from 'react';
import { config } from '../lib/api';
import { useLocale } from '@/contexts/LocaleContext';
import { MoreHorizontal } from 'lucide-react';
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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  HiddenGems:      HiddenGemsIcon,
  NatureEscapes:   NatureEscapesIcon,
  CulinaryLegends: CulinaryLegendsIcon,
  Heritage:        HeritageIcon,
  Castle:          HeritageIcon,
  Adventure:       AdventureIcon,
  Compass:         AdventureIcon,
  Beaches:         BeachesIcon,
  Sun:             BeachesIcon,
  FamilyFriendly:  FamilyFriendlyIcon,
  Users:           FamilyFriendlyIcon,
  WeekendIdeas:    WeekendIdeasIcon,
  CalendarDays:    WeekendIdeasIcon,
  Sparkles:        HiddenGemsIcon,
  Leaf:            NatureEscapesIcon,
  Utensils:        CulinaryLegendsIcon,
};

interface CategoryLinksProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  dark?: boolean;
}

export default function CategoryLinks({ selectedCategory, onSelectCategory, dark = false }: CategoryLinksProps) {
  const { t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    config.getCategories().then(res => {
      if (res.status === 'success' && res.data) {
        const translated = res.data.map(cat => {
          const key = cat.id.replace(/-/g, '_');
          return {
            ...cat,
            name: t(`category.${key}`) || cat.name,
            description: t(`category.${key}_desc`) || cat.description,
          };
        });
        setCategories(translated);
      }
    }).catch(() => {});
  }, [t]);

  const pillCls = (selected: boolean) =>
    `flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer ${
      selected
        ? 'bg-gold-500 border-gold-500'
        : dark
          ? 'bg-[#1C1A17] border-[#2E2A24] hover:bg-[#252219] hover:border-[#3a3629]'
          : 'bg-stone-100/80 border-stone-200/60 hover:bg-stone-200/60'
    }`;

  const iconCls = (selected: boolean) =>
    `h-7 w-7 ${selected ? 'text-royal-950' : dark ? 'text-gold-400' : 'text-gold-600'}`;

  const labelCls = (selected: boolean) =>
    `text-[10px] font-bold text-center leading-tight px-0.5 ${
      selected ? 'text-royal-950' : dark ? 'text-white/70' : 'text-stone-700'
    }`;

  const allCats = [
    { id: null as string | null, name: t('category.all_journeys'), Icon: TuguJogjaIcon },
    ...categories.map(cat => ({
      id: cat.id as string | null,
      name: cat.name,
      Icon: ICON_MAP[cat.icon] || ICON_MAP[cat.id] || HiddenGemsIcon,
    })),
  ];

  // Mobile: 4 primary + "Lainnya" button, rest in expanded drawer
  const PRIMARY_COUNT = 4;
  const primaryCats = allCats.slice(0, PRIMARY_COUNT);
  const moreCats    = allCats.slice(PRIMARY_COUNT);

  return (
    <div id="category-links-section" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

      {/* ── Mobile layout: 5-col grid + expandable "Lainnya" ── */}
      <div className="sm:hidden space-y-2">
        {/* Primary row */}
        <div className="grid grid-cols-5 gap-2">
          {primaryCats.map(({ id, name, Icon }) => {
            const selected = selectedCategory === id;
            return (
              <button
                key={String(id)}
                onClick={() => { setShowMore(false); onSelectCategory(selected ? null : id); }}
                className={pillCls(selected)}
              >
                <Icon className={iconCls(selected)} />
                <span className={`${labelCls(selected)} truncate w-full`}>
                  {name.split(' ')[0]}
                </span>
              </button>
            );
          })}
          {/* Lainnya toggle */}
          <button
            onClick={() => setShowMore(v => !v)}
            className={pillCls(showMore)}
          >
            <MoreHorizontal className={iconCls(showMore)} />
            <span className={labelCls(showMore)}>Lainnya</span>
          </button>
        </div>

        {/* Expanded "Lainnya" row */}
        {showMore && moreCats.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {moreCats.map(({ id, name, Icon }) => {
              const selected = selectedCategory === id;
              return (
                <button
                  key={String(id)}
                  onClick={() => { onSelectCategory(selected ? null : id); setShowMore(false); }}
                  className={pillCls(selected)}
                >
                  <Icon className={iconCls(selected)} />
                  <span className={`${labelCls(selected)} line-clamp-2`}>{name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Desktop layout: single row grid (unchanged) ── */}
      <div
        id="categories-pill-row"
        className="hidden sm:grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(allCats.length, 9)}, minmax(0, 1fr))` }}
      >
        {allCats.map(({ id, name, Icon }) => {
          const selected = selectedCategory === id;
          return (
            <button
              key={String(id)}
              id={id ? `category-btn-${id}` : 'category-btn-all'}
              onClick={() => onSelectCategory(selected ? null : id)}
              className={pillCls(selected)}
            >
              <Icon className={iconCls(selected)} />
              <span className={labelCls(selected)}>{name}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
