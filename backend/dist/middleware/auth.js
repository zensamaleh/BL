"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = exports.generateTokens = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabaseRest_1 = require("../config/supabaseRest");
const supabase = (0, supabaseRest_1.getSupabaseClient)();
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
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET non configuré');
            res.status(500).json({
                success: false,
                message: 'Erreur de configuration du serveur'
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const userResult = await supabase.select('users', 'id,username,email,role,nom_complet,telephone,actif', { id: decoded.userId, actif: true });
        if (userResult.error || !userResult.data || userResult.data.length === 0) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé ou inactif'
            });
            return;
        }
        req.user = userResult.data[0];
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
    try {
        await supabase.insert('activity_logs', {
            user_id: userId,
            bl_id: blId,
            action,
            details: details ? JSON.stringify(details) : null,
            ip_address: ipAddress,
            user_agent: userAgent,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'enregistrement du log d\'activité:', error);
    }
};
exports.logActivity = logActivity;
//# sourceMappingURL=auth.js.map