import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, ChevronDown, User, Utensils, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCountryListOpen, setIsCountryListOpen] = useState(false);
  const [isRoleListOpen, setIsRoleListOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+243',
    name: 'République Démocratique du Congo',
    flag: '🇨🇩'
  });
  const [selectedRole, setSelectedRole] = useState({
    value: 'client',
    label: 'Client',
    description: 'Commander des plats',
    icon: User
  });
  
  const { register: registerUser, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError: setFormError,
  } = useForm();

  const password = watch('password');

  // ✅ Effacer les erreurs au montage et démontage
  React.useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Liste des codes pays avec drapeaux
  const countryCodes = [
    { code: '+243', name: 'République Démocratique du Congo', flag: '🇨🇩' },
    { code: '+256', name: 'Uganda', flag: 'UG' },
    { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  ];

  // ✅ Liste des rôles disponibles
  const roles = [
    {
      value: 'client',
      label: 'Client',
      description: 'Je veux commander des plats',
      icon: User,
      color: 'text-blue-600'
    },
    {
      value: 'restaurant',
      label: 'Restaurant',
      description: 'Je veux vendre mes plats',
      icon: Utensils,
      color: 'text-green-600'
    },
    {
      value: 'livreur',
      label: 'Livreur',
      description: 'Je veux livrer des commandes',
      icon: Truck,
      color: 'text-orange-600'
    }
  ];

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsCountryListOpen(false);
    setValue('countryCode', country.code);
  };

  // ✅ Fonction pour sélectionner un rôle
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsRoleListOpen(false);
    setValue('role', role.value);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    clearError();
    
    try {
      // Combiner le code pays avec le numéro de téléphone
      const fullPhone = `${data.countryCode}${data.phone.replace(/\s/g, '')}`;
      
      // ✅ Inclure le rôle sélectionné
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: fullPhone,
        address: data.address,
        role: data.role || 'client' // ✅ Rôle sélectionné ou client par défaut
      });
      
      // ✅ Redirection basée sur le rôle après inscription
      if (data.role === 'restaurant') {
        navigate('/restaurant-dashboard');
      } else if (data.role === 'livreur') {
        navigate('/driver-dashboard');
      } else {
        navigate('/', { replace: true });
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      
      if (!authError) {
        setFormError('root', { 
          type: 'manual', 
          message: 'Une erreur est survenue lors de l\'inscription' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Combiner les erreurs du formulaire et du contexte
  const displayError = authError || errors.root?.message;

  // ✅ Icône du rôle sélectionné
  const RoleIcon = selectedRole.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-dark" />
          </div>
          <h2 className="text-2xl font-bold text-dark">Inscription</h2>
          <p className="text-gray-600 mt-2">Créez votre compte</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('countryCode')} value={selectedCountry.code} />
          <input type="hidden" {...register('role')} value={selectedRole.value} />
          
          {/* ✅ Sélecteur de rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Je veux être
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => !isLoading && setIsRoleListOpen(!isRoleListOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center">
                  <RoleIcon className={`w-5 h-5 mr-3 ${selectedRole.color}`} />
                  <span className="font-medium">{selectedRole.label}</span>
                </div>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {isRoleListOpen && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
                >
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div
                        key={role.value}
                        onClick={() => handleRoleSelect(role)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedRole.value === role.value ? 'bg-primary bg-opacity-10' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 mr-3 ${role.color}`} />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{role.label}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>
            {errors.role && (
              <p className="text-error text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Le nom est requis',
                minLength: {
                  value: 2,
                  message: 'Le nom doit contenir au moins 2 caractères'
                }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors disabled:opacity-50"
              placeholder="Jean Mukamba"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-error text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors disabled:opacity-50"
              placeholder="votre@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <div className="flex gap-2">
              {/* Sélecteur de code pays */}
              <div className="relative w-1/3">
                <button
                  type="button"
                  onClick={() => !isLoading && setIsCountryListOpen(!isCountryListOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading}
                >
                  <span>{selectedCountry.flag} {selectedCountry.code}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                
                {isCountryListOpen && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
                  >
                    {countryCodes.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => handleCountrySelect(country)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          selectedCountry.code === country.code ? 'bg-primary bg-opacity-20' : ''
                        }`}
                      >
                        <span className="mr-2">{country.flag}</span>
                        {country.code} - {country.name}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
              
              {/* Champ de numéro de téléphone */}
              <div className="w-2/3">
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Le numéro de téléphone est requis',
                    pattern: {
                      value: /^[0-9\s]{8,15}$/,
                      message: 'Format: 970 123 456'
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors disabled:opacity-50"
                  placeholder="970 123 456"
                  disabled={isLoading}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-error text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              {...register('address', {
                required: 'L\'adresse est requise'
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors disabled:opacity-50"
              placeholder="Quartier, Commune, Bukavu"
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-error text-sm mt-1">{errors.address.message}</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors pr-12 disabled:opacity-50"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => !isLoading && setShowPassword(!showPassword)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Veuillez confirmer votre mot de passe',
                  validate: value =>
                    value === password || 'Les mots de passe ne correspondent pas'
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors pr-12 disabled:opacity-50"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => !isLoading && setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
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
                Inscription...
              </div>
            ) : (
              'S\'inscrire'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Déjà un compte?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:underline font-semibold"
              onClick={clearError}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;