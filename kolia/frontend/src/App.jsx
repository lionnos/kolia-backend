import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des composants
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Restaurant from './pages/Restaurant';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import RestaurantDashboard from './pages/RestaurantDashboard';
import DeliveryDriverDashboard from './pages/DeliveryDriverDashboard';
import OrderSuccess from './pages/OrderSuccess';
import TestApi from './pages/TestApi';

function App() {
  const [backendStatus, setBackendStatus] = useState({
    status: 'loading',
    message: 'Connexion au backend en cours...'
  });

  // Test de connexion au backend
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        setBackendStatus({
          status: 'loading',
          message: 'Connexion au backend en cours...'
        });
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/health`);
        const data = await response.json();
        
        console.log('✅ Backend connecté:', data);
        setBackendStatus({
          status: 'connected',
          message: 'Backend connecté avec succès'
        });
        
      } catch (error) {
        console.error('❌ Erreur de connexion au backend:', error);
        
        setBackendStatus({
          status: 'error',
          message: `Impossible de contacter le serveur: ${error.message}`
        });
      }
    };

    testBackendConnection();
  }, []);

  const isDevelopment = import.meta.env.DEV;

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            
            {isDevelopment && backendStatus.status !== 'connected' && (
              <div className="container mx-auto px-4 pt-2">
                {backendStatus.status === 'loading' && (
                  <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm text-center">
                    🔄 {backendStatus.message}
                  </div>
                )}
                {backendStatus.status === 'error' && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm text-center">
                    ❌ {backendStatus.message}
                  </div>
                )}
              </div>
            )}

            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurant/:id" element={<Restaurant />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
                <Route path="/driver-dashboard" element={<DeliveryDriverDashboard />} />
                
                {isDevelopment && (
                  <Route path="/test-api" element={<TestApi />} />
                )}
                
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                      <p className="text-gray-600 mb-6">Page non trouvée</p>
                      <a 
                        href="/" 
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Retour à l'accueil
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </main>

            <footer className="bg-gray-800 text-white py-8 mt-12">
              <div className="container mx-auto px-4 text-center">
                <h3 className="text-xl font-bold mb-4">KOLIA</h3>
                <p className="text-gray-400 mb-4">
                  Votre service de livraison de repas à Bukavu
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
                  <span>© 2024 KOLIA</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Contact: +243 XXX XXX XXX</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Email: contact@kolia.cd</span>
                </div>
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;