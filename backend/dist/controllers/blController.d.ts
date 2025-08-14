import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class BLController {
    static createBL(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAllBL(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getBLById(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateBL(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteBL(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=blController.d.ts.map