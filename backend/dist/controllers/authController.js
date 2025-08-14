"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.logActivity = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({
        userId: user.id,
        username: user.username,
        role: user.role,
        nom_complet: user.nom_complet
    }, process.env.JWT_SECRET || 'your_jwt_secret_123456', { expiresIn: '24h' });
    const refreshToken = jsonwebtoken_1.default.sign({
        userId: user.id
    }, process.env.JWT_SECRET || 'your_jwt_secret_123456', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const logActivity = async (userId, action, details) => {
    try {
        return;
    }
    catch (error) {
        console.error('Erreur log activité:', error);
    }
};
exports.logActivity = logActivity;
class AuthController {
    static async login(req, res) {
        try {
            const { username } = req.body;
            let mockUser;
            const baseUser = {
                id: 'user-' + Math.random().toString(36).substring(2, 9),
                email: `${username}@aegean.gr`,
                telephone: '0123456789',
                actif: true,
                created_at: new Date(),
                updated_at: new Date(),
                last_login: new Date(),
                password_hash: 'mock_hash'
            };
            switch (username) {
                case 'chef':
                    mockUser = { ...baseUser, username: 'chef', role: 'chef', nom_complet: 'Chef de quai' };
                    break;
                case 'agent':
                    mockUser = { ...baseUser, username: 'agent', role: 'agent', nom_complet: 'Agent de quai' };
                    break;
                case 'chauffeur':
                    mockUser = { ...baseUser, username: 'chauffeur', role: 'chauffeur', nom_complet: 'Chauffeur' };
                    break;
                default:
                    mockUser = { ...baseUser, username: 'chauffeur', role: 'chauffeur', nom_complet: 'Chauffeur par défaut' };
                    break;
            }
            const { accessToken, refreshToken } = (0, exports.generateTokens)(mockUser);
            await (0, exports.logActivity)(mockUser.id, 'user_login_simulation', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            const response = {
                success: true,
                message: 'Connexion simulée réussie',
                data: {
                    user: {
                        id: mockUser.id,
                        username: mockUser.username,
                        email: mockUser.email,
                        role: mockUser.role,
                        nom_complet: mockUser.nom_complet,
                        telephone: mockUser.telephone,
                        actif: mockUser.actif,
                        created_at: mockUser.created_at,
                        updated_at: mockUser.updated_at
                    },
                    token: accessToken,
                    refreshToken
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Erreur login (simulation):', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la connexion simulée'
            });
        }
    }
    static async register(req, res) {
        res.status(201).json({
            success: true,
            message: 'Inscription simulée réussie. Veuillez vous connecter.'
        });
    }
    static async getProfile(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Non authentifié' });
            return;
        }
        const { userId, username, role, nom_complet } = req.user;
        res.json({
            success: true,
            message: 'Profil simulé récupéré avec succès',
            data: {
                id: userId,
                username: username,
                role: role,
                nom_complet: nom_complet,
                email: `${username}@aegean.gr`,
                telephone: '0123456789',
                actif: true,
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString()
            }
        });
    }
    static async logout(req, res) {
        if (req.user) {
            await (0, exports.logActivity)(req.user.id, 'user_logout_simulation', { ip: req.ip });
        }
        res.json({ success: true, message: 'Déconnexion simulée réussie' });
    }
    static async updateProfile(req, res) {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Non authentifié' });
            return;
        }
        await (0, exports.logActivity)(req.user.id, 'profile_update_simulation', { ip: req.ip });
        res.json({ success: true, message: 'Profil mis à jour (simulation)' });
    }
    static async verifyToken(req, res) {
        try {
            res.json({
                success: true,
                message: 'Token valide',
                data: {
                    user: {
                        id: req.user?.id,
                        username: req.user?.username,
                        role: req.user?.role,
                        nom_complet: req.user?.nom_complet
                    }
                }
            });
        }
        catch (error) {
            console.error('Erreur verifyToken:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la vérification'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map