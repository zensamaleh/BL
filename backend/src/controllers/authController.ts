import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../config/supabaseRest';
import { User, LoginRequest, LoginResponse, ApiResponse } from '../types';

// Interface pour les requêtes authentifiées
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Instance Supabase singleton
const supabase = getSupabaseClient();

// Génération de tokens JWT
export const generateTokens = (user: User): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { 
      userId: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { 
      userId: user.id 
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Log d'activité (simplifié)
export const logActivity = async (userId: string, action: string, details?: any): Promise<void> => {
  try {
    await supabase.insert('activity_logs', {
      user_id: userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur log activité:', error);
  }
};

export class AuthController {
  // Connexion
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password }: LoginRequest = req.body;

      // Rechercher l'utilisateur
      const userResult = await supabase.select('users', '*', { 
        username,
        actif: true 
      });

      if (userResult.error || !userResult.data || userResult.data.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Nom d\'utilisateur ou mot de passe incorrect'
        } as ApiResponse);
        return;
      }

      const user = userResult.data[0] as User;

      // Vérifier le mot de passe
      if (!user.password_hash) {
        res.status(401).json({
          success: false,
          message: 'Données utilisateur invalides'
        } as ApiResponse);
        return;
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Nom d\'utilisateur ou mot de passe incorrect'
        } as ApiResponse);
        return;
      }

      // Générer les tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Mettre à jour la dernière connexion
      await supabase.update('users', 
        { last_login: new Date().toISOString() },
        { id: user.id }
      );

      // Log de l'activité
      await logActivity(user.id, 'user_login', { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Réponse
      const response: LoginResponse = {
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
    } catch (error) {
      console.error('Erreur login:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la connexion'
      } as ApiResponse);
    }
  }

  // Inscription
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, role, nom_complet, telephone } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await supabase.select('users', 'id', { username });
      if (existingUser.data && existingUser.data.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Ce nom d\'utilisateur existe déjà'
        } as ApiResponse);
        return;
      }

      // Vérifier l'email
      const existingEmail = await supabase.select('users', 'id', { email });
      if (existingEmail.data && existingEmail.data.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée'
        } as ApiResponse);
        return;
      }

      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
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
        } as ApiResponse);
        return;
      }

      const newUser = newUserResult.data?.[0] as User;

      // Log de l'activité
      await logActivity(newUser.id, 'user_register', { 
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
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur register:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de l\'inscription'
      } as ApiResponse);
    }
  }

  // Profil utilisateur
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      // Récupérer les informations complètes de l'utilisateur
      const userResult = await supabase.select('users', '*', { id: req.user.id });

      if (userResult.error || !userResult.data || userResult.data.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        } as ApiResponse);
        return;
      }

      const user = userResult.data[0] as User;

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
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur getProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du profil'
      } as ApiResponse);
    }
  }

  // Déconnexion (simple)
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user) {
        await logActivity(req.user.id, 'user_logout', { 
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      res.json({
        success: true,
        message: 'Déconnexion réussie'
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la déconnexion'
      } as ApiResponse);
    }
  }

  // Mettre à jour le profil
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      const { nom_complet, telephone, email } = req.body;
      
      // Mettre à jour les informations
      const updateResult = await supabase.update('users', 
        { 
          nom_complet,
          telephone,
          email,
          updated_at: new Date().toISOString()
        },
        { id: req.user.id }
      );

      if (updateResult.error) {
        res.status(400).json({
          success: false,
          message: 'Erreur lors de la mise à jour',
          details: updateResult.error.message
        } as ApiResponse);
        return;
      }

      // Log de l'activité
      await logActivity(req.user.id, 'profile_update', { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès'
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour'
      } as ApiResponse);
    }
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