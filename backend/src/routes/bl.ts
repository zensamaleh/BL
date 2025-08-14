import { Router } from 'express';
import { BLController } from '../controllers/blController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware';
import { createBLSchema, updateBLSchema, validateBLSchema, paginationSchema, blFiltersSchema } from '../validation/schemas';

const router = Router();

/**
 * @route POST /api/bl
 * @desc Créer un nouveau bon de livraison
 * @access Private (chauffeur)
 */
router.post('/', 
  authenticateToken, 
  authorizeRoles(['chauffeur']), 
  validate(createBLSchema), 
  BLController.createBL
);

/**
 * @route GET /api/bl
 * @desc Lister les bons de livraison avec pagination et filtres
 * @access Private
 */
router.get('/', 
  authenticateToken, 
  BLController.getAllBL
);

/**
 * @route GET /api/bl/stats
 * @desc Récupérer les statistiques du dashboard
 * @access Private
 */
router.get('/stats', 
  authenticateToken, 
  BLController.getDashboardStats
);

/**
 * @route GET /api/bl/:id
 * @desc Récupérer un bon de livraison par ID
 * @access Private
 */
router.get('/:id', 
  authenticateToken, 
  BLController.getBLById
);

/**
 * @route PUT /api/bl/:id/validate
 * @desc Valider ou rejeter un bon de livraison
 * @access Private (agent, chef)
 */
router.put('/:id/validate', 
  authenticateToken, 
  authorizeRoles(['agent', 'chef']), 
  validate(validateBLSchema), 
  BLController.updateBL
);

/**
 * @route DELETE /api/bl/:id
 * @desc Supprimer un bon de livraison
 * @access Private (chef uniquement)
 */
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles(['chef']), 
  BLController.deleteBL
);

export default router;