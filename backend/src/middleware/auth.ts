import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types';
import { getSupabaseClient } from '../config/supabaseRest';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Instance Supabase singleton
const supabase = getSupabaseClient();

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Récupérer les informations utilisateur depuis Supabase
    const userResult = await supabase.select('users', 
      'id,username,email,role,nom_complet,telephone,actif', 
      { id: decoded.userId, actif: true }
    );

    if (userResult.error || !userResult.data || userResult.data.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou inactif'
      });
      return;
    }

    req.user = userResult.data[0] as User;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
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

export const authorizeRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

export const generateTokens = (user: User): { token: string; refreshToken: string } => {
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

  const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

  return { token, refreshToken };
};

export const logActivity = async (
  userId: string,
  action: string,
  details?: Record<string, any>,
  blId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
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
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du log d\'activité:', error);
  }
};