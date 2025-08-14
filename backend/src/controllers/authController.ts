import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../config/supabaseRest';
import { User, LoginRequest, LoginResponse, ApiResponse } from '../types';

// Interface pour les requêtes authentifiées
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Instance Supabase singleton (désactivée pour la simulation)
// const supabase = getSupabaseClient();

// Génération de tokens JWT
export const generateTokens = (user: User): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role,
      nom_complet: user.nom_complet
    },
    process.env.JWT_SECRET || 'your_jwt_secret_123456',
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { 
      userId: user.id 
    },
    process.env.JWT_SECRET || 'your_jwt_secret_123456',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Log d'activité (simplifié et désactivé pour la simulation)
export const logActivity = async (userId: string, action: string, details?: any): Promise<void> => {
  try {
    // La journalisation est désactivée en mode simulation
    // console.log(`[SIMULATION] Log Activity: User ${userId}, Action: ${action}`);
    return;
  } catch (error) {
    console.error('Erreur log activité:', error);
  }
};

export class AuthController {
  // Connexion (simulée)
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.body;

      // Simuler différents utilisateurs en fonction du nom d'utilisateur
      let mockUser: User;
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
      
      // Générer les tokens
      const { accessToken, refreshToken } = generateTokens(mockUser);

      // Log de l'activité
      await logActivity(mockUser.id, 'user_login_simulation', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Réponse simulée
      const response: LoginResponse = {
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
    } catch (error) {
      console.error('Erreur login (simulation):', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la connexion simulée'
      } as ApiResponse);
    }
  }

  // Inscription (simulée)
  static async register(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      success: true,
      message: 'Inscription simulée réussie. Veuillez vous connecter.'
    } as ApiResponse);
  }

  // Profil utilisateur (simulé)
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }

    // Le middleware d'authentification (que nous devrons peut-être ajuster)
    // devrait déjà avoir placé les informations utilisateur dans req.user
    const { userId, username, role, nom_complet } = req.user as any;

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
    } as ApiResponse);
  }

  // Déconnexion (simulée)
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user) {
      await logActivity(req.user.id, 'user_logout_simulation', { ip: req.ip });
    }
    res.json({ success: true, message: 'Déconnexion simulée réussie' });
  }

  // Mettre à jour le profil (simulé)
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }
    await logActivity(req.user.id, 'profile_update_simulation', { ip: req.ip });
    res.json({ success: true, message: 'Profil mis à jour (simulation)' });
  }

  // Vérifier le token
  static async verifyToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Si on arrive ici, c'est que le token est valide (middleware auth)
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
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur verifyToken:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la vérification'
      } as ApiResponse);
    }
  }
}