/**
 * Custom Next.js image loader.
 *
 * - Cloudinary URLs: use Cloudinary's own transformation pipeline for optimisation.
 * - Everything else: return the src as-is so the browser fetches it directly,
 *   avoiding the Next.js image proxy (which some hosts like Wikimedia block).
 */

type LoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

export default function imageLoader({ src, width, quality }: LoaderParams): string {
  // Cloudinary — apply width and quality transformations
  if (src.includes('res.cloudinary.com')) {
    // Insert or replace the upload transformation segment
    return src.replace(
      '/upload/',
      `/upload/w_${width},q_${quality ?? 75},f_auto/`,
    );
  }

  // All other external URLs — pass through directly (no proxy)
  return src;
}
