import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: string;
}

export const authService = {
  async register(data: any): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: any): Promise<{ access_token: string; refresh_token: string }> {
    // Uses form-urlencoded format required by OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    // Store tokens
    if (response.data.access_token) {
      localStorage.setItem('@EngenhariaPro:token', response.data.access_token);
      localStorage.setItem('@EngenhariaPro:refresh_token', response.data.refresh_token);
    }
    
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('@EngenhariaPro:token');
    localStorage.removeItem('@EngenhariaPro:refresh_token');
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('@EngenhariaPro:refresh_token');
    if (!refreshToken) throw new Error("No refresh token");

    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    if (response.data.access_token) {
      localStorage.setItem('@EngenhariaPro:token', response.data.access_token);
      localStorage.setItem('@EngenhariaPro:refresh_token', response.data.refresh_token);
      return response.data.access_token;
    }
    throw new Error("Failed to refresh token");
  }
};
