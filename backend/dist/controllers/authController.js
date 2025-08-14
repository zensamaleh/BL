"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.logActivity = exports.generateTokens = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabaseRest_1 = require("../config/supabaseRest");
const supabase = (0, supabaseRest_1.getSupabaseClient)();
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({
        userId: user.id,
        username: user.username,
        role: user.role
    }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
    const refreshToken = jsonwebtoken_1.default.sign({
        userId: user.id
    }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const logActivity = async (userId, action, details) => {
    try {
        await supabase.insert('activity_logs', {
            user_id: userId,
            action,
            details,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Erreur log activité:', error);
    }
};
exports.logActivity = logActivity;
class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const userResult = await supabase.select('users', '*', {
                username,
                actif: true
            });
            if (userResult.error || !userResult.data || userResult.data.length === 0) {
                res.status(401).json({
                    success: false,
                    message: 'Nom d\'utilisateur ou mot de passe incorrect'
                });
                return;
            }
            const user = userResult.data[0];
            if (!user.password_hash) {
                res.status(401).json({
                    success: false,
                    message: 'Données utilisateur invalides'
                });
                return;
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Nom d\'utilisateur ou mot de passe incorrect'
                });
                return;
            }
            const { accessToken, refreshToken } = (0, exports.generateTokens)(user);
            await supabase.update('users', { last_login: new Date().toISOString() }, { id: user.id });
            await (0, exports.logActivity)(user.id, 'user_login', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            const response = {
                success: true,
                message: 'Connexion réussie',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        nom_complet: user.nom_complet,
                        telephone: user.telephone,
                        actif: user.actif,
                        created_at: user.created_at,
                        updated_at: user.updated_at
                    },
                    token: accessToken,
                    refreshToken
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Erreur login:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la connexion'
            });
        }
    }
    static async register(req, res) {
        try {
            const { username, email, password, role, nom_complet, telephone } = req.body;
            const existingUser = await supabase.select('users', 'id', { username });
            if (existingUser.data && existingUser.data.length > 0) {
                res.status(409).json({
                    success: false,
                    message: 'Ce nom d\'utilisateur existe déjà'
                });
                return;
            }
            const existingEmail = await supabase.select('users', 'id', { email });
            if (existingEmail.data && existingEmail.data.length > 0) {
                res.status(409).json({
                    success: false,
                    message: 'Cette adresse email est déjà utilisée'
                });
                return;
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            const newUserResult = await supabase.insert('users', {
                username,
                email,
                password_hash: passwordHash,
                role,
                nom_complet,
                telephone,
                actif: true,
                created_at: new Date().toISOString()
            });
            if (newUserResult.error) {
                res.status(400).json({
                    success: false,
                    message: 'Erreur lors de la création de l\'utilisateur',
                    details: newUserResult.error.message
                });
                return;
            }
            const newUser = newUserResult.data?.[0];
            await (0, exports.logActivity)(newUser.id, 'user_register', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès',
                data: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    nom_complet: newUser.nom_complet
                }
            });
        }
        catch (error) {
            console.error('Erreur register:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de l\'inscription'
            });
        }
    }
    static async getProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié'
                });
                return;
            }
            const userResult = await supabase.select('users', '*', { id: req.user.id });
            if (userResult.error || !userResult.data || userResult.data.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
                return;
            }
            const user = userResult.data[0];
            res.json({
                success: true,
                message: 'Profil récupéré avec succès',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    nom_complet: user.nom_complet,
                    telephone: user.telephone,
                    actif: user.actif,
                    last_login: user.last_login,
                    created_at: user.created_at
                }
            });
        }
        catch (error) {
            console.error('Erreur getProfile:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la récupération du profil'
            });
        }
    }
    static async logout(req, res) {
        try {
            if (req.user) {
                await (0, exports.logActivity)(req.user.id, 'user_logout', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });
            }
            res.json({
                success: true,
                message: 'Déconnexion réussie'
            });
        }
        catch (error) {
            console.error('Erreur logout:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la déconnexion'
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié'
                });
                return;
            }
            const { nom_complet, telephone, email } = req.body;
            const updateResult = await supabase.update('users', {
                nom_complet,
                telephone,
                email,
                updated_at: new Date().toISOString()
            }, { id: req.user.id });
            if (updateResult.error) {
                res.status(400).json({
                    success: false,
                    message: 'Erreur lors de la mise à jour',
                    details: updateResult.error.message
                });
                return;
            }
            await (0, exports.logActivity)(req.user.id, 'profile_update', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            res.json({
                success: true,
                message: 'Profil mis à jour avec succès'
            });
        }
        catch (error) {
            console.error('Erreur updateProfile:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur lors de la mise à jour'
            });
        }
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