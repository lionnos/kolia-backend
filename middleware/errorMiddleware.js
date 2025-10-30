const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Erreur de validation Joi
  if (err.isJoi) {
    statusCode = 400;
    message = err.details[0].message;
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expiré';
  }

  // Erreur Supabase
  if (err.code && err.code.startsWith('23')) {
    statusCode = 400;
    if (err.code === '23505') {
      message = 'Cette ressource existe déjà';
    } else if (err.code === '23503') {
      message = 'Référence invalide';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };