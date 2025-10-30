const { supabaseAdmin } = require('../config/database');

// --- Fonctions utilitaires (conservées) ---

const sendSuccessResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  return res.status(statusCode).json(response);
};

const sendErrorResponse = (res, message, statusCode = 500, error = null) => {
  console.error('Restaurant Controller Error:', message, error);
  const response = {
    success: false,
    message,
    ...(error && process.env.NODE_ENV === 'development' && { error: error.message })
  };
  return res.status(statusCode).json(response);
};

// --- Fonctions de contrôleur corrigées ---

// @desc    Obtenir tous les restaurants
// ... (Pas de changement ici, pas de req.params.id)
const getRestaurants = async (req, res) => {
  try {
    const { commune, category, search } = req.query;
    
    let query = supabaseAdmin
      .from('restaurants')
      .select(`
        *,
        dishes:dishes(count)
      `)
      .eq('status', 'active');

    // Filtres (commune, category, search) ...

    if (commune && commune !== 'Tous') {
      query = query.eq('commune', commune);
    }

    if (category && category !== 'Tous') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: restaurants, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Utilisation de la fonction de réponse standard
    return sendSuccessResponse(res, 'Restaurants récupérés avec succès', { restaurants }, 200);

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération des restaurants', 500, error);
  }
};

// @desc    Obtenir un restaurant par ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔑 CORRECTION N°1 : Convertir l'ID (chaîne) en nombre (Integer)
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de restaurant invalide', 400);
    }

    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .select(`
        *,
        dishes:dishes(*),
        user:users(name, phone)
      `)
      .eq('id', numericId) // Utilisation de numericId
      .single();

    if (error || !restaurant) {
      return sendErrorResponse(res, 'Restaurant non trouvé', 404);
    }

    return sendSuccessResponse(res, 'Restaurant récupéré avec succès', { restaurant });
  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération du restaurant', 500, error);
  }
};

// @desc    Créer un restaurant
// ... (Pas de changement ici, pas de req.params.id)
const createRestaurant = async (req, res) => {
  try {
    // ... (Logique de création)
    const restaurantData = {
      ...req.body,
      user_id: req.user.id
    };

    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .insert([restaurantData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return sendSuccessResponse(res, 'Restaurant créé avec succès', { restaurant }, 201);
  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la création du restaurant', 500, error);
  }
};

// @desc    Mettre à jour un restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant owner)
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔑 CORRECTION N°2 : Convertir l'ID (chaîne) en nombre
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de restaurant invalide', 400);
    }

    // Vérifier que l'utilisateur est propriétaire du restaurant
    const { data: restaurant } = await supabaseAdmin
      .from('restaurants')
      .select('user_id')
      .eq('id', numericId) // Utilisation de numericId
      .single();

    if (!restaurant || restaurant.user_id !== req.user.id) {
      return sendErrorResponse(res, 'Accès refusé', 403);
    }

    const { data: updatedRestaurant, error } = await supabaseAdmin
      .from('restaurants')
      .update(req.body)
      .eq('id', numericId) // Utilisation de numericId
      .select()
      .single();

    if (error) {
      throw error;
    }

    return sendSuccessResponse(res, 'Restaurant mis à jour avec succès', { restaurant: updatedRestaurant });
  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la mise à jour du restaurant', 500, error);
  }
};

// @desc    Supprimer un restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Restaurant owner or Admin)
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 🔑 CORRECTION N°3 : Convertir l'ID (chaîne) en nombre
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de restaurant invalide', 400);
    }

    // Vérifier les permissions
    if (req.user.role !== 'admin') {
      const { data: restaurant } = await supabaseAdmin
        .from('restaurants')
        .select('user_id')
        .eq('id', numericId) // Utilisation de numericId
        .single();

      if (!restaurant || restaurant.user_id !== req.user.id) {
        return sendErrorResponse(res, 'Accès refusé', 403);
      }
    }

    const { error } = await supabaseAdmin
      .from('restaurants')
      .delete()
      .eq('id', numericId); // Utilisation de numericId

    if (error) {
      throw error;
    }

    return sendSuccessResponse(res, 'Restaurant supprimé avec succès');
  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la suppression du restaurant', 500, error);
  }
};

// @desc    Obtenir les plats d'un restaurant
// @route   GET /api/restaurants/:id/dishes
// @access  Public
const getRestaurantDishes = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, search } = req.query;

    // 🔑 CORRECTION N°4 : Convertir l'ID (chaîne) en nombre
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de restaurant invalide', 400);
    }

    let query = supabaseAdmin
      .from('dishes')
      .select('*')
      .eq('restaurant_id', numericId) // Utilisation de numericId
      .eq('is_available', true);

    if (category && category !== 'Tous') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: dishes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return sendSuccessResponse(res, 'Plats récupérés avec succès', { count: dishes.length, dishes });
  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération des plats', 500, error);
  }
};

// @desc    Obtenir les commandes d'un restaurant
// @route   GET /api/restaurants/:id/orders
// @access  Private (Restaurant owner)
const getRestaurantOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    // 🔑 CORRECTION N°5 : Convertir l'ID (chaîne) en nombre
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de restaurant invalide', 400);
    }

    // Vérifier que l'utilisateur est propriétaire du restaurant
    const { data: restaurant } = await supabaseAdmin
      .from('restaurants')
      .select('user_id')
      .eq('id', numericId) // Utilisation de numericId
      .single();

    if (!restaurant || restaurant.user_id !== req.user.id) {
      return sendErrorResponse(res, 'Accès refusé', 403);
    }

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items:order_items(*),
        user:users(name, phone)
      `)
      .eq('restaurant_id', numericId); // Utilisation de numericId

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return sendSuccessResponse(res, 'Commandes récupérées avec succès', { count: orders.length, orders });
  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération des commandes', 500, error);
  }
};

// @desc    Mettre à jour le statut d'un restaurant
// @route   PATCH /api/restaurants/:id/status
// @access  Private (Restaurant owner)
const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 🔑 CORRECTION N°6 : Convertir l'ID (chaîne) en nombre
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de restaurant invalide', 400);
    }

    // Vérifier que l'utilisateur est propriétaire du restaurant
    const { data: restaurant } = await supabaseAdmin
      .from('restaurants')
      .select('user_id')
      .eq('id', numericId) // Utilisation de numericId
      .single();

    if (!restaurant || restaurant.user_id !== req.user.id) {
      return sendErrorResponse(res, 'Accès refusé', 403);
    }

    const { data: updatedRestaurant, error } = await supabaseAdmin
      .from('restaurants')
      .update({ status })
      .eq('id', numericId) // Utilisation de numericId
      .select()
      .single();

    if (error) {
      throw error;
    }

    return sendSuccessResponse(res, 'Statut du restaurant mis à jour', { restaurant: updatedRestaurant });
  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la mise à jour du statut', 500, error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantDishes,
  getRestaurantOrders,
  updateRestaurantStatus
};