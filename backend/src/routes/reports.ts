import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware';
import { generateReportSchema } from '../validation/schemas';

const router = Router();

/**
 * @route POST /api/reports/generate
 * @desc Générer un rapport (PDF ou Excel)
 * @access Private (agent, chef)
 */
router.post('/generate', 
  authenticateToken, 
  authorizeRoles(['agent', 'chef']), 
  validate(generateReportSchema), 
  ReportController.generateMonthlyReport
);

/**
 * @route GET /api/reports
 * @desc Lister les rapports générés
 * @access Private (agent, chef)
 */
router.get('/', 
  authenticateToken, 
  authorizeRoles(['agent', 'chef']), 
  ReportController.listReports
);

/**
 * @route GET /api/reports/:id/download
 * @desc Télécharger un rapport existant
 * @access Private (agent, chef)
 */
router.get('/:id/download', 
  authenticateToken, 
  authorizeRoles(['agent', 'chef']), 
  ReportController.downloadReport
);

export default router;