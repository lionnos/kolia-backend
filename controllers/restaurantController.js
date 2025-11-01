// @desc    Obtenir un restaurant par ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de restaurant invalide'
      });
    }

    const { data: restaurant, error } = await supabaseAdmin
      .from('restaurants')
      .select(`
        *,
        dishes:dishes(*)
      `)
      .eq('id', numericId)
      .single();

    if (error || !restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant non trouvé'
      });
    }

    // ✅ CORRECTION : Structure SIMPLIFIÉE
    res.json({
      success: true,
      data: restaurant  // ⬅️ Objet DIRECT dans data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du restaurant'
    });
  }
};
