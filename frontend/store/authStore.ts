import { create } from 'zustand';
import { Platform } from 'react-native';
import { authApi, User } from '../api/client';

const TOKEN_KEY = 'inversie_auth_token';
const USER_KEY = 'inversie_user';

// Simple localStorage-based storage for web
// For native apps, you would use expo-secure-store, but for web development we use localStorage
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  },
};

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, pin: string) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Try to get stored token
      const token = await storage.getItem(TOKEN_KEY);
      const userStr = await storage.getItem(USER_KEY);

      if (token && userStr) {
        // Verify token is still valid
        try {
          const user = await authApi.me(token);
          set({
            token,
            user,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          // Token is invalid, clear storage
          await storage.removeItem(TOKEN_KEY);
          await storage.removeItem(USER_KEY);
          set({
            token: null,
            user: null,
            isLoading: false,
            isInitialized: true,
          });
        }
      } else {
        set({
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        isInitialized: true,
        error: 'Failed to initialize auth',
      });
    }
  },

  login: async (email: string, pin: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login(email, pin);

      // Store token and user
      await storage.setItem(TOKEN_KEY, response.token);
      await storage.setItem(USER_KEY, JSON.stringify(response.user));

      set({
        token: response.token,
        user: response.user,
        isLoading: false,
      });

      return response.user;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Login failed',
      });
      throw error;
    }
  },

  logout: async () => {
    const { token } = get();

    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      // Ignore logout API errors
    }

    // Clear storage
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_KEY);

    set({
      token: null,
      user: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
