import React from 'react';
import { setAuthToken, getAuthToken, clearAuthToken } from './apollo-client';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Simple auth store (you can replace this with a more robust state management solution)
class AuthStore {
  private listeners: Array<(state: AuthState) => void> = [];
  private state: AuthState = {
    user: null,
    token: getAuthToken(),
    isAuthenticated: !!getAuthToken(),
  };

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  login(token: string, user: User) {
    setAuthToken(token);
    this.state = {
      user,
      token,
      isAuthenticated: true,
    };
    this.notify();
  }

  logout() {
    clearAuthToken();
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
    };
    this.notify();
  }

  getState(): AuthState {
    return this.state;
  }

  // Initialize auth state from stored token
  async initialize() {
    const token = getAuthToken();
    if (token) {
      try {
        // You can add a GraphQL query here to validate the token and get user info
        // For now, we'll just set the token
        this.state = {
          user: null, // You can fetch user info here
          token,
          isAuthenticated: true,
        };
        this.notify();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        this.logout();
      }
    }
  }
}

export const authStore = new AuthStore();

// React hook for using auth state
export const useAuth = () => {
  const [state, setState] = React.useState<AuthState>(authStore.getState());

  React.useEffect(() => {
    const unsubscribe = authStore.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    login: authStore.login.bind(authStore),
    logout: authStore.logout.bind(authStore),
  };
};

// Utility function to check if user has required permissions
export const hasPermission = (
  user: User | null,
  requiredRole?: string
): boolean => {
  if (!user) return false;
  if (!requiredRole) return true;
  return user.role === requiredRole;
};

// Utility function to get auth headers for manual requests
export const getAuthHeaders = (): Record<string, string> => {
  const userToken = getAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: 'apollo-starter-kit', // API authorization token (static)
    ...(userToken && { 'User-Authorization': `Bearer ${userToken}` }), // User auth token (dynamic)
  };
};
