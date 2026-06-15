import { isAxiosError } from 'axios';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_MESSAGES } from '../constants/messages';
import type { UserLoginRequest, UserRead, UserSignupRequest } from '../types';
import api from '../utils/api';
import { AuthContext } from './auth-context';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthErrorResponse = {
  detail?: string;
};

const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (!isAxiosError<AuthErrorResponse>(error)) {
    return fallback;
  }

  return error.response?.data.detail || fallback;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserRead | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  const verifyJWT = useCallback(async () => {
    try {
      const response = await api.get<UserRead>('/users/me', {
        skipAuthRefresh: true,
        suppressAuthAlert: true,
      });
      setIsAuthenticated(true);
      setUser(response.data);
      setIsAuthLoading(false);
      return true;
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      setIsAuthLoading(false);
      return false;
    }
  }, []);

  const login = async (email: string, password: string) => {
    setError('');
    try {
      const payload: UserLoginRequest = { email, password };
      const response = await api.post<UserRead>('/users/login', payload);

      if (response.status === 200) {
        setUser(response.data);
        setIsAuthenticated(true);
        setError('');
        await verifyJWT();
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      setError(getAuthErrorMessage(error, AUTH_MESSAGES.loginFailed));
      setIsAuthenticated(false);
      return false;
    }
  };

  const signup = async ({ email, username, password, confirmPassword }: UserSignupRequest) => {
    setError('');
    if (!email.includes('@')) {
      setError(AUTH_MESSAGES.invalidEmail);
      return false;
    }
    if (username.length < 2) {
      setError(AUTH_MESSAGES.invalidUsername);
      return false;
    }
    if (password.length < 6) {
      setError(AUTH_MESSAGES.invalidPassword);
      return false;
    }
    if (password !== confirmPassword) {
      setError(AUTH_MESSAGES.passwordMismatch);
      return false;
    }
    try {
      const response = await api.post<UserRead>('/users/signup', {
        email,
        username,
        password,
      });

      if (response.status === 200) {
        setError('');
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      setError(getAuthErrorMessage(error, AUTH_MESSAGES.signupFailed));
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await api.post('/users/logout');
      setIsAuthenticated(false);
      setUser(null);

      if (response.status === 200) {
        navigate('/');
      }
    } catch (error) {
      console.error(AUTH_MESSAGES.logoutFailed, error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    }
  };

  useEffect(() => {
    (async () => {
      setIsAuthLoading(true);
      await verifyJWT();
    })();
  }, [verifyJWT]);

  return (
    <AuthContext.Provider
      value={{
        error,
        isAuthenticated,
        isAuthLoading,
        login,
        signup,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
