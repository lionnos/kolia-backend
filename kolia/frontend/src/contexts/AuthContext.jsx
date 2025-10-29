import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api'; // ✅ Changé vers l'API Axios

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('bukavu-token');
    const storedUser = localStorage.getItem('bukavu-user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // ✅ Vérifier si le token est toujours valide
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Fonction pour vérifier la validité du token
  const verifyToken = async (token) => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Token invalide:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // ✅ Utilisation d'Axios via authAPI
      const response = await authAPI.login({ email, password });
      
      // ✅ Axios retourne les données dans response.data
      const { user: userData, token: authToken } = response.data;
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('bukavu-token', authToken);
      localStorage.setItem('bukavu-user', JSON.stringify(userData));
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      
      // ✅ Gestion d'erreur améliorée avec Axios
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur de connexion';
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      // ✅ Utilisation d'Axios via authAPI
      const response = await authAPI.register(userData);
      
      // ✅ Axios retourne les données dans response.data
      const { user: newUser, token: authToken } = response.data;
      
      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('bukavu-token', authToken);
      localStorage.setItem('bukavu-user', JSON.stringify(newUser));
      
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      
      // ✅ Gestion d'erreur améliorée avec Axios
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Erreur lors de l\'inscription';
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    try {
      // ✅ Appel API pour logout côté serveur
      authAPI.logout().catch(console.error);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // ✅ Nettoyage côté client dans tous les cas
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem('bukavu-token');
      localStorage.removeItem('bukavu-user');
    }
  };

  // ✅ Fonction pour mettre à jour le profil utilisateur
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('bukavu-user', JSON.stringify(userData));
  };

  // ✅ Fonction pour effacer les erreurs
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user && !!token,
    isRestaurant: user?.role === 'restaurant',
    isClient: user?.role === 'client',
    isDriver: user?.role === 'livreur'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};