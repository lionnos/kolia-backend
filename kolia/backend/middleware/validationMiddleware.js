const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// Schémas de validation
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^\+243[0-9]{9}$/).required(),
    address: Joi.string().min(5).max(255).required(),
    role: Joi.string().valid('client', 'restaurant', 'livreur').default('client')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  restaurant: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500),
    address: Joi.string().min(5).max(255).required(),
    phone: Joi.string().pattern(/^\+243[0-9]{9}$/).required(),
    commune: Joi.string().valid('Kadutu', 'Ibanda', 'Bagira').required(),
    category: Joi.string().required(),
    delivery_fee: Joi.number().min(0).default(5000),
    delivery_time: Joi.string().default('25-35 min'),
    image: Joi.string().uri().optional()
  }),

  dish: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().required(),
    image: Joi.string().uri().optional(),
    is_vegetarian: Joi.boolean().default(false),
    is_vegan: Joi.boolean().default(false),
    is_gluten_free: Joi.boolean().default(false),
    is_spicy: Joi.boolean().default(false),
    preparation_time: Joi.number().min(1).default(25),
    ingredients: Joi.string().max(500).optional()
  }),

  order: Joi.object({
    restaurant_id: Joi.number().integer().required(),
    items: Joi.array().items(
      Joi.object({
        dish_id: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required()
      })
    ).min(1).required(),
    delivery_address: Joi.string().min(5).max(255).required(),
    phone: Joi.string().pattern(/^\+243[0-9]{9}$/).required(),
    payment_method: Joi.string().valid('card', 'mobile', 'cash').required(),
    notes: Joi.string().max(500).optional()
  })
};

module.exports = { validate, schemas };