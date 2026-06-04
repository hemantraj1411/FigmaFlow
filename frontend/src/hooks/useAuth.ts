'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  name: string;
  email: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodDate?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setAuth: (user: User | null, token: string | null) => void;
}

const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: !!user && !!token });
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setCookie('token', token);
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, { email, password });
          const { token, user } = response.data;
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setCookie('token', token);
          
          set({ 
            user, 
            token, 
            isLoading: false, 
            isAuthenticated: true 
          });
          
          toast.success('Welcome back! 🎉');
          return true;
        } catch (error: any) {
          set({ isLoading: false, isAuthenticated: false });
          toast.error(error.response?.data?.message || 'Login failed');
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
          const { token, user } = response.data;
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setCookie('token', token);
          
          set({ 
            user, 
            token, 
            isLoading: false, 
            isAuthenticated: true 
          });
          
          toast.success('Account created successfully! 🎉');
          return true;
        } catch (error: any) {
          set({ isLoading: false, isAuthenticated: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoading: false, isAuthenticated: false });
        delete axios.defaults.headers.common['Authorization'];
        deleteCookie('token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
      },

      updateProfile: async (data) => {
        try {
          const token = get().token;
          const response = await axios.put(`${API_URL}/auth/profile`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
          set({ user: response.data.user });
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success('Profile updated successfully!');
        } catch (error) {
          toast.error('Failed to update profile');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);