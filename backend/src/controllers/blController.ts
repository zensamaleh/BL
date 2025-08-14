import { Request, Response } from 'express';
import { AuthenticatedRequest, logActivity } from '../middleware/auth';
import { getSupabaseClient } from '../config/supabaseRest';
import { BonLivraison, ApiResponse, PaginatedResponse, DashboardStats } from '../types';

// Instance Supabase singleton
const supabase = getSupabaseClient();

export class BLController {
  // Créer un nouveau BL (chauffeur)
  static async createBL(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      const { numero_bl, montant_total, nombre_palettes, date_preparation, notes } = req.body;

      // Vérifier si le BL existe déjà
      const existingBL = await supabase.select('bons_livraison', 'id', { numero_bl });
      if (existingBL.data && existingBL.data.length > 0) {
        res.status(409).json({
          success: false,
          message: 'Ce numéro de BL existe déjà'
        } as ApiResponse);
        return;
      }

      // Créer le nouveau BL
      const newBLResult = await supabase.insert('bons_livraison', {
        numero_bl,
        montant_total,
        nombre_palettes,
        date_preparation,
        notes,
        chauffeur_id: req.user.id,
        statut: 'capture',
        created_at: new Date().toISOString()
      });

      if (newBLResult.error) {
        res.status(400).json({
          success: false,
          message: 'Erreur lors de la création du BL',
          details: newBLResult.error.message
        } as ApiResponse);
        return;
      }

      const newBL = newBLResult.data?.[0];

      // Log de l'activité
      await logActivity(
        req.user.id,
        'bl_created',
        { numero_bl, montant_total },
        newBL?.id,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json({
        success: true,
        message: 'BL créé avec succès',
        data: newBL
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur createBL:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }

  // Récupérer tous les BL avec pagination
  static async getAllBL(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const statut = req.query.statut as string;

      // Construire les filtres
      let filters: Record<string, any> = {};
      
      // Si l'utilisateur est chauffeur, ne voir que ses BL
      if (req.user.role === 'chauffeur') {
        filters.chauffeur_id = req.user.id;
      }

      // Filtrer par statut si spécifié
      if (statut) {
        filters.statut = statut;
      }

      // Récupérer les BL
      const blResult = await supabase.select('bons_livraison', '*', filters);

      if (blResult.error) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des BL',
          details: blResult.error.message
        } as ApiResponse);
        return;
      }

      const allBL = blResult.data || [];

      // Pagination manuelle (Supabase REST API ne supporte pas nativement la pagination)
      const total = allBL.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBL = allBL.slice(startIndex, endIndex);

      const response: PaginatedResponse<BonLivraison> = {
        data: paginatedBL as BonLivraison[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

      res.json({
        success: true,
        message: 'BL récupérés avec succès',
        data: response
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur getAllBL:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }

  // Récupérer un BL par ID
  static async getBLById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      const { id } = req.params;

      const blResult = await supabase.select('bons_livraison', '*', { id });

      if (blResult.error || !blResult.data || blResult.data.length === 0) {
        res.status(404).json({
          success: false,
          message: 'BL non trouvé'
        } as ApiResponse);
        return;
      }

      const bl = blResult.data[0];

      // Vérifier les autorisations
      if (req.user.role === 'chauffeur' && bl.chauffeur_id !== req.user.id) {
        res.status(403).json({
          success: false,
          message: 'Accès non autorisé à ce BL'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'BL récupéré avec succès',
        data: bl
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur getBLById:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }

  // Mettre à jour un BL (agent/chef)
  static async updateBL(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      const { id } = req.params;
      const { statut, notes_ecart, agent_id } = req.body;

      // Récupérer le BL existant
      const existingBLResult = await supabase.select('bons_livraison', '*', { id });

      if (existingBLResult.error || !existingBLResult.data || existingBLResult.data.length === 0) {
        res.status(404).json({
          success: false,
          message: 'BL non trouvé'
        } as ApiResponse);
        return;
      }

      // Préparer les données de mise à jour
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };

      if (statut) updateData.statut = statut;
      if (notes_ecart) updateData.notes_ecart = notes_ecart;
      if (agent_id) updateData.agent_id = agent_id;

      // Si validation par un agent, ajouter la date de saisie
      if (statut === 'valide' || statut === 'integre') {
        updateData.date_saisie = new Date().toISOString();
        updateData.agent_id = req.user.id;
      }

      // Mettre à jour le BL
      const updateResult = await supabase.update('bons_livraison', updateData, { id });

      if (updateResult.error) {
        res.status(400).json({
          success: false,
          message: 'Erreur lors de la mise à jour du BL',
          details: updateResult.error.message
        } as ApiResponse);
        return;
      }

      // Log de l'activité
      await logActivity(
        req.user.id,
        'bl_updated',
        { statut, notes_ecart },
        id,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'BL mis à jour avec succès',
        data: updateResult.data?.[0]
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur updateBL:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }

  // Supprimer un BL (chef seulement)
  static async deleteBL(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      if (req.user.role !== 'chef') {
        res.status(403).json({
          success: false,
          message: 'Seuls les chefs peuvent supprimer les BL'
        } as ApiResponse);
        return;
      }

      const { id } = req.params;

      const deleteResult = await supabase.delete('bons_livraison', { id });

      if (deleteResult.error) {
        res.status(400).json({
          success: false,
          message: 'Erreur lors de la suppression du BL',
          details: deleteResult.error.message
        } as ApiResponse);
        return;
      }

      // Log de l'activité
      await logActivity(
        req.user.id,
        'bl_deleted',
        {},
        id,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'BL supprimé avec succès'
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur deleteBL:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }

  // Dashboard stats (version simplifiée)
  static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      // Récupérer tous les BL pour calculer les stats
      const blResult = await supabase.select('bons_livraison', '*');

      if (blResult.error) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération des stats'
        } as ApiResponse);
        return;
      }

      const allBL = blResult.data || [];
      const today = new Date().toISOString().split('T')[0];

      // Calculer les stats
      const stats: DashboardStats = {
        bl_aujourd_hui: allBL.filter(bl => bl.created_at?.startsWith(today)).length,
        bl_en_attente: allBL.filter(bl => bl.statut === 'en_attente').length,
        bl_valides: allBL.filter(bl => bl.statut === 'valide').length,
        ecarts_detectes: 0, // À implémenter avec la table ecarts
        palettes_stockees: 0, // À implémenter avec la table palettes_stockees
        montant_total_mois: allBL
          .filter(bl => bl.created_at?.startsWith(new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')))
          .reduce((sum, bl) => sum + (bl.montant_total || 0), 0)
      };

      res.json({
        success: true,
        message: 'Stats récupérées avec succès',
        data: stats
      } as ApiResponse);
    } catch (error) {
      console.error('Erreur getDashboardStats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }
}