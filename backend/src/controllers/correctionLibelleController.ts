import { Request, Response } from 'express';
import { correctLibelle } from '../services/correctionLibelleService';
import { ApiResponse } from '../types';

export class CorrectionLibelleController {
  /**
   * @route POST /api/correction/libelle
   * @desc Corrige un libellé de produit.
   * @access Public (ou Private, selon les besoins futurs)
   */
  static async correctLibelle(req: Request, res: Response): Promise<void> {
    const { libelle } = req.body;

    if (!libelle || typeof libelle !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Le champ "libelle" est manquant ou invalide.',
      } as ApiResponse);
      return;
    }

    try {
      const libelleCorrige = correctLibelle(libelle);
      res.status(200).json({
        success: true,
        message: 'Libellé corrigé avec succès.',
        data: {
          original: libelle,
          corrected: libelleCorrige,
        },
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur lors de la correction du libellé:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      } as ApiResponse);
    }
  }
}
