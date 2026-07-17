const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/pleco';

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

let accessToken: string | null = null;

if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('pleco_access_token');
}

function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('pleco_access_token', token);
  } else {
    localStorage.removeItem('pleco_access_token');
  }
}

function getAccessToken(): string | null {
  return accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if ((res.status === 401 || res.status === 403) && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options);
    }
    setAccessToken(null);
    return { status: 'error', message: 'Unauthorized' } as any;
  }

  let json: APIResponse<T>;
  try {
    json = await res.json();
  } catch {
    json = { status: 'error', message: `Server returned status ${res.status}` } as any;
  }

  return json;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
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
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.status === 'success' && res.data) {
      setAccessToken(res.data.access_token);
    }
    return res;
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

  async updateAvatarUrl(name: string, url: string) {
    return request<{ avatar_url: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name, avatar_url: url }),
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

  async updateCoverUrl(name: string, url: string) {
    return request<{ cover_image_url: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name, cover_image_url: url }),
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
    const res = await request('/auth/logout', { method: 'POST' });
    setAccessToken(null);
    return res;
  },

  async socialLogin(provider: 'google' | 'facebook', token: string) {
    const res = await request<AuthResponse>('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify({ provider, token }),
    });
    if (res.status === 'success' && res.data) {
      setAccessToken(res.data.access_token);
    }
    return res;
  },

  async refreshToken() {
    return tryRefresh();
  },

  isLoggedIn() {
    return !!accessToken;
  },

  getAccessToken,
};

interface AIQueryResponse {
  reply: string;
  matchedDestinationIds: string[];
}

export const destinations = {
  async getAll() {
    return request('/destinations');
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
  async getAll() {
    return request('/events');
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
    return request<Array<{
      id: string;
      destination_id: string;
      destination_name: string;
      destination_image?: string;
      status: 'planned' | 'ongoing' | 'completed';
      start_date?: string;
      end_date?: string;
      notes?: string;
    }>>('/trips');
  },

  async create(destinationId: string, startDate?: string, endDate?: string, notes?: string) {
    return request('/trips', {
      method: 'POST',
      body: JSON.stringify({
        destination_id: destinationId,
        start_date: startDate,
        end_date: endDate,
        notes,
      }),
    });
  },

  async update(tripId: string, data: { status?: string; notes?: string; start_date?: string; end_date?: string }) {
    return request(`/trips/${tripId}`, {
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
