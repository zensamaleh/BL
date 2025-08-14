import { Request, Response } from 'express';
import { User } from '../types';
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export declare const generateTokens: (user: User) => {
    accessToken: string;
    refreshToken: string;
};
export declare const logActivity: (userId: string, action: string, details?: any) => Promise<void>;
export declare class AuthController {
    static login(req: Request, res: Response): Promise<void>;
    static register(req: Request, res: Response): Promise<void>;
    static getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    static logout(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    static verifyToken(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map