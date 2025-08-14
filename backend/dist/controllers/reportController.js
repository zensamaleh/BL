"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
class ReportController {
    static async generateMonthlyReport(req, res) {
        console.log('[SIMULATION] La génération de rapport est demandée avec:', req.body);
        res.json({
            success: true,
            message: 'La génération de rapport a été demandée (simulation). Dans un environnement réel, le fichier serait généré et téléchargé.'
        });
    }
    static async listReports(req, res) {
        console.log('[SIMULATION] listReports called');
        res.json({
            success: true,
            message: 'Liste de rapports simulée',
            data: [
                { id: 1, nom_rapport: 'rapport_simule_mensuel_1', type_rapport: 'mensuel', created_at: new Date().toISOString(), genere_par_nom: 'Chef de quai (Simulé)' },
                { id: 2, nom_rapport: 'rapport_simule_hebdomadaire_1', type_rapport: 'hebdomadaire', created_at: new Date().toISOString(), genere_par_nom: 'Agent de quai (Simulé)' }
            ]
        });
    }
    static async downloadReport(req, res) {
        const { id } = req.params;
        console.log(`[SIMULATION] downloadReport called for id ${id}`);
        res.status(404).json({ success: false, message: 'Le téléchargement de rapports existants n\'est pas supporté en simulation.' });
    }
}
exports.ReportController = ReportController;
//# sourceMappingURL=reportController.js.map