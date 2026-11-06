import {
  UserProfile,
  BubblePost,
  Friend,
  DirectMessage,
  AvatarConfig,
  WeatherCondition
} from '../../shared/types';

const RAW_API_URL = (import.meta as any).env?.VITE_API_URL || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/+$/, '')}/api` : '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('bubl_auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bubl_auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('bubl_auth_token');
    }
  }

  hasToken(): boolean {
    return Boolean(this.token);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include' // include session cookies for web
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid
          this.clearToken();
        }
        return null;
      }

      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      return null;
    }
  }

  // AUTHENTICATION & ONBOARDING
  async login(email: string, password: string): Promise<{ success: boolean; data?: { token: string; user: UserProfile }; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success && json.data?.token) {
        this.setToken(json.data.token);
      }
      return json;
    } catch (e: any) {
      return { success: false, error: e.message || 'Connection error during login' };
    }
  }

  async requestOtp(email: string, purpose: 'login' | 'signup' = 'signup'): Promise<{ success: boolean; testCode?: string; message: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: 'Failed to request code', error: e.message };
    }
  }

  async verifyLoginOtp(email: string, code: string): Promise<{ success: boolean; data?: { token: string; user: UserProfile }; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success && json.data?.token) {
        this.setToken(json.data.token);
      }
      return json;
    } catch (e: any) {
      return { success: false, error: e.message || 'Verification error' };
    }
  }

  async onboard(payload: {
    email: string;
    code: string;
    password: string;
    nickname: string;
    dob: string;
    age: number;
    pronouns: string;
    location: string;
    latitude?: number;
    longitude?: number;
    bio: string;
    languages: string[];
    exchangeInterest: string;
    hobbies: string[];
    avatar: AvatarConfig;
    firstBubble?: {
      title: string;
      content: string;
      bubbleType: string;
      bubbleColor: string;
    };
  }): Promise<{ success: boolean; data?: { token: string; user: UserProfile; debutBubbleId?: string }; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success && json.data?.token) {
        this.setToken(json.data.token);
      }
      return json;
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration error' };
    }
  }

  async logout(): Promise<boolean> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
    return true;
  }

  // USER & PROFILE
  async getMe(): Promise<UserProfile | null> {
    return this.request<UserProfile>('/me');
  }

  async updateProfile(updated: Partial<UserProfile>): Promise<boolean> {
    const res = await this.request('/me', {
      method: 'PATCH',
      body: JSON.stringify(updated)
    });
    return res !== null;
  }

  async updateAvatar(avatar: AvatarConfig): Promise<boolean> {
    const res = await this.request('/me/avatar', {
      method: 'PATCH',
      body: JSON.stringify(avatar)
    });
    return res !== null;
  }

  async takeBreathPause(): Promise<{ mixtureVialMl: number; breathExp: number; breathLevel: number } | null> {
    return this.request('/users/breathe', {
      method: 'POST'
    });
  }

  async refillVial(action: 'breath_pause' | 'read_letter'): Promise<{ mixtureVialMl: number } | null> {
    return this.request('/auth/refill-vial', {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  }

  // ATMOSPHERIC WEATHER & WINDS
  async getWeather(lat: number, lon: number): Promise<WeatherCondition | null> {
    return this.request<WeatherCondition>(`/weather/current?lat=${lat}&lon=${lon}`);
  }

  // BUBBLES
  async getAtmosphereBubbles(): Promise<BubblePost[]> {
    const list = await this.request<BubblePost[]>('/bubbles/atmosphere');
    return list || [];
  }

  async burstBubble(bubbleId: string): Promise<any> {
    return this.request('/bubbles/burst', {
      method: 'POST',
      body: JSON.stringify({ bubbleId })
    });
  }

  async publishBubble(payload: {
    title: string;
    content: string;
    bubbleType: string;
    bubbleColor: string;
    breathEffort: string;
    hobbies: string[];
    mixtureEssence?: string;
    promptQuestion?: string;
  }): Promise<{ success: boolean; bubbleId?: string; mixtureVialMl?: number; error?: string } | null> {
    return this.request('/bubbles', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getMyBubbles(): Promise<BubblePost[]> {
    const list = await this.request<BubblePost[]>('/bubbles/mine');
    return list || [];
  }

  async deleteBubble(bubbleId: string): Promise<boolean> {
    const res = await this.request(`/bubbles/${bubbleId}`, {
      method: 'DELETE'
    });
    return res !== null;
  }

  // ORBITS / CONNECTIONS
  async getOrbits(): Promise<Friend[]> {
    const list = await this.request<Friend[]>('/orbits');
    return list || [];
  }

  async releaseOrbit(friendId: string): Promise<boolean> {
    const res = await this.request(`/orbits/${friendId}/release`, {
      method: 'POST'
    });
    return res !== null;
  }

  async restoreOrbit(friendId: string): Promise<boolean> {
    const res = await this.request(`/orbits/${friendId}/restore`, {
      method: 'POST'
    });
    return res !== null;
  }

  async handshakeMedia(friendId: string, action: 'request' | 'approve'): Promise<boolean> {
    const res = await this.request(`/orbits/${friendId}/handshake`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
    return res !== null;
  }

  // DISPATCHES / MESSAGES
  async getMessages(friendId: string): Promise<DirectMessage[]> {
    const list = await this.request<DirectMessage[]>(`/orbits/${friendId}/messages`);
    return list || [];
  }

  async sendMessage(
    friendId: string,
    payload: {
      body: string;
      bubbleType?: string;
      breathEffort?: 'gentle' | 'balanced' | 'deep';
      mediaAttachments?: any[];
    }
  ): Promise<DirectMessage | null> {
    return this.request<DirectMessage>(`/orbits/${friendId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // DEV TOOLS
  async accelerateWinds(): Promise<boolean> {
    const res = await this.request('/dev/accelerate-winds', {
      method: 'POST'
    });
    return res !== null;
  }

  async resetSuspension(): Promise<boolean> {
    const res = await this.request('/dev/reset-suspension', {
      method: 'POST'
    });
    return res !== null;
  }
}

export const apiClient = new ApiClient();
