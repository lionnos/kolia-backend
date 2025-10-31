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
const testRoutes = require('./routes/testRoutes'); // ✅ ajout route test

// Import de la configuration CORS
const corsOptions = require('./config/corsConfig');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ✅ CORS configuration AMÉLIORÉE pour Axios
app.use(cors(corsOptions));

// ✅ Options preflight pour toutes les routes
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  
  // ✅ Logger des requêtes CORS en développement
  app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
    next();
  });
}

// ✅ AJOUTEZ CECI dans server.js APRÈS les middleware et AVANT les autres routes
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
        error: error.message 
      });
    }
    
    res.json({
      success: true,
      count: dishes?.length || 0,
      data: dishes || []
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ✅ ROUTE TEMPORAIRE pour restaurants aussi
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🏪 [URGENT] Fetching restaurant: ${id}`);
    
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
    
    res.json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'KOLIA API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      enabled: true,
      allowedOrigins: corsOptions.origin ? 'Configured' : 'All in dev'
    }
  });
});

// ✅ Route de test de connexion frontend-backend
app.use('/api/test', testRoutes);

// Dans server.js, avant app.use('/api/restaurants', restaurantRoutes)
app.get('/api/debug-restaurant/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 DEBUG: Testing restaurant route for ID: ${id}`);
    
    // Test direct avec votre controller
    const { getRestaurantById } = require('./controllers/restaurantController');
    
    // Appel simulé
    const mockReq = { params: { id } };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`✅ DEBUG Response:`, data);
          res.status(code).json(data);
        }
      })
    };
    
    await getRestaurantById(mockReq, mockRes);
    
  } catch (error) {
    console.error('❌ DEBUG Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

/// ==================== ✅ ROUTES URGENTES CORRIGÉES ====================

// Route URGENTE pour récupérer un restaurant par ID
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

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur base de données'
      });
    }

    if (!restaurant) {
      console.log(`❌ Aucun restaurant avec ID: ${id}`);
      
      // ✅ OPTION: Récupérer le PREMIER restaurant disponible
      const { data: firstRestaurant, error: firstError } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1)
        .single();
        
      if (firstRestaurant) {
        console.log(`🔄 Utilisation du restaurant ID: ${firstRestaurant.id} à la place`);
        return res.json({
          success: true,
          data: firstRestaurant,
          note: `Restaurant ID ${id} non trouvé, utilisation du premier disponible`
        });
      }
      
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
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Route URGENTE POUR PLATS (PUBLIQUE - SANS AUTH)
app.get('/api/dishes/restaurant/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    console.log(`🍽️ [URGENT-PUBLIC] Fetching dishes for restaurant: ${restaurantId}`);
    
    const supabase = require('./config/supabaseClient');
    const { data: dishes, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur de base de données'
      });
    }

    console.log(`✅ ${dishes?.length || 0} plats trouvés pour restaurant ${restaurantId}`);
    res.json({
      success: true,
      count: dishes?.length || 0,
      data: dishes || []
    });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// ==================== FIN DES ROUTES URGENTES ====================

 

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 KOLIA API Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔧 CORS configured for Axios communication`);
  console.log('✅ Route de test active sur: http://localhost:' + PORT + '/api/test');
});

module.exports = app;