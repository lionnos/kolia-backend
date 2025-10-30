const { supabaseAdmin } = require('../config/database');

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
  console.error('Dish Controller Error:', message, error);
  const response = {
    success: false,
    message,
    ...(error && process.env.NODE_ENV === 'development' && { error: error.message })
  };
  return res.status(statusCode).json(response);
};

// @desc    Obtenir tous les plats
// ... (Pas de changement ici, pas de req.params.id)
const getDishes = async (req, res) => {
  try {
    const { restaurant_id, category, search, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('dishes')
      .select(`
        *,
        restaurant:restaurants(name, commune, address, phone, delivery_fee, delivery_time)
      `)
      .eq('is_available', true);

    // Filtres (Si restaurant_id est dans req.query, il n'est pas nécessaire de le parser car il est string, mais si la BDD l'exige, il faudrait le faire ici aussi)
    if (restaurant_id) {
      // 💡 Correction optionnelle si restaurant_id est envoyé via query et doit être un nombre:
      const numericRestaurantId = parseInt(restaurant_id, 10);
      if (!isNaN(numericRestaurantId)) {
        query = query.eq('restaurant_id', numericRestaurantId);
      }
    }

    if (category && category !== 'Tous') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,ingredients.ilike.%${search}%`);
    }

    const { data: dishes, error, count } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    return sendSuccessResponse(
      res,
      'Plats récupérés avec succès',
      {
        dishes,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération des plats', 500, error);
  }
};

// @desc    Obtenir les plats d'un restaurant
// @route   GET /api/dishes/restaurant/:restaurantId
// @access  Public
const getDishesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params; // Chaîne reçue de l'URL

    // 🔑 CORRECTION N°1 : Conversion de req.params.restaurantId
    const numericRestaurantId = parseInt(restaurantId, 10);
    if (isNaN(numericRestaurantId)) {
      return sendErrorResponse(res, 'ID du restaurant invalide', 400);
    }

    const { category, available = true } = req.query;

    let query = supabaseAdmin
      .from('dishes')
      .select('*')
      .eq('restaurant_id', numericRestaurantId); // Utilisation de l'ID numérique

    if (available) {
      query = query.eq('is_available', true);
    }

    if (category && category !== 'Tous') {
      query = query.eq('category', category);
    }

    const { data: dishes, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return sendSuccessResponse(
      res,
      `Plats du restaurant récupérés avec succès`,
      { dishes }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération des plats du restaurant', 500, error);
  }
};

// @desc    Rechercher des plats
// ... (Pas de changement ici, pas de req.params.id)
const searchDishes = async (req, res) => {
  // ... (Code conservé)
};

// @desc    Obtenir un plat par ID
// @route   GET /api/dishes/:id
// @access  Public
const getDishById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔑 CORRECTION N°2 : Conversion de req.params.id
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de plat invalide', 400);
    }

    const { data: dish, error } = await supabaseAdmin
      .from('dishes')
      .select(`
        *,
        restaurant:restaurants(
          id,
          name, 
          commune, 
          phone, 
          address,
          delivery_fee,
          delivery_time,
          category
        )
      `)
      .eq('id', numericId) // Utilisation de l'ID numérique
      .single();

    if (error || !dish) {
      return sendErrorResponse(res, 'Plat non trouvé', 404);
    }

    return sendSuccessResponse(
      res,
      'Plat récupéré avec succès',
      { dish }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération du plat', 500, error);
  }
};

// @desc    Créer un plat
// ... (Pas de changement ici, pas de req.params.id)
const createDish = async (req, res) => {
  // ... (Code conservé)
};

// @desc    Mettre à jour un plat
// @route   PUT /api/dishes/:id
// @access  Private (Restaurant owner)
const updateDish = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔑 CORRECTION N°3 : Conversion de req.params.id
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de plat invalide', 400);
    }

    // Vérifier que l'utilisateur est propriétaire du plat
    const { data: dish, error: dishError } = await supabaseAdmin
      .from('dishes')
      .select(`
        *,
        restaurant:restaurants(user_id)
      `)
      .eq('id', numericId) // Utilisation de l'ID numérique
      .single();

    if (dishError || !dish) {
      return sendErrorResponse(res, 'Plat non trouvé', 404);
    }

    if (dish.restaurant.user_id !== req.user.id) {
      return sendErrorResponse(res, 'Accès refusé - Vous n\'êtes pas propriétaire de ce plat', 403);
    }

    const { data: updatedDish, error } = await supabaseAdmin
      .from('dishes')
      .update(req.body)
      .eq('id', numericId) // Utilisation de l'ID numérique
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return sendSuccessResponse(
      res,
      'Plat mis à jour avec succès',
      { dish: updatedDish }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la mise à jour du plat', 500, error);
  }
};

// @desc    Supprimer un plat
// @route   DELETE /api/dishes/:id
// @access  Private (Restaurant owner)
const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔑 CORRECTION N°4 : Conversion de req.params.id
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return sendErrorResponse(res, 'ID de plat invalide', 400);
    }

    // Vérifier que l'utilisateur est propriétaire du plat
    const { data: dish, error: dishError } = await supabaseAdmin
      .from('dishes')
      .select(`
        *,
        restaurant:restaurants(user_id)
      `)
      .eq('id', numericId) // Utilisation de l'ID numérique
      .single();

    if (dishError || !dish) {
      return sendErrorResponse(res, 'Plat non trouvé', 404);
    }

    if (dish.restaurant.user_id !== req.user.id) {
      return sendErrorResponse(res, 'Accès refusé - Vous n\'êtes pas propriétaire de ce plat', 403);
    }

    const { error } = await supabaseAdmin
      .from('dishes')
      .delete()
      .eq('id', numericId); // Utilisation de l'ID numérique

    if (error) {
      throw error;
    }

    return sendSuccessResponse(
      res,
      'Plat supprimé avec succès'
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la suppression du plat', 500, error);
  }
};

// @desc    Obtenir les catégories de plats
// ... (Pas de changement ici, pas de req.params.id)
const getDishCategories = async (req, res) => {
  // ... (Code conservé)
};

module.exports = {
  getDishes,
  getDishesByRestaurant,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  searchDishes,
  getDishCategories
};