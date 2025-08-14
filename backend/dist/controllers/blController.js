"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLController = void 0;
const auth_1 = require("../middleware/auth");
const supabaseRest_1 = require("../config/supabaseRest");
const supabase = (0, supabaseRest_1.getSupabaseClient)();
class BLController {
    static async createBL(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié'
                });
                return;
            }
            const { numero_bl, montant_total, nombre_palettes, date_preparation, notes } = req.body;
            const existingBL = await supabase.select('bons_livraison', 'id', { numero_bl });
            if (existingBL.data && existingBL.data.length > 0) {
                res.status(409).json({
                    success: false,
                    message: 'Ce numéro de BL existe déjà'
                });
                return;
            }
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
                });
                return;
            }
            const newBL = newBLResult.data?.[0];
            await (0, auth_1.logActivity)(req.user.id, 'bl_created', { numero_bl, montant_total }, newBL?.id, req.ip, req.get('User-Agent'));
            res.status(201).json({
                success: true,
                message: 'BL créé avec succès',
                data: newBL
            });
        }
        catch (error) {
            console.error('Erreur createBL:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
    static async getAllBL(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié'
                });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const statut = req.query.statut;
            let filters = {};
            if (req.user.role === 'chauffeur') {
                filters.chauffeur_id = req.user.id;
            }
            if (statut) {
                filters.statut = statut;
            }
            const blResult = await supabase.select('bons_livraison', '*', filters);
            if (blResult.error) {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des BL',
                    details: blResult.error.message
                });
                return;
            }
            const allBL = blResult.data || [];
            const total = allBL.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedBL = allBL.slice(startIndex, endIndex);
            const response = {
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
                message: 'BL récupérés avec succès',
                data: response
            });
        }
        catch (error) {
            console.error('Erreur getAllBL:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
    static async getBLById(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié'
                });
                return;
            }
            const { id } = req.params;
            const blResult = await supabase.select('bons_livraison', '*', { id });
            if (blResult.error || !blResult.data || blResult.data.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'BL non trouvé'
                });
                return;
            }
            const bl = blResult.data[0];
            if (req.user.role === 'chauffeur' && bl.chauffeur_id !== req.user.id) {
                res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé à ce BL'
                });
                return;
            }
            res.json({
                success: true,
                message: 'BL récupéré avec succès',
                data: bl
            });
        }
        catch (error) {
            console.error('Erreur getBLById:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
    static async updateBL(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié'
                });
                return;
            }
            const { id } = req.params;
            const { statut, notes_ecart, agent_id } = req.body;
            const existingBLResult = await supabase.select('bons_livraison', '*', { id });
            if (existingBLResult.error || !existingBLResult.data || existingBLResult.data.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'BL non trouvé'
                });
                return;
            }
            const updateData = {
                updated_at: new Date().toISOString()
            };
            if (statut)
                updateData.statut = statut;
            if (notes_ecart)
                updateData.notes_ecart = notes_ecart;
            if (agent_id)
                updateData.agent_id = agent_id;
            if (statut === 'valide' || statut === 'integre') {
                updateData.date_saisie = new Date().toISOString();
                updateData.agent_id = req.user.id;
            }
            const updateResult = await supabase.update('bons_livraison', updateData, { id });
            if (updateResult.error) {
                res.status(400).json({
                    success: false,
                    message: 'Erreur lors de la mise à jour du BL',
                    details: updateResult.error.message
                });
                return;
            }
            await (0, auth_1.logActivity)(req.user.id, 'bl_updated', { statut, notes_ecart }, id, req.ip, req.get('User-Agent'));
            res.json({
                success: true,
                message: 'BL mis à jour avec succès',
                data: updateResult.data?.[0]
            });
        }
        catch (error) {
            console.error('Erreur updateBL:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
    static async deleteBL(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié'
                });
                return;
            }
            if (req.user.role !== 'chef') {
                res.status(403).json({
                    success: false,
                    message: 'Seuls les chefs peuvent supprimer les BL'
                });
                return;
            }
            const { id } = req.params;
            const deleteResult = await supabase.delete('bons_livraison', { id });
            if (deleteResult.error) {
                res.status(400).json({
                    success: false,
                    message: 'Erreur lors de la suppression du BL',
                    details: deleteResult.error.message
                });
                return;
            }
            await (0, auth_1.logActivity)(req.user.id, 'bl_deleted', {}, id, req.ip, req.get('User-Agent'));
            res.json({
                success: true,
                message: 'BL supprimé avec succès'
            });
        }
        catch (error) {
            console.error('Erreur deleteBL:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
    static async getDashboardStats(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Utilisateur non authentifié'
                });
                return;
            }
            const blResult = await supabase.select('bons_livraison', '*');
            if (blResult.error) {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des stats'
                });
                return;
            }
            const allBL = blResult.data || [];
            const today = new Date().toISOString().split('T')[0];
            const stats = {
                bl_aujourd_hui: allBL.filter(bl => bl.created_at?.startsWith(today)).length,
                bl_en_attente: allBL.filter(bl => bl.statut === 'en_attente').length,
                bl_valides: allBL.filter(bl => bl.statut === 'valide').length,
                ecarts_detectes: 0,
                palettes_stockees: 0,
                montant_total_mois: allBL
                    .filter(bl => bl.created_at?.startsWith(new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')))
                    .reduce((sum, bl) => sum + (bl.montant_total || 0), 0)
            };
            res.json({
                success: true,
                message: 'Stats récupérées avec succès',
                data: stats
            });
        }
        catch (error) {
            console.error('Erreur getDashboardStats:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur interne du serveur'
            });
        }
    }
}
exports.BLController = BLController;
//# sourceMappingURL=blController.js.map