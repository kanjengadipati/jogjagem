const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;

/**
 * CARTO basemaps require a (free) API key — without it every tile is stamped
 * with an "API KEY REQUIRED" watermark. When no key is configured we fall back
 * to OpenStreetMap's keyless tiles so the map always renders cleanly.
 */
export const mapTiles = CARTO_API_KEY
  ? {
      url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
      subdomains: 'abcd',
    }
  : {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: undefined as string | undefined,
    };
