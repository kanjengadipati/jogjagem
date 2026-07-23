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
    return { status: 'error', message: 'Server unreachable' } satisfies APIResponse<T>;
  }

  if ((res.status === 401 || res.status === 403) && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options);
    }
    setAccessToken(null);
    return { status: 'error', message: 'Unauthorized' } satisfies APIResponse<T>;
  }

  let json: APIResponse<T>;
  try {
    json = await res.json();
  } catch {
    json = { status: 'error', message: `Server returned status ${res.status}` } satisfies APIResponse<T>;
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
  async getAll(params?: { limit?: number; page?: number }) {
    const qs = params
      ? `?limit=${params.limit ?? 15}&page=${params.page ?? 1}`
      : '?limit=15&page=1';
    return request(`/destinations${qs}`);
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
  async getAll(params?: { limit?: number; page?: number }) {
    const qs = params
      ? `?limit=${params.limit ?? 15}&page=${params.page ?? 1}`
      : '?limit=15&page=1';
    return request(`/events${qs}`);
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

export const partners = {
  async getAll() {
    return request<BePartner[]>('/partners');
  },

  async search(query: string) {
    return request<BePartner[]>(`/partners/search?q=${encodeURIComponent(query)}`);
  },
};

// BE partner shape (snake_case from the API)
interface BePartner {
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
}

export type { User, ProfileResponse, AuthResponse, APIResponse, BeReview, BePartner };

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
