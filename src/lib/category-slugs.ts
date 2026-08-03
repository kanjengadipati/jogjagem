export type CategoryLocale = 'id' | 'en';

const CATEGORY_SLUGS: Record<string, Record<CategoryLocale, string>> = {
  'hidden-gem': { id: 'hidden-gem', en: 'hidden-gem' },
  nature: { id: 'wisata-alam', en: 'nature' },
  culinary: { id: 'kuliner-legendaris', en: 'culinary' },
  heritage: { id: 'sejarah-budaya', en: 'heritage' },
  adventure: { id: 'petualangan', en: 'adventure' },
  beach: { id: 'pantai-sunset', en: 'beach' },
  family: { id: 'ramah-keluarga', en: 'family' },
  weekend: { id: 'ide-akhir-pekan', en: 'weekend' },
  camping: { id: 'spot-camping', en: 'camping' },
  sunset: { id: 'spot-sunset', en: 'sunset' },
};

export const CATEGORY_IDS = Object.keys(CATEGORY_SLUGS);

export function categoryToSlug(category: string, locale: CategoryLocale) {
  return CATEGORY_SLUGS[category]?.[locale] ?? category;
}

export function slugToCategory(slug: string) {
  for (const [category, slugs] of Object.entries(CATEGORY_SLUGS)) {
    if (slugs.id === slug || slugs.en === slug) return category;
  }
  return null;
}

export function localizeCategoryPath(category: string, locale: CategoryLocale) {
  return `/destinations/${categoryToSlug(category, locale)}`;
}

