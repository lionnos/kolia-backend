const axios = require('axios');
const { supabaseAdmin } = require('../config/database');

// Configuration CinetPay
const CINETPAY_CONFIG = {
  apiKey: process.env.CINETPAY_API_KEY,
  siteId: process.env.CINETPAY_SITE_ID,
  secretKey: process.env.CINETPAY_SECRET_KEY,
  baseUrl: process.env.CINETPAY_BASE_URL || 'https://api-checkout.cinetpay.com'
};

// @desc    Initialiser un paiement
// @route   POST /api/payments/initialize
// @access  Private (Client)
const initializePayment = async (req, res) => {
  try {
    const { order_id, amount, currency = 'CDF' } = req.body;

    // Vérifier que la commande existe et appartient à l'utilisateur
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', req.user.id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier que le montant correspond
    if (amount !== order.total) {
      return res.status(400).json({
        success: false,
        message: 'Montant incorrect'
      });
    }

    // Générer un ID de transaction unique
    const transactionId = `KOLIA_${order_id}_${Date.now()}`;

    // Préparer les données pour CinetPay
    const paymentData = {
      apikey: CINETPAY_CONFIG.apiKey,
      site_id: CINETPAY_CONFIG.siteId,
      transaction_id: transactionId,
      amount: amount,
      currency: currency,
      description: `Commande KOLIA #${order_id}`,
      return_url: `${process.env.FRONTEND_URL}/order-success?transaction_id=${transactionId}`,
      notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      customer_name: req.user.name,
      customer_email: req.user.email,
      customer_phone_number: req.user.phone,
      customer_address: req.user.address,
      customer_city: 'Bukavu',
      customer_country: 'CD',
      customer_state: 'Sud-Kivu'
    };

    try {
      // Appel à l'API CinetPay
      const response = await axios.post(
        `${CINETPAY_CONFIG.baseUrl}/v2/?method=paymentInitialization`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === '201') {
        // Sauvegarder la transaction
        const { error: transactionError } = await supabaseAdmin
          .from('transactions')
          .insert([
            {
              id: transactionId,
              order_id: order_id,
              user_id: req.user.id,
              amount: amount,
              currency: currency,
              status: 'pending',
              payment_method: 'cinetpay',
              cinetpay_token: response.data.data.payment_token
            }
          ]);

        if (transactionError) {
          throw transactionError;
        }

        res.json({
          success: true,
          message: 'Paiement initialisé avec succès',
          data: {
            transaction_id: transactionId,
            payment_url: response.data.data.payment_url,
            payment_token: response.data.data.payment_token
          }
        });
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (cinetpayError) {
      console.error('CinetPay API Error:', cinetpayError.response?.data || cinetpayError.message);
      
      // En mode développement, simuler une réponse réussie
      if (process.env.NODE_ENV === 'development') {
        const mockTransactionId = `MOCK_${order_id}_${Date.now()}`;
        
        await supabaseAdmin
          .from('transactions')
          .insert([
            {
              id: mockTransactionId,
              order_id: order_id,
              user_id: req.user.id,
              amount: amount,
              currency: currency,
              status: 'pending',
              payment_method: 'mock'
            }
          ]);

        return res.json({
          success: true,
          message: 'Paiement initialisé (mode développement)',
          data: {
            transaction_id: mockTransactionId,
            payment_url: `${process.env.FRONTEND_URL}/mock-payment?transaction_id=${mockTransactionId}`,
            is_mock: true
          }
        });
      }

      throw cinetpayError;
    }
  } catch (error) {
    console.error('InitializePayment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation du paiement'
    });
  }
};

// @desc    Vérifier un paiement
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    // Récupérer la transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (transactionError || !transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    // Si c'est un paiement mock (développement)
    if (transaction.payment_method === 'mock') {
      // Simuler une vérification réussie
      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transaction_id);

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour le statut de la commande
      await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid'
        })
        .eq('id', transaction.order_id);

      return res.json({
        success: true,
        message: 'Paiement vérifié avec succès (mock)',
        data: {
          transaction_id,
          status: 'completed',
          is_mock: true
        }
      });
    }

    // Vérification avec CinetPay
    const verificationData = {
      apikey: CINETPAY_CONFIG.apiKey,
      site_id: CINETPAY_CONFIG.siteId,
      transaction_id: transaction_id
    };

    try {
      const response = await axios.post(
        `${CINETPAY_CONFIG.baseUrl}/v2/?method=checkPayStatus`,
        verificationData
      );

      if (response.data.code === '00') {
        // Paiement réussi
        const { error: updateError } = await supabaseAdmin
          .from('transactions')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            cinetpay_response: response.data
          })
          .eq('id', transaction_id);

        if (updateError) {
          throw updateError;
        }

        // Mettre à jour le statut de la commande
        await supabaseAdmin
          .from('orders')
          .update({ 
            status: 'confirmed',
            payment_status: 'paid'
          })
          .eq('id', transaction.order_id);

        res.json({
          success: true,
          message: 'Paiement vérifié avec succès',
          data: {
            transaction_id,
            status: 'completed',
            amount: response.data.data.amount,
            currency: response.data.data.currency
          }
        });
      } else {
        // Paiement échoué
        await supabaseAdmin
          .from('transactions')
          .update({ 
            status: 'failed',
            cinetpay_response: response.data
          })
          .eq('id', transaction_id);

        res.status(400).json({
          success: false,
          message: 'Paiement échoué',
          data: {
            transaction_id,
            status: 'failed'
          }
        });
      }
    } catch (cinetpayError) {
      console.error('CinetPay verification error:', cinetpayError);
      throw cinetpayError;
    }
  } catch (error) {
    console.error('VerifyPayment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du paiement'
    });
  }
};

// @desc    Obtenir le statut d'un paiement
// @route   GET /api/payments/:transactionId/status
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const { data: transaction, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        *,
        order:orders(id, status)
      `)
      .eq('id', transactionId)
      .single();

    if (error || !transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        transaction_id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        order_id: transaction.order_id,
        order_status: transaction.order.status,
        created_at: transaction.created_at,
        completed_at: transaction.completed_at
      }
    });
  } catch (error) {
    console.error('GetPaymentStatus error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut'
    });
  }
};

// @desc    Traiter un remboursement
// @route   POST /api/payments/:transactionId/refund
// @access  Private (Admin)
const processRefund = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('status', 'completed')
      .single();

    if (transactionError || !transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée ou non éligible au remboursement'
      });
    }

    // Pour l'instant, marquer comme remboursé (implémentation complète avec CinetPay à faire)
    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({ 
        status: 'refunded',
        refund_reason: reason,
        refunded_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) {
      throw updateError;
    }

    // Mettre à jour le statut de la commande
    await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'cancelled',
        payment_status: 'refunded'
      })
      .eq('id', transaction.order_id);

    res.json({
      success: true,
      message: 'Remboursement traité avec succès',
      data: {
        transaction_id: transactionId,
        status: 'refunded',
        amount: transaction.amount
      }
    });
  } catch (error) {
    console.error('ProcessRefund error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du remboursement'
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  getPaymentStatus,
  processRefund
};