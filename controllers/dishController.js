// @desc    Obtenir les plats d'un restaurant
// @route   GET /api/dishes/restaurant/:restaurantId
// @access  Public
const getDishesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const numericRestaurantId = parseInt(restaurantId, 10);
    if (isNaN(numericRestaurantId)) {
      return res.status(400).json({
        success: false,
        error: 'ID du restaurant invalide'
      });
    }

    const { category, available = true } = req.query;

    let query = supabaseAdmin
      .from('dishes')
      .select('*')
      .eq('restaurant_id', numericRestaurantId);

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

    // ✅ CORRECTION : Structure SIMPLIFIÉE comme getRestaurants
    res.json({
      success: true,
      count: dishes?.length || 0,
      data: dishes || []  // ⬅️ Tableau DIRECT dans data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des plats du restaurant'
    });
  }
};