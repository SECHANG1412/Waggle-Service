import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_MESSAGES } from '../constants/messages';
import api from '../utils/api';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  const verifyJWT = useCallback(async () => {
    try {
      const response = await api.get('/users/me', {
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

  const login = async (email, password) => {
    setError('');
    try {
      const response = await api.post('/users/login', { email, password });

      if (response.status === 200) {
        setUser(response.data);
        setIsAuthenticated(true);
        setError('');
        await verifyJWT();
        return true;
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data.detail || AUTH_MESSAGES.loginFailed);
      setIsAuthenticated(false);
      return false;
    }
  };

  const signup = async ({ email, username, password, confirmPassword }) => {
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
      const response = await api.post('/users/signup', {
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
      setError(error.response?.data.detail || AUTH_MESSAGES.signupFailed);
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
