import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware';
import { loginSchema, updateUserSchema } from '../validation/schemas';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Inscription utilisateur
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Connexion utilisateur
 * @access Public
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @route POST /api/auth/logout
 * @desc Déconnexion utilisateur
 * @access Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @route GET /api/auth/profile
 * @desc Récupérer le profil utilisateur
 * @access Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Mettre à jour le profil utilisateur
 * @access Private
 */
router.put('/profile', authenticateToken, validate(updateUserSchema), AuthController.updateProfile);

/**
 * @route GET /api/auth/verify
 * @desc Vérifier la validité du token
 * @access Private
 */
router.get('/verify', authenticateToken, AuthController.verifyToken);

export default router;