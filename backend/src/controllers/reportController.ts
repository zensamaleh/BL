import { Request, Response } from 'express';
import { AuthenticatedRequest, logActivity } from '../middleware/auth';
import Database from '../config/database';
import { ApiResponse, MonthlyReport } from '../types';
import PDFDocument from 'pdfkit';
import * as xl from 'excel4node';
import * as fs from 'fs';
import * as path from 'path';

const database = Database.getInstance();

export class ReportController {
  // Générer rapport mensuel
  static async generateMonthlyReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      const { type_rapport, periode_debut, periode_fin, format } = req.body;
      const formatType = format || 'pdf'; // pdf ou excel

      // Récupérer les données
      const dataQuery = `
        SELECT 
          bl.numero_bl,
          bl.montant_total,
          bl.date_preparation,
          bl.date_reception,
          bl.date_saisie,
          bl.statut,
          u.nom_complet as chauffeur_nom
        FROM bons_livraison bl
        JOIN users u ON bl.chauffeur_id = u.id
        WHERE bl.date_preparation BETWEEN $1 AND $2
        ORDER BY bl.date_preparation DESC
      `;

      const dataResult = await database.query(dataQuery, [periode_debut, periode_fin]);
      const data: MonthlyReport[] = dataResult.rows;

      if (data.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Aucune donnée trouvée pour cette période'
        } as ApiResponse);
        return;
      }

      // Calculer les statistiques
      const stats = {
        total_bl: data.length,
        total_montant: data.reduce((sum, bl) => sum + parseFloat(bl.montant_total.toString()), 0),
        bl_valides: data.filter(bl => bl.statut === 'valide').length,
        bl_en_attente: data.filter(bl => bl.statut === 'en_attente').length,
        bl_rejetes: data.filter(bl => bl.statut === 'rejete').length
      };

      // Créer le répertoire de rapports s'il n'existe pas
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileName = `rapport_${type_rapport}_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
      let filePath: string;
      let mimeType: string;

      if (formatType === 'excel') {
        filePath = await ReportController.generateExcelReport(data, stats, fileName, reportsDir, periode_debut, periode_fin);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        filePath = await ReportController.generatePDFReport(data, stats, fileName, reportsDir, periode_debut, periode_fin);
        mimeType = 'application/pdf';
      }

      // Enregistrer le rapport dans la base
      const rapportResult = await database.query(
        `INSERT INTO rapports (nom_rapport, type_rapport, periode_debut, periode_fin, chemin_fichier, statut, genere_par)
         VALUES ($1, $2, $3, $4, $5, 'termine', $6)
         RETURNING *`,
        [fileName, type_rapport, periode_debut, periode_fin, filePath, req.user.id]
      );

      await logActivity(
        req.user.id,
        'GENERATION_RAPPORT',
        { type_rapport, periode_debut, periode_fin, format: formatType },
        undefined,
        req.ip,
        req.get('User-Agent')
      );

      // Envoyer le fichier
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.${formatType === 'excel' ? 'xlsx' : 'pdf'}"`);
      res.setHeader('Content-Type', mimeType);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }

  // Générer rapport PDF
  private static async generatePDFReport(
    data: MonthlyReport[], 
    stats: any, 
    fileName: string, 
    reportsDir: string,
    periode_debut: string,
    periode_fin: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filePath = path.join(reportsDir, `${fileName}.pdf`);
        const doc = new PDFDocument({ margin: 50 });
        
        doc.pipe(fs.createWriteStream(filePath));

        // En-tête
        doc.fontSize(20).font('Helvetica-Bold').text('RAPPORT MENSUEL - BONS DE LIVRAISON', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Période : du ${periode_debut} au ${periode_fin}`, { align: 'center' });
        doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
        
        doc.moveDown(2);

        // Statistiques générales
        doc.fontSize(16).font('Helvetica-Bold').text('STATISTIQUES GÉNÉRALES');
        doc.moveDown();
        
        doc.fontSize(12).font('Helvetica');
        doc.text(`Total des BL : ${stats.total_bl}`);
        doc.text(`Montant total : ${stats.total_montant.toLocaleString('fr-FR')} DA`);
        doc.text(`BL validés : ${stats.bl_valides}`);
        doc.text(`BL en attente : ${stats.bl_en_attente}`);
        doc.text(`BL rejetés : ${stats.bl_rejetes}`);
        
        doc.moveDown(2);

        // Tableau des BL
        doc.fontSize(16).font('Helvetica-Bold').text('DÉTAIL DES BONS DE LIVRAISON');
        doc.moveDown();

        // En-têtes du tableau
        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 150;
        const col3X = 220;
        const col4X = 300;
        const col5X = 380;
        const col6X = 460;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('N° BL', col1X, tableTop);
        doc.text('Montant', col2X, tableTop);
        doc.text('Préparation', col3X, tableTop);
        doc.text('Réception', col4X, tableTop);
        doc.text('Saisie', col5X, tableTop);
        doc.text('Statut', col6X, tableTop);

        // Ligne de séparation
        doc.moveTo(col1X, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Données
        let y = tableTop + 25;
        doc.fontSize(9).font('Helvetica');

        data.forEach((bl, index) => {
          if (y > 750) { // Nouvelle page
            doc.addPage();
            y = 50;
          }

          doc.text(bl.numero_bl, col1X, y);
          doc.text(`${parseFloat(bl.montant_total.toString()).toLocaleString('fr-FR')} DA`, col2X, y);
          doc.text(new Date(bl.date_preparation).toLocaleDateString('fr-FR'), col3X, y);
          doc.text(bl.date_reception ? new Date(bl.date_reception).toLocaleDateString('fr-FR') : '-', col4X, y);
          doc.text(bl.date_saisie ? new Date(bl.date_saisie).toLocaleDateString('fr-FR') : '-', col5X, y);
          doc.text(bl.statut.toUpperCase(), col6X, y);

          y += 15;
        });

        doc.end();

        doc.on('end', () => {
          resolve(filePath);
        });

        doc.on('error', (error: Error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Générer rapport Excel
  private static async generateExcelReport(
    data: MonthlyReport[], 
    stats: any, 
    fileName: string, 
    reportsDir: string,
    periode_debut: string,
    periode_fin: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Rapport BL');

        // Styles
        const headerStyle = wb.createStyle({
          font: { bold: true, size: 12, color: '#FFFFFF' },
          alignment: { horizontal: 'center' },
          fill: { type: 'pattern', patternType: 'solid', fgColor: '#4472C4' }
        });

        const titleStyle = wb.createStyle({
          font: { bold: true, size: 16 },
          alignment: { horizontal: 'center' }
        });

        const statsStyle = wb.createStyle({
          font: { bold: true },
          fill: { type: 'pattern', patternType: 'solid', fgColor: '#F2F2F2' }
        });

        // Titre
        ws.cell(1, 1, 1, 6, true).string('RAPPORT MENSUEL - BONS DE LIVRAISON').style(titleStyle);
        ws.cell(2, 1, 2, 6, true).string(`Période : du ${periode_debut} au ${periode_fin}`);
        ws.cell(3, 1, 3, 6, true).string(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`);

        // Statistiques
        ws.cell(5, 1).string('STATISTIQUES GÉNÉRALES').style(statsStyle);
        ws.cell(6, 1).string('Total des BL :').style(statsStyle);
        ws.cell(6, 2).number(stats.total_bl);
        ws.cell(7, 1).string('Montant total :').style(statsStyle);
        ws.cell(7, 2).string(`${stats.total_montant.toLocaleString('fr-FR')} DA`);
        ws.cell(8, 1).string('BL validés :').style(statsStyle);
        ws.cell(8, 2).number(stats.bl_valides);
        ws.cell(9, 1).string('BL en attente :').style(statsStyle);
        ws.cell(9, 2).number(stats.bl_en_attente);
        ws.cell(10, 1).string('BL rejetés :').style(statsStyle);
        ws.cell(10, 2).number(stats.bl_rejetes);

        // En-têtes du tableau
        const startRow = 12;
        ws.cell(startRow, 1).string('N° BL').style(headerStyle);
        ws.cell(startRow, 2).string('Montant (DA)').style(headerStyle);
        ws.cell(startRow, 3).string('Date Préparation').style(headerStyle);
        ws.cell(startRow, 4).string('Date Réception').style(headerStyle);
        ws.cell(startRow, 5).string('Date Saisie').style(headerStyle);
        ws.cell(startRow, 6).string('Statut').style(headerStyle);

        // Données
        data.forEach((bl, index) => {
          const row = startRow + 1 + index;
          ws.cell(row, 1).string(bl.numero_bl);
          ws.cell(row, 2).number(parseFloat(bl.montant_total.toString()));
          ws.cell(row, 3).string(new Date(bl.date_preparation).toLocaleDateString('fr-FR'));
          ws.cell(row, 4).string(bl.date_reception ? new Date(bl.date_reception).toLocaleDateString('fr-FR') : '-');
          ws.cell(row, 5).string(bl.date_saisie ? new Date(bl.date_saisie).toLocaleDateString('fr-FR') : '-');
          ws.cell(row, 6).string(bl.statut.toUpperCase());
        });

        // Ajuster la largeur des colonnes
        ws.column(1).setWidth(15);
        ws.column(2).setWidth(15);
        ws.column(3).setWidth(15);
        ws.column(4).setWidth(15);
        ws.column(5).setWidth(15);
        ws.column(6).setWidth(12);

        const filePath = path.join(reportsDir, `${fileName}.xlsx`);
        wb.write(filePath);
        
        resolve(filePath);

      } catch (error) {
        reject(error);
      }
    });
  }

  // Lister les rapports générés
  static async listReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      const result = await database.query(
        `SELECT r.*, u.nom_complet as genere_par_nom
         FROM rapports r
         JOIN users u ON r.genere_par = u.id
         ORDER BY r.created_at DESC
         LIMIT 50`
      );

      res.json({
        success: true,
        data: result.rows
      } as ApiResponse);

    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }

  // Télécharger un rapport existant
  static async downloadReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        } as ApiResponse);
        return;
      }

      const { id } = req.params;

      const result = await database.query(
        'SELECT * FROM rapports WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Rapport non trouvé'
        } as ApiResponse);
        return;
      }

      const rapport = result.rows[0];
      
      if (!fs.existsSync(rapport.chemin_fichier)) {
        res.status(404).json({
          success: false,
          message: 'Fichier de rapport non trouvé'
        } as ApiResponse);
        return;
      }

      const extension = path.extname(rapport.chemin_fichier);
      const mimeType = extension === '.xlsx' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

      res.setHeader('Content-Disposition', `attachment; filename="${rapport.nom_rapport}${extension}"`);
      res.setHeader('Content-Type', mimeType);
      
      const fileStream = fs.createReadStream(rapport.chemin_fichier);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      } as ApiResponse);
    }
  }
}