/**
 * "House ads" are the platform's own self-promo content shown in an ad slot
 * when no paid campaign is currently active for that placement.
 *
 * These are intentionally not labeled "Sponsored": they are lead-gen CTAs for
 * prospective partners, not paid partner placements.
 */

const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '6281234567890';

function waLink(message: string): string {
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export interface HouseAdContent {
  headline: string;
  subline: string;
  ctaLabel: string;
  waMessage: string;
}

export const HOUSE_ADS: Record<string, HouseAdContent> = {
  homepage_hero: {
    headline: 'Ingin bisnis Anda tampil di sini?',
    subline: 'Jangkau ribuan wisatawan yang sedang merencanakan perjalanan ke Jogja.',
    ctaLabel: 'Chat admin via WhatsApp',
    waMessage: 'Halo, saya tertarik pasang iklan banner di homepage Jogjagem. Boleh info lebih lanjut?',
  },
  listing_top: {
    headline: 'Promosikan bisnis Anda di halaman ini',
    subline: 'Tampil di atas hasil pencarian wisatawan yang sedang aktif mencari destinasi.',
    ctaLabel: 'Chat admin via WhatsApp',
    waMessage: 'Halo, saya tertarik pasang iklan di halaman listing destinasi Jogjagem. Boleh info lebih lanjut?',
  },
  listing_native: {
    headline: 'Pasang iklan di sini',
    subline: 'Hotel, resto, atau rental Anda bisa tampil di antara destinasi favorit wisatawan.',
    ctaLabel: 'Hubungi kami',
    waMessage: 'Halo, saya tertarik pasang iklan native card di listing destinasi Jogjagem. Boleh info lebih lanjut?',
  },
  destination_detail: {
    headline: 'Jadi partner terverifikasi di sini',
    subline: 'Tawarkan hotel, kuliner, atau jasa Anda langsung ke wisatawan yang mengunjungi destinasi ini.',
    ctaLabel: 'Daftar sebagai partner',
    waMessage: 'Halo, saya ingin mendaftarkan bisnis saya sebagai partner terverifikasi di halaman detail destinasi Jogjagem. Boleh info lebih lanjut?',
  },
};

export function getHouseAd(placement: string): HouseAdContent {
  return HOUSE_ADS[placement] ?? HOUSE_ADS.listing_native;
}

export function getHouseAdLink(content: HouseAdContent): string {
  return waLink(content.waMessage);
}
