import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import Joi from 'joi';

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60, // minutes to seconds
});

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes. Veuillez réessayer plus tard.',
      retryAfter: secs
    });
  }
};

// Validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
      return;
    }

    req.body = value;
    next();
  };
};

// Error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Erreur:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreur de validation Joi
  if (error.isJoi) {
    res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: error.details.map((detail: any) => detail.message)
    });
    return;
  }

  // Erreur PostgreSQL
  if (error.code) {
    switch (error.code) {
      case '23505': // Contrainte unique violée
        res.status(409).json({
          success: false,
          message: 'Cette donnée existe déjà dans le système'
        });
        return;
      case '23503': // Contrainte de clé étrangère violée
        res.status(400).json({
          success: false,
          message: 'Référence invalide vers une ressource inexistante'
        });
        return;
      case '23514': // Contrainte de vérification violée
        res.status(400).json({
          success: false,
          message: 'Données non conformes aux contraintes'
        });
        return;
    }
  }

  // Erreur par défaut
  const status = error.status || error.statusCode || 500;
  const message = status === 500 
    ? 'Erreur interne du serveur' 
    : error.message || 'Une erreur est survenue';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Not found middleware
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} non trouvée`
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};

// CORS configuration
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourapp.com'] // Remplacer par votre domaine
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};