import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, tokenStorage } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        try {
          const profile = await authAPI.getProfile(token);
          setUser(profile);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          tokenStorage.clearTokens();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      // Use email as username for login
      const response = await authAPI.login({ username: email, password });
      
      // Store tokens
      tokenStorage.setAccessToken(response.access);
      tokenStorage.setRefreshToken(response.refresh);
      
      // Fetch user profile
      const profile = await authAPI.getProfile(response.access);
      setUser(profile);
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      
      // Auto-login after registration
      const loginResponse = await authAPI.login({
        username: userData.email,
        password: userData.password,
      });
      
      tokenStorage.setAccessToken(loginResponse.access);
      tokenStorage.setRefreshToken(loginResponse.refresh);
      
      const profile = await authAPI.getProfile(loginResponse.access);
      setUser(profile);
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setUser(null);
    setError(null);
    navigate('/', { replace: true });
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};