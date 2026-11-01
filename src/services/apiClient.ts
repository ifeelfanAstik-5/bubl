import {
  UserProfile,
  BubblePost,
  Friend,
  DirectMessage,
  AvatarConfig
} from '../../shared/types';
import {
  INITIAL_USER,
  INITIAL_FRIENDS,
  INITIAL_BUBBLES,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_USER_PUBLISHED_BUBBLES
} from '../data/mockData';

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
        return null;
      }

      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      // Backend offline or running in standalone static preview
      return null;
    }
  }

  // USER & PROFILE
  async getMe(): Promise<UserProfile> {
    const data = await this.request<UserProfile>('/me');
    return data || INITIAL_USER;
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

  async awardBreathXP(xp: number): Promise<{ breathExp: number; breathLevel: number; dailyBreathEnergy: number } | null> {
    return this.request('/me/breath-xp', {
      method: 'POST',
      body: JSON.stringify({ xp })
    });
  }

  // BUBBLES
  async getAtmosphereBubbles(): Promise<BubblePost[]> {
    const list = await this.request<BubblePost[]>('/bubbles/atmosphere');
    return list && list.length > 0 ? list : INITIAL_BUBBLES;
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
    promptQuestion?: string;
  }): Promise<any> {
    return this.request('/bubbles', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getMyBubbles(): Promise<BubblePost[]> {
    const list = await this.request<BubblePost[]>('/bubbles/mine');
    return list || INITIAL_USER_PUBLISHED_BUBBLES;
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
    return list && list.length > 0 ? list : INITIAL_FRIENDS;
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
    return list || (INITIAL_DIRECT_MESSAGES[friendId] || []);
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
