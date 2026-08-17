// Production-verified 1:1 destination slug renames.
//
// Some destination URLs became stale after the CMS renamed a destination
// (the old slug is no longer served by the API and therefore renders the
// not-found / noindex page), while a canonical replacement URL exists. These
// 301s preserve link equity and stop Google Search from flagging the old
// URLs as "Excluded by noindex".
//
// Key   = the stale URL path (locale prefix included for EN; ID locale has none)
// Value = the canonical URL path to redirect to.
//
// Targets were verified against the live production catalog (indexable pages).
// Extend this map when adding new renames; do NOT add entries for destinations
// that still resolve (those are handled by fetchDestinationBySlug's
// locale fallback in server-destinations.ts) or for genuinely deleted pages
// (those stay noindex).
export const DESTINATION_REDIRECTS: Record<string, string> = {
  '/destinations/parangtritis-beach': '/destinations/pantai-parangtritis',
  '/destinations/heha-ocean-view': '/destinations/pantai-heha-ocean-view',
  '/en/destinations/heha-ocean-view': '/en/destinations/pantai-heha-ocean-view',
};
