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

// @desc    Obtenir tous les plats
// @route   GET /api/dishes
// @access  Public
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

    // Filtres
    if (restaurant_id) {
      query = query.eq('restaurant_id', restaurant_id);
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

    // ✅ Réponse structurée pour Axios
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

// @desc    Obtenir les plats d'un restaurant
// @route   GET /api/dishes/restaurant/:restaurantId
// @access  Public
const getDishesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, available = true } = req.query;

    if (!restaurantId) {
      return sendErrorResponse(res, 'ID du restaurant requis', 400);
    }

    let query = supabaseAdmin
      .from('dishes')
      .select('*')
      .eq('restaurant_id', restaurantId);

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

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      `Plats du restaurant récupérés avec succès`,
      { dishes }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération des plats du restaurant', 500, error);
  }
};

// @desc    Rechercher des plats
// @route   GET /api/dishes/search
// @access  Public
const searchDishes = async (req, res) => {
  try {
    const { q, commune, category, min_price, max_price, limit = 20 } = req.query;

    if (!q) {
      return sendErrorResponse(res, 'Paramètre de recherche requis', 400);
    }

    let query = supabaseAdmin
      .from('dishes')
      .select(`
        *,
        restaurant:restaurants(name, commune, category, address, phone)
      `)
      .eq('is_available', true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,ingredients.ilike.%${q}%`);

    // Filtres additionnels
    if (commune && commune !== 'Tous') {
      query = query.eq('restaurant.commune', commune);
    }

    if (category && category !== 'Tous') {
      query = query.eq('category', category);
    }

    if (min_price) {
      query = query.gte('price', parseFloat(min_price));
    }

    if (max_price) {
      query = query.lte('price', parseFloat(max_price));
    }

    const { data: dishes, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      `Recherche effectuée avec succès - ${dishes.length} résultat(s) trouvé(s)`,
      { dishes }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la recherche', 500, error);
  }
};

// @desc    Obtenir un plat par ID
// @route   GET /api/dishes/:id
// @access  Public
const getDishById = async (req, res) => {
  try {
    const { id } = req.params;

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
      .eq('id', id)
      .single();

    if (error || !dish) {
      return sendErrorResponse(res, 'Plat non trouvé', 404);
    }

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      'Plat récupéré avec succès',
      { dish }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération du plat', 500, error);
  }
};

// @desc    Créer un plat
// @route   POST /api/dishes
// @access  Private (Restaurant)
const createDish = async (req, res) => {
  try {
    // Vérifier que l'utilisateur a un restaurant
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (restaurantError || !restaurant) {
      return sendErrorResponse(res, 'Vous devez avoir un restaurant pour créer des plats', 403);
    }

    // ✅ Validation des données requises
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
      return sendErrorResponse(res, 'Nom, prix et catégorie sont requis', 400);
    }

    const dishData = {
      ...req.body,
      restaurant_id: restaurant.id,
      is_available: req.body.is_available !== undefined ? req.body.is_available : true
    };

    const { data: dish, error } = await supabaseAdmin
      .from('dishes')
      .insert([dishData])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      'Plat créé avec succès',
      { dish },
      201
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la création du plat', 500, error);
  }
};

// @desc    Mettre à jour un plat
// @route   PUT /api/dishes/:id
// @access  Private (Restaurant owner)
const updateDish = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur est propriétaire du plat
    const { data: dish, error: dishError } = await supabaseAdmin
      .from('dishes')
      .select(`
        *,
        restaurant:restaurants(user_id)
      `)
      .eq('id', id)
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
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      'Plat mis à jour avec succès',
      { dish: updatedDish }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la mise à jour du plat', 500, error);
  }
};

// @desc    Supprimer un plat
// @route   DELETE /api/dishes/:id
// @access  Private (Restaurant owner)
const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur est propriétaire du plat
    const { data: dish, error: dishError } = await supabaseAdmin
      .from('dishes')
      .select(`
        *,
        restaurant:restaurants(user_id)
      `)
      .eq('id', id)
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
      .eq('id', id);

    if (error) {
      throw error;
    }

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      'Plat supprimé avec succès'
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la suppression du plat', 500, error);
  }
};

// @desc    Obtenir les catégories de plats
// @route   GET /api/dishes/categories
// @access  Public
const getDishCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('dishes')
      .select('category')
      .eq('is_available', true);

    if (error) {
      throw error;
    }

    const uniqueCategories = [...new Set(categories.map(item => item.category))].filter(Boolean);

    // ✅ Réponse structurée pour Axios
    return sendSuccessResponse(
      res,
      'Catégories récupérées avec succès',
      { categories: uniqueCategories }
    );

  } catch (error) {
    return sendErrorResponse(res, 'Erreur lors de la récupération des catégories', 500, error);
  }
};

module.exports = {
  getDishes,
  getDishesByRestaurant, // ✅ Nouvelle fonction
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  searchDishes,
  getDishCategories // ✅ Nouvelle fonction
};