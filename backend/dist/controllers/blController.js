"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLController = exports.mockBLs = void 0;
exports.mockBLs = Array.from({ length: 25 }, (_, i) => {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const statuts = ['capture', 'en_attente', 'valide', 'integre'];
    return {
        id: `bl_${i + 1}`,
        numero_bl: `BL-2025-00${i + 1}`,
        montant_total: parseFloat((Math.random() * 5000 + 500).toFixed(2)),
        nombre_palettes: Math.floor(Math.random() * 10) + 1,
        date_preparation: date,
        date_saisie: date,
        chauffeur_id: `chauffeur_${(i % 3) + 1}`,
        chauffeur_nom: `Chauffeur ${(i % 3) + 1}`,
        agent_id: `agent_${(i % 2) + 1}`,
        agent_nom: `Agent ${(i % 2) + 1}`,
        statut: statuts[i % statuts.length],
        notes: `Note pour le BL ${i + 1}`,
        notes_ecart: (i % 5 === 0) ? 'Écart de 2 colis' : undefined,
        created_at: date,
        updated_at: date,
    };
});
class BLController {
    static async createBL(req, res) {
        console.log('[SIMULATION] createBL called with:', req.body);
        const { numero_bl, montant_total } = req.body;
        const newBL = {
            id: `bl_${Math.random().toString(36).substring(2, 9)}`,
            numero_bl,
            montant_total,
            nombre_palettes: 5,
            date_preparation: new Date(),
            chauffeur_id: req.user.id,
            statut: 'capture',
            created_at: new Date(),
            updated_at: new Date()
        };
        res.status(201).json({
            success: true,
            message: 'BL créé avec succès (simulation)',
            data: newBL
        });
    }
    static async getAllBL(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const statut = req.query.statut;
        const { role, id: userId } = req.user;
        let filteredBLs = exports.mockBLs;
        if (role === 'chauffeur') {
            filteredBLs = exports.mockBLs.filter(bl => bl.chauffeur_id === userId);
        }
        if (statut) {
            filteredBLs = filteredBLs.filter(bl => bl.statut === statut);
        }
        const total = filteredBLs.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBL = filteredBLs.slice(startIndex, endIndex);
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
            message: 'BL récupérés avec succès (simulation)',
            data: response
        });
    }
    static async getBLById(req, res) {
        const { id } = req.params;
        const bl = exports.mockBLs.find(b => b.id === id);
        if (bl) {
            res.json({
                success: true,
                message: 'BL récupéré avec succès (simulation)',
                data: bl
            });
        }
        else {
            res.status(404).json({ success: false, message: 'BL non trouvé (simulation)' });
        }
    }
    static async updateBL(req, res) {
        const { id } = req.params;
        console.log(`[SIMULATION] updateBL called for id ${id} with:`, req.body);
        res.json({
            success: true,
            message: 'BL mis à jour avec succès (simulation)',
            data: { id, ...req.body }
        });
    }
    static async deleteBL(req, res) {
        const { id } = req.params;
        console.log(`[SIMULATION] deleteBL called for id ${id}`);
        res.json({ success: true, message: 'BL supprimé avec succès (simulation)' });
    }
    static async getDashboardStats(req, res) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const stats = {
            bl_aujourd_hui: exports.mockBLs.filter(bl => {
                const blDate = new Date(bl.created_at);
                blDate.setHours(0, 0, 0, 0);
                return blDate.getTime() === today.getTime();
            }).length,
            bl_en_attente: exports.mockBLs.filter(bl => bl.statut === 'en_attente').length,
            bl_valides: exports.mockBLs.filter(bl => bl.statut === 'valide').length,
            ecarts_detectes: exports.mockBLs.filter(bl => !!bl.notes_ecart).length,
            palettes_stockees: 23,
            montant_total_mois: exports.mockBLs
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
        });
    }
}
exports.BLController = BLController;
//# sourceMappingURL=blController.js.map