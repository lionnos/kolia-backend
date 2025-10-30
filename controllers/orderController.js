const { supabaseAdmin } = require('../config/database');
const { sendWhatsAppNotification } = require('../services/notificationService');

// @desc    Obtenir toutes les commandes
// @route   GET /api/orders
// @access  Private (Admin)
const getOrders = async (req, res) => {
  try {
    const { status, restaurant_id, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(name, phone, email),
        restaurant:restaurants(name),
        order_items:order_items(
          *,
          dish:dishes(name, price)
        )
      `);

    if (status) {
      query = query.eq('status', status);
    }

    if (restaurant_id) {
      query = query.eq('restaurant_id', restaurant_id);
    }

    const { data: orders, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('GetOrders error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
};

// @desc    Obtenir une commande par ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(name, phone, email),
        restaurant:restaurants(name, phone),
        order_items:order_items(
          *,
          dish:dishes(name, price, image)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'client' && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('GetOrderById error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande'
    });
  }
};

// @desc    Créer une commande
// @route   POST /api/orders
// @access  Private (Client)
const createOrder = async (req, res) => {
  try {
    const { restaurant_id, items, delivery_address, phone, payment_method, notes } = req.body;

    // Calculer le total et vérifier les plats
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { data: dish, error } = await supabaseAdmin
        .from('dishes')
        .select('id, name, price, restaurant_id')
        .eq('id', item.dish_id)
        .eq('restaurant_id', restaurant_id)
        .eq('is_available', true)
        .single();

      if (error || !dish) {
        return res.status(400).json({
          success: false,
          message: `Plat non disponible: ${item.dish_id}`
        });
      }

      const itemTotal = dish.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        dish_id: dish.id,
        quantity: item.quantity,
        price: dish.price,
        total: itemTotal
      });
    }

    // Récupérer les frais de livraison du restaurant
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('delivery_fee')
      .eq('id', restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant non trouvé'
      });
    }

    const deliveryFee = restaurant.delivery_fee || 5000;
    const commission = subtotal * parseFloat(process.env.COMMISSION_RATE || 0.15);
    const total = subtotal + deliveryFee;

    // Créer la commande
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          user_id: req.user.id,
          restaurant_id,
          subtotal,
          delivery_fee: deliveryFee,
          commission,
          total,
          delivery_address,
          phone,
          payment_method,
          notes,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Créer les items de la commande
    const orderItems = validatedItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    // Envoyer notification WhatsApp (mock)
    await sendWhatsAppNotification(phone, `Votre commande #${order.id} a été confirmée. Total: ${total}FC`);

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: {
        ...order,
        order_items: orderItems
      }
    });
  } catch (error) {
    console.error('CreateOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande'
    });
  }
};

// @desc    Mettre à jour le statut d'une commande
// @route   PATCH /api/orders/:id/status
// @access  Private (Restaurant, Livreur, Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    // Récupérer la commande
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(user_id),
        user:users(phone)
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'restaurant' && order.restaurant.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    // Mettre à jour le statut
    const updateData = { status };
    
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Envoyer notification WhatsApp
    const statusMessages = {
      confirmed: 'Votre commande a été confirmée',
      preparing: 'Votre commande est en préparation',
      ready_for_delivery: 'Votre commande est prête pour la livraison',
      out_for_delivery: 'Votre commande est en cours de livraison',
      delivered: 'Votre commande a été livrée avec succès'
    };

    if (statusMessages[status]) {
      await sendWhatsAppNotification(
        order.user.phone,
        `${statusMessages[status]} - Commande #${order.id}`
      );
    }

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: updatedOrder
    });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// @desc    Obtenir les commandes d'un utilisateur
// @route   GET /api/orders/my-orders
// @access  Private (Client)
const getUserOrders = async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(name, image),
        order_items:order_items(
          *,
          dish:dishes(name, image)
        )
      `)
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('GetUserOrders error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
};

// @desc    Obtenir les commandes d'un restaurant
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private (Restaurant)
const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    // Vérifier que l'utilisateur est propriétaire du restaurant
    const { data: restaurant } = await supabaseAdmin
      .from('restaurants')
      .select('user_id')
      .eq('id', restaurantId)
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
        user:users(name, phone),
        order_items:order_items(
          *,
          dish:dishes(name, price)
        )
      `)
      .eq('restaurant_id', restaurantId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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

// @desc    Annuler une commande
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Client, Admin)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'client' && order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    // Vérifier si la commande peut être annulée
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette commande ne peut pas être annulée'
      });
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Commande annulée avec succès',
      data: updatedOrder
    });
  } catch (error) {
    console.error('CancelOrder error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la commande'
    });
  }
};

// @desc    Assigner un livreur à une commande
// @route   PATCH /api/orders/:id/assign-driver
// @access  Private (Restaurant, Admin)
const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id } = req.body;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(user_id)
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier les permissions
    if (req.user.role === 'restaurant' && order.restaurant.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        driver_id,
        status: 'out_for_delivery'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Livreur assigné avec succès',
      data: updatedOrder
    });
  } catch (error) {
    console.error('AssignDriver error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'assignation du livreur'
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getRestaurantOrders,
  cancelOrder,
  assignDriver
};