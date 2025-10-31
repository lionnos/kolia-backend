const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const testRoutes = require('./routes/testRoutes');

// Import de la configuration CORS
const corsOptions = require('./config/corsConfig');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ✅ CORS configuration
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
    next();
  });
}

// ==================== ✅ ROUTES URGENTES UNIQUES ====================

// Route URGENTE UNIQUE pour restaurants
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🏪 [URGENT] Fetching restaurant ID: ${id}`);
    
    const supabase = require('./config/supabaseClient');
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant non trouvé'
      });
    }

    console.log('✅ Restaurant trouvé:', restaurant.name);
    res.json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Route URGENTE UNIQUE pour plats
app.get('/api/dishes/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`🍽️ [URGENT] Fetching dishes for restaurant: ${restaurantId}`);
    
    const supabase = require('./config/supabaseClient');
    const { data: dishes, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Erreur de base de données'
      });
    }

    console.log(`✅ ${dishes?.length || 0} plats trouvés`);
    res.json({
      success: true,
      count: dishes?.length || 0,
      data: dishes || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// ==================== FIN DES ROUTES URGENTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KOLIA API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);  // ⚠️ CONFLIT AVEC LA ROUTE CI-DESSUS
app.use('/api/dishes', dishRoutes);             // ⚠️ CONFLIT AVEC LA ROUTE CI-DESSUS
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/test', testRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 KOLIA API Server running on port ${PORT}`);
});

module.exports = app;