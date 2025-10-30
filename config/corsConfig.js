const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les origines en développement
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:5174', // Vite alternate port
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://localhost:3000', // Backend (si frontend tourne aussi sur 3000)
      'https://xaeitxakdtjpqfoxehib.supabase.co', // Supabase
      // Ajoutez vos domaines de production ici
      // 'https://votre-site.com',
      // 'https://www.votre-site.com'
    ];
    
    // En développement, autoriser sans origine (Postman, Thunder Client, etc.)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('🚫 CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Auth-Token',
    'X-API-Key',
    'Cache-Control'
  ],
  exposedHeaders: [
    'Content-Range', 
    'X-Content-Range',
    'X-Total-Count',
    'Authorization'
  ],
  maxAge: 86400, // 24 heures
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Configuration spécifique pour le développement
const devCorsOptions = {
  ...corsOptions,
  origin: true, // Tout autoriser en dev
};

// Exporter la configuration selon l'environnement
module.exports = process.env.NODE_ENV === 'production' ? corsOptions : devCorsOptions;