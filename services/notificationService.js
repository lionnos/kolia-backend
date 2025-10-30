const axios = require('axios');

// Service de notification WhatsApp (Mock pour l'instant)
const sendWhatsAppNotification = async (phoneNumber, message) => {
  try {
    // En mode développement, juste logger le message
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 WhatsApp Mock - To: ${phoneNumber}, Message: ${message}`);
      return {
        success: true,
        message: 'Notification envoyée (mock)',
        is_mock: true
      };
    }

    // Configuration pour l'API WhatsApp Business (à implémenter)
    const whatsappConfig = {
      apiUrl: process.env.WHATSAPP_API_URL,
      token: process.env.WHATSAPP_API_TOKEN
    };

    if (!whatsappConfig.apiUrl || !whatsappConfig.token) {
      throw new Error('Configuration WhatsApp manquante');
    }

    // Exemple d'implémentation avec l'API WhatsApp Business
    const response = await axios.post(
      `${whatsappConfig.apiUrl}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${whatsappConfig.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      message: 'Notification WhatsApp envoyée',
      data: response.data
    };
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    
    // Ne pas faire échouer la requête principale si la notification échoue
    return {
      success: false,
      message: 'Erreur lors de l\'envoi de la notification',
      error: error.message
    };
  }
};

// Service de notification SMS (optionnel)
const sendSMSNotification = async (phoneNumber, message) => {
  try {
    // Implémentation future avec un service SMS local
    console.log(`📱 SMS Mock - To: ${phoneNumber}, Message: ${message}`);
    
    return {
      success: true,
      message: 'SMS envoyé (mock)',
      is_mock: true
    };
  } catch (error) {
    console.error('SMS notification error:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'envoi du SMS',
      error: error.message
    };
  }
};

// Service de notification email (optionnel)
const sendEmailNotification = async (email, subject, message) => {
  try {
    // Implémentation future avec un service email
    console.log(`📧 Email Mock - To: ${email}, Subject: ${subject}, Message: ${message}`);
    
    return {
      success: true,
      message: 'Email envoyé (mock)',
      is_mock: true
    };
  } catch (error) {
    console.error('Email notification error:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email',
      error: error.message
    };
  }
};

module.exports = {
  sendWhatsAppNotification,
  sendSMSNotification,
  sendEmailNotification
};