import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../types';
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (allowedRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const generateTokens: (user: User) => {
    token: string;
    refreshToken: string;
};
export declare const logActivity: (userId: string, action: string, details?: Record<string, any>, blId?: string, ipAddress?: string, userAgent?: string) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map