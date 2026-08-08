// Business-portal (cloned from jogjagem-admin) shared types.
// Kept separate from src/types.ts (public-site types) to avoid conflicts.

export interface BusinessPartner {
  id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  address?: string;
  image?: string;
  rating?: number;
  price?: string;
  distance?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  is_sponsored?: boolean;
  sponsor_tier?: number;
  sponsor_start_at?: string;
  sponsor_end_at?: string;
  target_dest_ids?: string[];
  impression_count?: number;
  click_count?: number;
  sponsor_price?: number;
  sponsor_price_currency?: string;
  sponsor_payment_status?: string;
  status?: string;
  owner_user_id?: string;
  rejection_reason?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface BusinessCampaign {
  id: string;
  partner_name: string;
  business_external_id?: string;
  business_name?: string;
  placement: string;
  image_url: string;
  target_url: string;
  category?: string;
  start_at?: string;
  end_at?: string;
  weight?: number;
  listing_type?: string;
  listing_external_id?: string;
  target_dest_ids?: string[];
  sort_order?: number;
  impressions?: number;
  clicks?: number;
  is_active?: boolean;
  price_amount?: number;
  price_currency?: string;
  payment_status?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  rejected_at?: string;
  rejected_by?: string;
}

// Alias admin-style names so cloned panels keep their original imports.
export type { BusinessPartner as Partner, BusinessCampaign as AdCampaign };
