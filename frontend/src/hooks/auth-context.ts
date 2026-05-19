import { createContext, useContext } from 'react';
import type { UserRead, UserSignupRequest } from '../types';

export type AuthContextValue = {
  error: string;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (formData: UserSignupRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  user: UserRead | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
