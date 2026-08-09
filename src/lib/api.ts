const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/pleco';

let currentLocale: string = 'id';

export function setApiLocale(locale: string) {
  currentLocale = locale;
}

export function getApiLocale(): string {
  return currentLocale;
}

// BE review shape (snake_case from the API)
interface BeReview {
  id: string;
  user_id?: string;
  destination_id?: string;
  user_name: string;
  traveler_type?: string;
  rating: number;
  comment: string;
  status?: string;
}

interface APIResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: Array<{ field: string; message: string }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  last_login_at?: string;
}

interface AuthResponse {
  access_token: string;
}

interface ProfileResponse {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  role: string;
  is_verified: boolean;
  phone_verified: boolean;
  email_verified: boolean;
  permissions: string[];
  avatar_url?: string;
  cover_image_url?: string;
  reviews_count: number;
  created_at?: string;
  location?: string;
}

// In-memory token — populated on login or by hydrateSession() on page load.
// The source of truth is the httpOnly cookie managed by the server-side
// Route Handlers in /api/auth/*. We never touch localStorage.
let accessToken: string | null = null;
// Timer ID for the proactive refresh scheduler
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    scheduleRefresh(token);
  } else {
    clearRefreshTimer();
  }
}

function getAccessToken(): string | null {
  return accessToken;
}

/** Parse the `exp` claim from a JWT without a library (browser-safe). */
function getJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

function clearRefreshTimer() {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Schedule a silent token refresh 5 minutes before the access token expires.
 * On success the new token replaces the in-memory one and the timer re-arms
 * itself automatically via setAccessToken → scheduleRefresh.
 */
function scheduleRefresh(token: string) {
  clearRefreshTimer();
  const exp = getJwtExpiry(token);
  if (!exp) return;

  const msUntilExpiry = exp * 1000 - Date.now();
  const msUntilRefresh = msUntilExpiry - 5 * 60 * 1000; // 5 min before expiry

  if (msUntilRefresh <= 0) {
    // Token already expired or expiring imminently — refresh right away
    tryRefresh().catch(() => {});
    return;
  }

  refreshTimer = setTimeout(async () => {
    await tryRefresh().catch(() => {});
  }, msUntilRefresh);
}

/**
 * Call once on app mount to restore the access token from the httpOnly
 * session cookie via the /api/auth/session Route Handler.
 */
async function hydrateSession(): Promise<void> {
  if (accessToken) return; // already hydrated
  try {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return;
    const json: APIResponse<AuthResponse> = await res.json();
    if (json.status === 'success' && json.data?.access_token) {
      // setAccessToken also arms the proactive refresh timer
      setAccessToken(json.data.access_token);
    }
  } catch {
    // no session — stay logged out
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  // If we have no token in memory yet, try to hydrate from the session cookie
  // before sending the request (covers direct-URL navigations & hard refreshes).
  // Skip for auth paths that don't need a token to avoid infinite loops.
  const isAuthPath = path.startsWith('/auth/');
  if (!accessToken && !isAuthPath) {
    await hydrateSession();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': currentLocale,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (err) {
    console.warn(`API request failed: ${path}`, err);
    return { status: 'error', message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' } satisfies APIResponse<T>;
  }

  if (res.status === 401 && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options);
    }
    setAccessToken(null);
    return { status: 'error', message: 'Sesi Anda telah berakhir. Silakan login kembali.' } satisfies APIResponse<T>;
  }

  let json: APIResponse<T>;
  try {
    json = await res.json();
  } catch {
    json = { status: 'error', message: `Terjadi kesalahan server (status ${res.status}). Silakan coba lagi.` } satisfies APIResponse<T>;
  }

  return json;
}

async function tryRefresh(): Promise<boolean> {
  try {
    // Calls our Route Handler which forwards to the backend and refreshes the cookie
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const json: APIResponse<AuthResponse> = await res.json();
    if (json.status === 'success' && json.data) {
      setAccessToken(json.data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const auth = {
  async register(name: string, email: string, password: string) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string) {
    // Calls our Route Handler which proxies to the backend and sets the httpOnly cookie
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const fallback: APIResponse<AuthResponse> = { status: 'error', message: 'Network error' };
    const json: APIResponse<AuthResponse> = await res.json().catch(() => fallback);
    if (json.status === 'success' && json.data) {
      setAccessToken(json.data.access_token);
    }
    return json;
  },

  async getProfile() {
    return request<ProfileResponse>('/auth/profile');
  },

  async updateProfile(name: string, phoneNumber?: string) {
    return request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name, phone_number: phoneNumber }),
    });
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const res = await fetch(`${API_BASE}/auth/profile/avatar`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    return res.json() as Promise<APIResponse<{ avatar_url: string }>>;
  },

  async updateAvatarUrl(profile: ProfileResponse, url: string) {
    return request<{ avatar_url: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: profile.name,
        phone_number: profile.phone_number,
        avatar_url: url,
        cover_image_url: profile.cover_image_url,
      }),
    });
  },

  async uploadCover(file: File) {
    const formData = new FormData();
    formData.append('cover', file);
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const res = await fetch(`${API_BASE}/auth/profile/cover`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    return res.json() as Promise<APIResponse<{ cover_image_url: string }>>;
  },

  async updateCoverUrl(profile: ProfileResponse, url: string) {
    return request<{ cover_image_url: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: profile.name,
        phone_number: profile.phone_number,
        avatar_url: profile.avatar_url,
        cover_image_url: url,
      }),
    });
  },

  async reportDestinationImage(destinationId: string, imageUrl: string, reason: string, details: string) {
    return request(`/destinations/${destinationId}/report`, {
      method: 'POST',
      body: JSON.stringify({ image_url: imageUrl, reason, details }),
    });
  },

  async getUserDestinations() {
    return request<{ destination_slug: string; status: string }[]>('/destinations/my-status');
  },

  async updateDestinationStatus(slug: string, status: string) {
    return request(`/destinations/my-status/${slug}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },

  async forgotPassword(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const fallback = { status: 'error' as const, message: 'Network error' };
    return res.json().catch(() => fallback);
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    const fallback = { status: 'error' as const, message: 'Network error' };
    return res.json().catch(() => fallback);
  },

  async logout() {
    // Calls our Route Handler which clears the cookie and notifies the backend
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setAccessToken(null);
    return { status: 'success' } as APIResponse;
  },

  async socialLogin(provider: 'google' | 'facebook', token: string) {
    // Calls our Route Handler which proxies to the backend and sets the httpOnly cookie
    const res = await fetch('/api/auth/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, token }),
    });
    const fallback: APIResponse<AuthResponse> = { status: 'error', message: 'Network error' };
    const json: APIResponse<AuthResponse> = await res.json().catch(() => fallback);
    if (json.status === 'success' && json.data) {
      setAccessToken(json.data.access_token);
    }
    return json;
  },

  async refreshToken() {
    return tryRefresh();
  },

  isLoggedIn() {
    return !!accessToken;
  },

  getAccessToken,
  hydrateSession,
};

interface AIQueryResponse {
  reply: string;
  matchedDestinationIds: string[];
}

export const destinations = {
  async getAll(params?: { limit?: number; page?: number; sub_region?: string }) {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    if (params?.sub_region) qs.set('sub_region', params.sub_region);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/destinations${suffix}`);
  },

  async getHiddenGem() {
    return request(`/destinations/hidden-gem`);
  },

  async getById(id: string) {
    return request(`/destinations/${id}`);
  },

  async search(query: string) {
    return request(`/destinations/search?q=${encodeURIComponent(query)}`);
  },

  async getByCategory(category: string) {
    return request(`/destinations/category/${encodeURIComponent(category)}`);
  },
};

export const events = {
  async getAll(params?: { limit?: number; page?: number; category?: string; q?: string }) {
    const qs = [`limit=${params?.limit ?? 15}`, `page=${params?.page ?? 1}`];
    if (params?.category) qs.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.q?.trim()) qs.push(`q=${encodeURIComponent(params.q.trim())}`);
    return request(`/events?${qs.join('&')}`);
  },

  async getById(id: string) {
    return request(`/events/${id}`);
  },

  async search(query: string) {
    return request(`/events/search?q=${encodeURIComponent(query)}`);
  },
};

export const reviews = {
  async getByDestination(destinationId: string) {
    return request<BeReview[]>(`/reviews?destination_id=${encodeURIComponent(destinationId)}`);
  },

  async getByUser(userId: string) {
    return request<BeReview[]>(`/reviews?user_id=${encodeURIComponent(userId)}`);
  },

  async create(destinationId: string, rating: number, comment: string, userName?: string, travelerType?: string) {
    return request('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        destination_id: destinationId,
        rating,
        comment,
        user_name: userName || 'Anonymous',
        traveler_type: travelerType || '',
      }),
    });
  },
};

export const config = {
  async getCategories() {
    return request<{ id: string; name: string; icon: string; description: string }[]>('/config/categories');
  },

  async getSubRegions() {
    return request<{ id: string; name: string; description: string }[]>('/config/sub-regions');
  },

  async getQuotes() {
    return request<{ text: string; author: string }[]>('/config/quotes');
  },
};

export const ai = {
  async query(queryText: string, history: Array<{ role: string; text: string }> = []) {
    return request<AIQueryResponse>('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query: queryText, history }),
    });
  },

  async imageSearch(image: string, mimeType: string) {
    return request<AIQueryResponse>('/ai/image-search', {
      method: 'POST',
      body: JSON.stringify({ image, mimeType }),
    });
  },

  async recommend(timeOfDay: string) {
    return request<{
      destinationId: string;
      headline: string;
      reason: string;
      crowd: string;
    }>(`/ai/recommend?time=${encodeURIComponent(timeOfDay)}`);
  },

  async recommendMulti(timeOfDay: string) {
    return request<{
      items: Array<{
        destinationId: string;
        headline: string;
        reason: string;
        badge: string;
        crowd: string;
        imageUrl: string;
        rating: number;
        location: string;
      }>;
    }>(`/ai/recommend/multi?time=${encodeURIComponent(timeOfDay)}`);
  },

  async trending() {
    return request<{
      items: Array<{
        type: 'destination' | 'event';
        id: string;
        badge: string;
        headline: string;
        reason: string;
        imageUrl: string;
        rating: number;
        distance: string;
        location: string;
      }>;
    }>('/ai/trending');
  },

  async getJourney(destinationName: string) {
    return request<{ steps: Array<{ time: string; title: string; desc: string }> }>('/ai/journey', {
      method: 'POST',
      body: JSON.stringify({ destinationName }),
    });
  },

  async getRouteTimeline(lat?: number, lng?: number, hour?: number, savedIds?: string[], category?: string) {
    const params = new URLSearchParams();
    if (lat) params.set('lat', lat.toString());
    if (lng) params.set('lng', lng.toString());
    if (hour !== undefined) params.set('hour', hour.toString());
    if (savedIds && savedIds.length > 0) params.set('saved_ids', savedIds.join(','));
    if (category && category !== 'all') params.set('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{
      headerTitle: string;
      timeRange: string;
      nodes: Array<{
        id: string;
        title: string;
        type: 'destination' | 'event';
        category: string;
        image: string;
        location: string;
        subRegion: string;
        rating: number;
        distanceKm: number;
        isPast: boolean;
        isCurrent: boolean;
        isTomorrow: boolean;
        dayLabel: string;
        displayTime: string;
        timeSlot: string;
        duration: string;
      }>;
    }>(`/ai/route-timeline${qs}`);
  },

  async getNextStop(lat: number, lng: number, category: string, excludeIds: string[], hour?: number) {
    const params = new URLSearchParams();
    params.set('lat', lat.toString());
    params.set('lng', lng.toString());
    if (category && category !== 'all') params.set('category', category);
    if (excludeIds.length > 0) params.set('exclude', excludeIds.join(','));
    if (hour !== undefined) params.set('hour', hour.toString());
    return request<{
      id: string;
      title: string;
      category: string;
      image: string;
      location: string;
      subRegion: string;
      rating: number;
      distanceKm: number;
      timeWarning?: string;
      isTomorrow?: boolean;
      scheduledFor?: string;
    }>(`/ai/next-stop?${params.toString()}`);
  },
};

export const trips = {
  async getAll() {
    return request<TripResponse[]>('/trips');
  },

  async getById(tripId: string) {
    return request<TripResponse>(`/trips/${tripId}`);
  },

  async create(payload: {
    title: string;
    start_date?: string;
    end_date?: string;
    duration_days: number;
    days: TripDayPayload[];
    notes?: string;
    status?: string;
  }) {
    return request<TripResponse>('/trips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(tripId: string, data: {
    title?: string;
    start_date?: string;
    end_date?: string;
    duration_days?: number;
    days?: TripDayPayload[];
    notes?: string;
    status?: string;
  }) {
    return request<TripResponse>(`/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(tripId: string) {
    return request(`/trips/${tripId}`, { method: 'DELETE' });
  },
};

export const businesses = {
  getMine: () => request<BeBusiness[]>('/businesses/me'),
  getMineByID: (id: string) => request<BeBusiness>(`/businesses/me/${encodeURIComponent(id)}`),
  create: (data: { name: string; description?: string; category: string; phone: string; address: string; regions: string[]; email?: string; website?: string }) =>
    request<BeBusiness>('/businesses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<BeBusiness>) =>
    request<BeBusiness>(`/businesses/me/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export interface BusinessInvitePreview {
  email: string;
  role: string;
  status: string;
  expires_at: string;
  business_external_id: string;
  business_name: string;
  invited_by_name?: string;
}

export interface BusinessInviteAcceptResult {
  business_external_id: string;
  business_name: string;
  role: string;
}

export const businessInvites = {
  preview: (token: string) =>
    request<BusinessInvitePreview>(`/businesses/invites/${encodeURIComponent(token)}`),
  accept: (token: string) =>
    request<BusinessInviteAcceptResult>(`/businesses/invites/${encodeURIComponent(token)}/accept`, {
      method: 'POST',
    }),
};

export const listingClaims = {
  submit: (data: {
    business_external_id: string;
    listing_type: string;
    listing_external_id: string;
    role?: string;
    evidence_url?: string;
  }) =>
    request<BeListingClaim>('/listing-claims/submit', { method: 'POST', body: JSON.stringify(data) }),
  getMine: () => request<BeListingClaim[]>('/listing-claims/me'),
  search: (query: string) => request<SearchResult[]>('/listings/search?q=' + encodeURIComponent(query)),
};

export interface SearchResult {
  listing_type: string;
  id: string;
  name: string;
}

export interface BeBusiness {
  id: number;
  external_id: string;
  name: string;
  description?: string;
  category: string;
  phone?: string;
  email?: string;
  website?: string;
  avatar_url?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  rejection_reason?: string;
  created_at?: string;
}

export interface BeListingClaim {
  id: string;
  external_id: string;
  business_id: number;
  listing_type: string;
  listing_external_id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at: string;
}

// Ecosystem card shape served by GET /ads/ecosystem (snake_case from the API).
interface BeEcosystemCard {
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
  business_id?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
  /** Status pembayaran sponsorship dari Midtrans (paid | pending | expired | failed) */
  sponsor_payment_status?: string;
  /** Tanggal berakhir sponsorship (ISO 8601) */
  sponsor_end_at?: string;
}

interface BeAdCampaign {
  id: string;
  partner_name?: string;
  business_name?: string;
  placement: string;
  image_url: string;
  target_url: string;
  category?: string;
  weight?: number;
}

interface BeHouseAd {
  id: string;
  placement: string;
  headline: string;
  headline_en?: string;
  subline?: string;
  subline_en?: string;
  cta_label: string;
  cta_label_en?: string;
  image_url?: string;
  target_url: string;
  is_enabled?: boolean;
}

export const ads = {
  async getBanner(placement: string, category?: string) {
    const qs = new URLSearchParams({ placement });
    if (category) qs.set('category', category);
    return request<BeAdCampaign | null>(`/ads/banners?${qs.toString()}`);
  },

  async getHouseAd(placement: string) {
    const qs = new URLSearchParams({ placement });
    return request<BeHouseAd | null>(`/ads/house?${qs.toString()}`);
  },

  /** Sponsored cards for the destination detail ecosystem rails ("Rekomendasi
   * Kebutuhan Traveler"). Resolved from paid campaigns on ecosystem_* placements
   * and enriched with the promoted listing's data — same shape as BeEcosystemCard. */
  async getEcosystem(params?: { destinationId?: string }) {
    const qs = new URLSearchParams();
    if (params?.destinationId) qs.set('destination_id', params.destinationId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<BeEcosystemCard[]>(`/ads/ecosystem${suffix}`);
  },

  trackImpression(externalId: string) {
    void request(`/ads/campaigns/${encodeURIComponent(externalId)}/track/impression`, { method: 'POST' });
  },

  trackClick(externalId: string) {
    void request(`/ads/campaigns/${encodeURIComponent(externalId)}/track/click`, { method: 'POST' });
  },
};

export const articles = {
  async getAll(params?: { limit?: number; page?: number; category?: string }) {
    const qs = new URLSearchParams();
    qs.set('limit', String(params?.limit ?? 20));
    qs.set('page', String(params?.page ?? 1));
    if (params?.category) qs.set('category', params.category);
    return request(`/articles?${qs.toString()}`);
  },

  async getBySlug(slug: string) {
    return request(`/articles/slug/${encodeURIComponent(slug)}`);
  },

  async getByCategory(category: string) {
    return request(`/articles/category/${encodeURIComponent(category)}`);
  },

  async search(query: string) {
    return request(`/articles/search?q=${encodeURIComponent(query)}`);
  },
};

export type { User, ProfileResponse, AuthResponse, APIResponse, BeReview, BeEcosystemCard, BeAdCampaign, BeHouseAd };

export interface TripDayPayload {
  dayNumber: number;
  destinationIds: string[];
  notes: string;
}

export interface TripResponse {
  id: string;           // external_id
  user_id: number;
  title: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  days: TripDayPayload[];
  notes: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}
