const { supabaseAdmin } = require('../config/database');

// @desc    Obtenir tous les restaurants
// @route   GET /api/restaurants
// @access  Public
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

    // Filtres
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

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error('GetRestaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des restaurants'
    });
  }
};

// @desc    Obtenir un restaurant par ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .select(`
        *,
        dishes:dishes(*),
        user:users(name, phone)
      `)
      .eq('id', id)
      .single();

    if (error || !restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant non trouvé'
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error('GetRestaurantById error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du restaurant'
    });
  }
};

// @desc    Créer un restaurant
// @route   POST /api/restaurants
// @access  Private (Restaurant)
const createRestaurant = async (req, res) => {
  try {
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

    res.status(201).json({
      success: true,
      message: 'Restaurant créé avec succès',
      data: restaurant
    });
  } catch (error) {
    console.error('CreateRestaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du restaurant'
    });
  }
};

// @desc    Mettre à jour un restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant owner)
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur est propriétaire du restaurant
    const { data: restaurant } = await supabaseAdmin
      .from('restaurants')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!restaurant || restaurant.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { data: updatedRestaurant, error } = await supabaseAdmin
      .from('restaurants')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Restaurant mis à jour avec succès',
      data: updatedRestaurant
    });
  } catch (error) {
    console.error('UpdateRestaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du restaurant'
    });
  }
};

// @desc    Supprimer un restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Restaurant owner or Admin)
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier les permissions
    if (req.user.role !== 'admin') {
      const { data: restaurant } = await supabaseAdmin
        .from('restaurants')
        .select('user_id')
        .eq('id', id)
        .single();

      if (!restaurant || restaurant.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }
    }

    const { error } = await supabaseAdmin
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Restaurant supprimé avec succès'
    });
  } catch (error) {
    console.error('DeleteRestaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du restaurant'
    });
  }
};

// @desc    Obtenir les plats d'un restaurant
// @route   GET /api/restaurants/:id/dishes
// @access  Public
const getRestaurantDishes = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, search } = req.query;

    let query = supabaseAdmin
      .from('dishes')
      .select('*')
      .eq('restaurant_id', id)
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

    res.json({
      success: true,
      count: dishes.length,
      data: dishes
    });
  } catch (error) {
    console.error('GetRestaurantDishes error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plats'
    });
  }
};

// @desc    Obtenir les commandes d'un restaurant
// @route   GET /api/restaurants/:id/orders
// @access  Private (Restaurant owner)
const getRestaurantOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    // Vérifier que l'utilisateur est propriétaire du restaurant
    const { data: restaurant } = await supabaseAdmin
      .from('restaurants')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!restaurant || restaurant.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items:order_items(*),
        user:users(name, phone)
      `)
      .eq('restaurant_id', id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('GetRestaurantOrders error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
};

// @desc    Mettre à jour le statut d'un restaurant
// @route   PATCH /api/restaurants/:id/status
// @access  Private (Restaurant owner)
const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Vérifier que l'utilisateur est propriétaire du restaurant
    const { data: restaurant } = await supabaseAdmin
      .from('restaurants')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!restaurant || restaurant.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { data: updatedRestaurant, error } = await supabaseAdmin
      .from('restaurants')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Statut du restaurant mis à jour',
      data: updatedRestaurant
    });
  } catch (error) {
    console.error('UpdateRestaurantStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
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