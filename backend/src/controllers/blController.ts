import { Request, Response } from 'express';
import { AuthenticatedRequest, logActivity } from '../middleware/auth';
import { getSupabaseClient } from '../config/supabaseRest';
import { BonLivraison, ApiResponse, PaginatedResponse, DashboardStats } from '../types';

// Instance Supabase singleton (désactivée pour la simulation)
// const supabase = getSupabaseClient();

// Données de simulation
export const mockBLs: BonLivraison[] = Array.from({ length: 25 }, (_, i) => {
  const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
  const statuts: BonLivraison['statut'][] = ['capture', 'en_attente', 'valide', 'integre'];
  return {
    id: `bl_${i + 1}`,
    numero_bl: `BL-2025-00${i + 1}`,
    montant_total: parseFloat((Math.random() * 5000 + 500).toFixed(2)),
    nombre_palettes: Math.floor(Math.random() * 10) + 1,
    date_preparation: date,
    date_saisie: date,
    chauffeur_id: `chauffeur_${(i % 3) + 1}`,
    // @ts-ignore
    chauffeur_nom: `Chauffeur ${(i % 3) + 1}`,
    agent_id: `agent_${(i % 2) + 1}`,
    // @ts-ignore
    agent_nom: `Agent ${(i % 2) + 1}`,
    statut: statuts[i % statuts.length]!,
    notes: `Note pour le BL ${i + 1}`,
    notes_ecart: (i % 5 === 0) ? 'Écart de 2 colis' : undefined,
    created_at: date,
    updated_at: date,
  };
});


export class BLController {
  // Créer un nouveau BL (simulé)
  static async createBL(req: AuthenticatedRequest, res: Response): Promise<void> {
    console.log('[SIMULATION] createBL called with:', req.body);
    const { numero_bl, montant_total } = req.body;
    const newBL: BonLivraison = {
      id: `bl_${Math.random().toString(36).substring(2, 9)}`,
      numero_bl,
      montant_total,
      nombre_palettes: 5,
      date_preparation: new Date(),
      chauffeur_id: req.user!.id,
      statut: 'capture',
      created_at: new Date(),
      updated_at: new Date()
    };
    res.status(201).json({
      success: true,
      message: 'BL créé avec succès (simulation)',
      data: newBL
    } as ApiResponse);
  }

  // Récupérer tous les BL avec pagination (simulé)
  static async getAllBL(req: AuthenticatedRequest, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const statut = req.query.statut as string;
    const { role, id: userId } = req.user!;

    let filteredBLs = mockBLs;

    if (role === 'chauffeur') {
      // @ts-ignore
      filteredBLs = mockBLs.filter(bl => bl.chauffeur_id === userId);
    }

    if (statut) {
      filteredBLs = filteredBLs.filter(bl => bl.statut === statut);
    }

    const total = filteredBLs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBL = filteredBLs.slice(startIndex, endIndex);

    const response: PaginatedResponse<BonLivraison> = {
      data: paginatedBL,
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
      message: 'BL récupérés avec succès (simulation)',
      data: response
    } as ApiResponse);
  }

  // Récupérer un BL par ID (simulé)
  static async getBLById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const bl = mockBLs.find(b => b.id === id);

    if (bl) {
      res.json({
        success: true,
        message: 'BL récupéré avec succès (simulation)',
        data: bl
      } as ApiResponse);
    } else {
      res.status(404).json({ success: false, message: 'BL non trouvé (simulation)' });
    }
  }

  // Mettre à jour un BL (simulé)
  static async updateBL(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    console.log(`[SIMULATION] updateBL called for id ${id} with:`, req.body);
    res.json({
      success: true,
      message: 'BL mis à jour avec succès (simulation)',
      data: { id, ...req.body }
    } as ApiResponse);
  }

  // Supprimer un BL (simulé)
  static async deleteBL(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    console.log(`[SIMULATION] deleteBL called for id ${id}`);
    res.json({ success: true, message: 'BL supprimé avec succès (simulation)' });
  }

  // Dashboard stats (simulé)
  static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats: DashboardStats = {
      bl_aujourd_hui: mockBLs.filter(bl => {
        const blDate = new Date(bl.created_at);
        blDate.setHours(0,0,0,0);
        return blDate.getTime() === today.getTime();
      }).length,
      bl_en_attente: mockBLs.filter(bl => bl.statut === 'en_attente').length,
      bl_valides: mockBLs.filter(bl => bl.statut === 'valide').length,
      ecarts_detectes: mockBLs.filter(bl => !!bl.notes_ecart).length,
      palettes_stockees: 23,
      montant_total_mois: mockBLs
        .filter(bl => {
            const blDate = new Date(bl.created_at);
            return blDate.getFullYear() === today.getFullYear() && blDate.getMonth() === today.getMonth();
        })
        .reduce((sum, bl) => sum + (bl.montant_total || 0), 0)
    };

    res.json({
      success: true,
      message: 'Stats récupérées avec succès (simulation)',
      data: stats
    } as ApiResponse);
  }
}