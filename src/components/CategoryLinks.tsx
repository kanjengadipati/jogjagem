import React from 'react';
import * as Lucide from 'lucide-react';
import { CATEGORIES } from '../data';

interface CategoryLinksProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryLinks({ selectedCategory, onSelectCategory }: CategoryLinksProps) {
  return (
    <div 
      id="category-links-section" 
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Horizontal Scroll row of rectangular/square cards */}
      <div 
        id="categories-pill-row" 
        className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {/* All Journeys Button Card */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 w-28 h-24 sm:w-32 sm:h-28 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer ${
            selectedCategory === null
              ? 'bg-[#1C1A17] border-[#1C1A17] text-white shadow-lg transform -translate-y-0.5'
              : 'bg-stone-50/70 border-stone-200/50 text-stone-800 hover:bg-stone-100/70'
          }`}
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-2.5 transition-colors ${
            selectedCategory === null ? 'bg-gold-500/20 text-gold-400' : 'bg-white text-gold-600 shadow-sm border border-stone-100'
          }`}>
            <Lucide.Compass className="h-4.5 w-4.5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight">All Journeys</span>
        </button>

        {CATEGORIES.map((cat) => {
          const Icon = (Lucide as any)[cat.icon] || Lucide.Compass;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`category-btn-${cat.id}`}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`flex-shrink-0 w-28 h-24 sm:w-32 sm:h-28 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-[#1C1A17] border-[#1C1A17] text-white shadow-lg transform -translate-y-0.5'
                  : 'bg-stone-50/70 border-stone-200/50 text-stone-800 hover:bg-stone-100/70'
              }`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-2.5 transition-colors ${
                isSelected ? 'bg-gold-500/20 text-gold-400' : 'bg-white text-gold-600 shadow-sm border border-stone-100'
              }`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-[11px] font-bold tracking-tight text-center px-1 leading-tight">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

