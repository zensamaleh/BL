import { Router } from 'express';
import { CorrectionLibelleController } from '../controllers/correctionLibelleController';
// Middleware d'authentification (à ajouter si nécessaire)
// import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/correction/libelle
 * @desc Endpoint pour corriger un libellé de produit.
 * @access Public pour l'instant
 */
router.post(
  '/libelle',
  // authenticateToken, // Optionnel: sécuriser la route si besoin
  CorrectionLibelleController.correctLibelle
);

export default router;
