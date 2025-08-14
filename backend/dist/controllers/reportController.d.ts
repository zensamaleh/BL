import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class ReportController {
    static generateMonthlyReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    private static generatePDFReport;
    private static generateExcelReport;
    static listReports(req: AuthenticatedRequest, res: Response): Promise<void>;
    static downloadReport(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=reportController.d.ts.map