"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = exports.generateTokens = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token d\'accès requis'
            });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_123456';
        if (!jwtSecret) {
            console.error('JWT_SECRET non configuré');
            res.status(500).json({
                success: false,
                message: 'Erreur de configuration du serveur'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            email: `${decoded.username}@aegean.gr`,
            nom_complet: decoded.nom_complet || decoded.username,
            actif: true,
            created_at: new Date(),
            updated_at: new Date(),
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expiré'
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
            return;
        }
        console.error('Erreur lors de l\'authentification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Accès non autorisé pour ce rôle'
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const generateTokens = (user) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    if (!jwtSecret) {
        throw new Error('JWT_SECRET non configuré');
    }
    const payload = {
        userId: user.id,
        username: user.username,
        role: user.role
    };
    const token = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '24h' });
    const refreshToken = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '7d' });
    return { token, refreshToken };
};
exports.generateTokens = generateTokens;
const logActivity = async (userId, action, details, blId, ipAddress, userAgent) => {
    return;
};
exports.logActivity = logActivity;
//# sourceMappingURL=auth.js.map