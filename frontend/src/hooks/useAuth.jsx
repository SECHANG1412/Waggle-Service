import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { showErrorAlert } from '../utils/alertUtils';
import { AuthContext } from './auth-context';

const EXPIRED_TOKEN_DETAILS = new Set(['access_token_expired', 'refresh_token_expired']);

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  const verifyJWT = useCallback(async () => {
    try {
      const response = await api.get('/users/me');
      setIsAuthenticated(true);
      setUser(response.data);
      setIsAuthLoading(false);
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        const detail = error.response.data?.detail;

        if (EXPIRED_TOKEN_DETAILS.has(detail)) {
          showErrorAlert(error, '?ëª„ë€¡??ï§ëš®ì¦º?ì„ë¿€?ë“¬ë•²?? ?ã…¼ë–† æ¿¡ì’“ë ‡?ëª…ë¹ äºŒì‡±ê½­??');
          navigate('/login');
        }
      }
      setIsAuthenticated(false);
      setUser(null);
      setIsAuthLoading(false);
      return false;
    }
  }, [navigate]);

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
      setError(error.response?.data.detail || 'æ¿¡ì’“ë ‡?ëª„ë¿‰ ?ã…½ë™£?ë‰ë’¿?ëˆë–Ž.');
      setIsAuthenticated(false);
      return false;
    }
  };

  const signup = async ({ email, username, password, confirmPassword }) => {
    setError('');
    if (!email.includes('@')) {
      setError('?Ñ‰ì»®ç‘œ??ëŒ€ì°“???ëº¤ë–‡???ë‚…ì °?ëŒï¼œ?ëª„ìŠ‚.');
      return false;
    }
    if (username.length < 2) {
      setError('?ë°ê½•?ê¾©? 2???ëŒê¸½?ëŒë¼±???â‘¸ë•²??');
      return false;
    }
    if (password.length < 6) {
      setError('é®ê¾¨?è¸°ëŠìƒ‡??6???ëŒê¸½?ëŒë¼±???â‘¸ë•²??');
      return false;
    }
    if (password !== confirmPassword) {
      setError('é®ê¾¨?è¸°ëŠìƒ‡åª›Â€ ?ì‡±íŠ‚?ì„? ?ë”†ë’¿?ëˆë–Ž.');
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
      setError(error.response?.data.detail || '?ëš¯ìåª›Â€?ë‚†ë¿‰ ?ã…½ë™£?ë‰ë’¿?ëˆë–Ž.');
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
      console.error('æ¿¡ì’“ë ‡?ê¾©ì ?ã…½ë™£:', error);
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
