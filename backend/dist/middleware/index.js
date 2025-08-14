"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = exports.corsOptions = exports.requestLogger = exports.notFoundHandler = exports.errorHandler = exports.validate = exports.rateLimitMiddleware = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    duration: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60,
});
const rateLimitMiddleware = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip || 'unknown');
        next();
    }
    catch (rejRes) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).json({
            success: false,
            message: 'Trop de requêtes. Veuillez réessayer plus tard.',
            retryAfter: secs
        });
    }
};
exports.rateLimitMiddleware = rateLimitMiddleware;
const validate = (schema) => {
    return (req, res, next) => {
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
exports.validate = validate;
const errorHandler = (error, req, res, next) => {
    console.error('Erreur:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    if (error.isJoi) {
        res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: error.details.map((detail) => detail.message)
        });
        return;
    }
    if (error.code) {
        switch (error.code) {
            case '23505':
                res.status(409).json({
                    success: false,
                    message: 'Cette donnée existe déjà dans le système'
                });
                return;
            case '23503':
                res.status(400).json({
                    success: false,
                    message: 'Référence invalide vers une ressource inexistante'
                });
                return;
            case '23514':
                res.status(400).json({
                    success: false,
                    message: 'Données non conformes aux contraintes'
                });
                return;
        }
    }
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
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} non trouvée`
    });
};
exports.notFoundHandler = notFoundHandler;
const requestLogger = (req, res, next) => {
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
exports.requestLogger = requestLogger;
exports.corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourapp.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
};
exports.securityHeaders = securityHeaders;
//# sourceMappingURL=index.js.map