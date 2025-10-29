import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout, isAuthenticated, isClient, isRestaurant, isDriver } = useAuth();
  const { getTotalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // ✅ Appel API de déconnexion via AuthContext (qui utilise Axios)
      await logout();
      clearCart(); // ✅ Vider le panier lors de la déconnexion
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // ✅ Déconnexion côté client même si l'API échoue
      clearCart();
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ✅ Navigation basée sur le rôle
  const getRoleBasedLinks = () => {
    if (isClient) {
      return (
        <>
          <Link
            to="/orders"
            className="text-dark hover:text-primary transition-colors flex items-center space-x-1"
          >
            <Package className="w-4 h-4" />
            <span>Mes Commandes</span>
          </Link>
          <Link
            to="/cart"
            className="relative text-dark hover:text-primary transition-colors flex items-center space-x-1"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Panier</span>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </>
      );
    }

    if (isRestaurant) {
      return (
        <Link
          to="/restaurant-dashboard"
          className="text-dark hover:text-primary transition-colors flex items-center space-x-1"
        >
          <Package className="w-4 h-4" />
          <span>Tableau de Bord</span>
        </Link>
      );
    }

    if (isDriver) {
      return (
        <Link
          to="/driver-dashboard"
          className="text-dark hover:text-primary transition-colors flex items-center space-x-1"
        >
          <Truck className="w-4 h-4" />
          <span>Livraisons</span>
        </Link>
      );
    }

    return null;
  };

  return (
    <header className="bg-white shadow-lg relative z-50 sticky top-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-primary rounded-full p-2"
            >
              <Search className="w-6 h-6 text-dark" />
            </motion.div>
            <span className="text-xl font-bold text-dark">KOLIA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-dark hover:text-primary transition-colors font-medium"
            >
              Accueil
            </Link>
            
            {isAuthenticated && getRoleBasedLinks()}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-dark">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Bonjour, {user?.name}</span>
                  {user?.role && (
                    <span className="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded-full">
                      {user.role === 'client' && 'Client'}
                      {user.role === 'restaurant' && 'Restaurant'}
                      {user.role === 'livreur' && 'Livreur'}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLoggingOut 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-error text-white hover:bg-red-600'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-dark hover:text-primary transition-colors font-medium"
                >
                  Connexion
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="bg-primary text-dark px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors font-medium"
                  >
                    S'inscrire
                  </Link>
                </motion.div>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu mobile"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t bg-white"
          >
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-dark hover:text-primary transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              
              {isAuthenticated && (
                <div className="space-y-3">
                  {getRoleBasedLinks()}
                  
                  {/* Informations utilisateur */}
                  <div className="flex items-center space-x-2 text-dark py-2 border-t pt-4">
                    <User className="w-4 h-4" />
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-gray-600">
                        {user?.role === 'client' && 'Client'}
                        {user?.role === 'restaurant' && 'Restaurant'}
                        {user?.role === 'livreur' && 'Livreur'}
                      </p>
                    </div>
                  </div>

                  {/* Bouton déconnexion */}
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg transition-colors ${
                      isLoggingOut 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-error text-white hover:bg-red-600'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="space-y-3 border-t pt-4">
                  <Link
                    to="/login"
                    className="block text-dark hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-primary text-dark px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
};

export default Header;