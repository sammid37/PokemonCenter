import api from './api';
import { AuthResponse, LoginDto, RegisterDto, User } from '@/types';

export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', dto);
    localStorage.setItem('access_token', data.access_token);
    return data;
  },

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', dto);
    localStorage.setItem('access_token', data.access_token);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};