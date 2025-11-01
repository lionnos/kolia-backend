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

const corsOptions = require('./config/corsConfig');

const app = express();

// ✅ CRITIQUE : Ajoutez cette ligne POUR RENDER
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting - CORRIGEZ avec trust proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Augmentez la limite
  message: {
    success: false,
    error: 'Trop de requêtes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ Ajoutez cette option pour Render
  trustProxy: true
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
}

/// ==================== ✅ ROUTES URGENTES AVEC PRÉFIXE DIFFÉRENT ====================

// Route URGENTE avec préfixe différent pour éviter les conflits
app.get('/urgent/restaurants/:id', async (req, res) => { 
  try {
    const { id } = req.params;
    
    const supabase = require('./config/supabaseClient');
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !restaurant) {
      console.log('❌ Restaurant non trouvé');
      return res.status(404).json({ error: 'Restaurant non trouvé' });
    }

    console.log(`✅ Restaurant trouvé: ${restaurant.name}`);
    res.json(restaurant);

  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route URGENTE avec préfixe différent
app.get('/urgent/dishes/restaurant/:restaurantId', async (req, res)
    console.log(`✅ [URGENT-NEW] Route appelée pour plats restaurant: ${restaurantId}`);
    
    const supabase = require('./config/supabaseClient');
    const { data: dishes, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (error) {
      return res.status(500).json({ error: 'Erreur DB' });
    }

    console.log(`✅ ${dishes?.length || 0} plats trouvés`);
    res.json(dishes || []);

  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API fonctionne' });
});

// Route de test ULTIME
app.get('/api/test-urgent', (req, res) => {
  console.log('✅ TEST URGENT RÉUSSI');
  res.json({ success: true, message: 'Routes urgentes fonctionnent' });
});

// Routes normales (APRÈS les routes urgentes)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/test', testRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur sur le port ${PORT}`);
  console.log(`✅ Trust proxy activé pour Render`);
});