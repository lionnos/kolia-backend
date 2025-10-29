import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // ✅ Vérifiez le chemin (contexts vs context)

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error: authError, clearError } = useAuth(); // ✅ Récupération de l'erreur du contexte
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  const redirect = new URLSearchParams(location.search).get('redirect');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm();

  // ✅ Effacer les erreurs au montage et démontage
  React.useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    clearError(); // ✅ Effacer les erreurs précédentes
    
    try {
      const response = await login(data.email, data.password);
      
      // ✅ Redirection basée sur le rôle de l'utilisateur
      if (response.user?.role === 'restaurant') {
        navigate('/restaurant-dashboard');
      } else if (response.user?.role === 'livreur') {
        navigate('/driver-dashboard');
      } else {
        // Pour les clients, garder la logique existante
        if (redirect === 'checkout') {
          navigate('/checkout');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      // ✅ L'erreur est déjà gérée dans AuthContext, on peut l'afficher directement
      console.error('Login error:', err);
      
      // ✅ Si l'erreur n'est pas dans le contexte, on l'affiche dans le formulaire
      if (!authError) {
        setFormError('root', { 
          type: 'manual', 
          message: 'Une erreur est survenue lors de la connexion' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Combiner les erreurs du formulaire et du contexte
  const displayError = authError || errors.root?.message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-dark" />
          </div>
          <h2 className="text-2xl font-bold text-dark">Connexion</h2>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>

        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-error text-white p-3 rounded-lg mb-4 text-sm"
          >
            {displayError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'L\'email est requis',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Email invalide'
                }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
              placeholder="votre@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: {
                    value: 6,
                    message: 'Le mot de passe doit contenir au moins 6 caractères'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors pr-12"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary text-dark hover:bg-opacity-80'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin mr-2"></div>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Pas encore de compte?{' '}
            <Link 
              to="/register" 
              className="text-primary hover:underline font-semibold"
              onClick={clearError} // ✅ Effacer les erreurs en changeant de page
            >
              S'inscrire
            </Link>
          </p>
        </div>

        {/* Lien mot de passe oublié (optionnel) */}
        <div className="mt-4 text-center">
          <Link 
            to="/forgot-password" 
            className="text-sm text-primary hover:underline"
            onClick={clearError}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/*<div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Comptes de test: <br />
            Client: client@bukavu.com / 123456 <br />
            Restaurant: restaurant@bukavu.com / 123456 <br />
            Livreur: livreur@bukavu.com / 123456
          </p>
        </div>*/}
      </motion.div>
    </div>
  );
};

export default Login;