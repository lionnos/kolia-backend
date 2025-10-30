const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/database');

// ✅ Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ✅ Format standard de réponse pour Axios
const sendSuccessResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  return res.status(statusCode).json(response);
};

const sendErrorResponse = (res, message, statusCode = 500, error = null) => {
  console.error('Error:', message, error);
  const response = {
    success: false,
    message,
    ...(error && process.env.NODE_ENV === 'development' && { error: error.message })
  };
  return res.status(statusCode).json(response);
};

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role = 'client' } = req.body;

    // ✅ Validation des champs requis
    if (!name || !email || !password) {
      return sendErrorResponse(res, 'Nom, email et mot de passe sont requis', 400);
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }

    if (existingUser) {
      return sendErrorResponse(res, 'Un utilisateur avec cet email existe déjà', 400);
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const { data: user, error: createError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          phone,
          address,
          role
        }
      ])
      .select('id, name, email, phone, address, role, created_at')
      .single();

    if (createError) {
      throw createError;
    }

    // Générer le token
    const token = generateToken(user.id);

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res, 
      'Utilisateur créé avec succès', 
      {
        user,
        token
      },
      201
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de l\'inscription', 500, error);
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation des champs requis
    if (!email || !password) {
      return sendErrorResponse(res, 'Email et mot de passe sont requis', 400);
    }

    // Récupérer l'utilisateur avec le mot de passe
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return sendErrorResponse(res, 'Email ou mot de passe incorrect', 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendErrorResponse(res, 'Email ou mot de passe incorrect', 401);
    }

    // Générer le token
    const token = generateToken(user.id);

    // Retourner les données sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      'Connexion réussie',
      {
        user: userWithoutPassword,
        token
      }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la connexion', 500, error);
  }
};

// @desc    Obtenir le profil utilisateur
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    
    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      'Profil utilisateur récupéré avec succès',
      userWithoutPassword
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération du profil', 500, error);
  }
};

// @desc    Mettre à jour le profil utilisateur
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    // ✅ Validation des données
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    if (Object.keys(updates).length === 0) {
      return sendErrorResponse(res, 'Aucune donnée à mettre à jour', 400);
    }

    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, name, email, phone, address, role, created_at, updated_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      'Profil mis à jour avec succès',
      user
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la mise à jour du profil', 500, error);
  }
};

// @desc    Déconnexion (invalider le token côté client)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // ✅ En production, vous pourriez blacklister le token ici
    // Pour l'instant, le client supprime simplement le token
    
    return sendSuccessResponse(
      res,
      'Déconnexion réussie'
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la déconnexion', 500, error);
  }
};

// @desc    Rafraîchir le token
// @route   POST /api/auth/refresh-token
// @access  Private
const refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Générer un nouveau token
    const newToken = generateToken(userId);

    return sendSuccessResponse(
      res,
      'Token rafraîchi avec succès',
      {
        token: newToken
      }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors du rafraîchissement du token', 500, error);
  }
};

module.exports = {
  register,
  login,
  getProfile, // ✅ Renommé de getMe à getProfile pour cohérence
  updateProfile,
  logout,      // ✅ Nouvelle fonction
  refreshToken // ✅ Nouvelle fonction
};