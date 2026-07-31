/**
 * Smart Back navigation helper.
 * If the user navigated internally within the site, calls router.back().
 * If the user came from an external search engine (e.g. Google) or direct URL link,
 * safely navigates to fallbackPath (e.g. '/events' or '/') to keep the user inside Jogjagem.
 */
export function handleSmartBack(
  router: { back: () => void; push: (url: string) => void },
  fallbackPath: string = '/'
) {
  if (typeof window !== 'undefined') {
    const referrer = document.referrer;
    if (referrer) {
      try {
        const refUrl = new URL(referrer);
        // If referrer domain matches current origin (e.g. jogjagem.com), go back internally
        if (refUrl.origin === window.location.origin || refUrl.hostname === window.location.hostname) {
          router.back();
          return;
        }
      } catch {
        // Invalid referrer URL format — fallback
      }
    }
  }

  // Fallback to internal catalog/home page if user came from Google Search or direct URL
  router.push(fallbackPath);
}
