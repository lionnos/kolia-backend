import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated, isRestaurant, isDriver } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          Bukavu Delivery
        </Link>

        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {/* Liens spécifiques en fonction du rôle */}
              {isRestaurant && (
                <Link to="/restaurant-dashboard" className="text-gray-700 hover:text-primary flex items-center">
                  <User className="w-5 h-5 mr-1" />
                  Tableau de bord
                </Link>
              )}
              
              {isDriver && (
                <Link to="/driver-dashboard" className="text-gray-700 hover:text-primary flex items-center">
                  <Package className="w-5 h-5 mr-1" />
                  Mes livraisons
                </Link>
              )}
              
              {user?.role === 'client' && (
                <>
                  <Link to="/cart" className="text-gray-700 hover:text-primary flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-1" />
                    Panier
                  </Link>
                  <Link to="/orders" className="text-gray-700 hover:text-primary">
                    Mes commandes
                  </Link>
                </>
              )}
              
              <button
                onClick={logout}
                className="text-gray-700 hover:text-primary flex items-center"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-primary">
                Connexion
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-primary">
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;