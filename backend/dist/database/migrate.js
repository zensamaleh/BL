"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = void 0;
const database_1 = __importDefault(require("../config/database"));
const database = database_1.default.getInstance();
const createTables = async () => {
    const createTablesSQL = `
    -- Extension pour les UUID
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Table des utilisateurs
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('chauffeur', 'agent', 'chef')),
        nom_complet VARCHAR(100) NOT NULL,
        telephone VARCHAR(20),
        actif BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des bons de livraison
    CREATE TABLE IF NOT EXISTS bons_livraison (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        numero_bl VARCHAR(50) UNIQUE NOT NULL,
        montant_total DECIMAL(12,2) NOT NULL,
        nombre_palettes INTEGER NOT NULL DEFAULT 1,
        date_preparation DATE NOT NULL,
        date_reception TIMESTAMP,
        date_saisie TIMESTAMP,
        statut VARCHAR(20) NOT NULL DEFAULT 'capture' 
            CHECK (statut IN ('capture', 'en_attente', 'valide', 'rejete', 'integre')),
        notes TEXT,
        notes_ecart TEXT,
        chauffeur_id UUID NOT NULL REFERENCES users(id),
        agent_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des images des BL
    CREATE TABLE IF NOT EXISTS bl_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        bl_id UUID NOT NULL REFERENCES bons_livraison(id) ON DELETE CASCADE,
        nom_fichier VARCHAR(255) NOT NULL,
        chemin_fichier VARCHAR(500) NOT NULL,
        taille_fichier INTEGER NOT NULL,
        type_mime VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des écarts détectés
    CREATE TABLE IF NOT EXISTS ecarts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        bl_id UUID NOT NULL REFERENCES bons_livraison(id) ON DELETE CASCADE,
        type_ecart VARCHAR(30) NOT NULL 
            CHECK (type_ecart IN ('manquant', 'surplus', 'endommage', 'montant_incorrect')),
        description TEXT NOT NULL,
        montant_ecart DECIMAL(12,2),
        statut VARCHAR(20) NOT NULL DEFAULT 'en_cours'
            CHECK (statut IN ('en_cours', 'resolu', 'confirme')),
        detecte_par UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des palettes stockées chez le fournisseur
    CREATE TABLE IF NOT EXISTS palettes_stockees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        numero_palette VARCHAR(50) NOT NULL,
        bl_id UUID NOT NULL REFERENCES bons_livraison(id),
        date_stockage DATE NOT NULL,
        date_recuperation DATE,
        statut VARCHAR(20) NOT NULL DEFAULT 'stockee'
            CHECK (statut IN ('stockee', 'recuperee')),
        emplacement VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des logs d'activité
    CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        bl_id UUID REFERENCES bons_livraison(id),
        action VARCHAR(100) NOT NULL,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Table des rapports générés
    CREATE TABLE IF NOT EXISTS rapports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nom_rapport VARCHAR(200) NOT NULL,
        type_rapport VARCHAR(20) NOT NULL 
            CHECK (type_rapport IN ('mensuel', 'hebdomadaire', 'personnalise')),
        periode_debut DATE NOT NULL,
        periode_fin DATE NOT NULL,
        chemin_fichier VARCHAR(500) NOT NULL,
        statut VARCHAR(20) NOT NULL DEFAULT 'en_cours'
            CHECK (statut IN ('en_cours', 'termine', 'erreur')),
        genere_par UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Fonction pour mettre à jour updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Triggers pour updated_at
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_bons_livraison_updated_at BEFORE UPDATE ON bons_livraison 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_ecarts_updated_at BEFORE UPDATE ON ecarts 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_palettes_stockees_updated_at BEFORE UPDATE ON palettes_stockees 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Index pour les performances
    CREATE INDEX IF NOT EXISTS idx_bons_livraison_numero_bl ON bons_livraison(numero_bl);
    CREATE INDEX IF NOT EXISTS idx_bons_livraison_statut ON bons_livraison(statut);
    CREATE INDEX IF NOT EXISTS idx_bons_livraison_chauffeur ON bons_livraison(chauffeur_id);
    CREATE INDEX IF NOT EXISTS idx_bons_livraison_agent ON bons_livraison(agent_id);
    CREATE INDEX IF NOT EXISTS idx_bons_livraison_date_preparation ON bons_livraison(date_preparation);
    CREATE INDEX IF NOT EXISTS idx_bl_images_bl_id ON bl_images(bl_id);
    CREATE INDEX IF NOT EXISTS idx_ecarts_bl_id ON ecarts(bl_id);
    CREATE INDEX IF NOT EXISTS idx_ecarts_statut ON ecarts(statut);
    CREATE INDEX IF NOT EXISTS idx_palettes_stockees_statut ON palettes_stockees(statut);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
  `;
    try {
        console.log('🔄 Création des tables...');
        await database.query(createTablesSQL);
        console.log('✅ Tables créées avec succès');
    }
    catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error);
        throw error;
    }
};
const createViews = async () => {
    const createViewsSQL = `
    -- Vue pour les statistiques du dashboard
    CREATE OR REPLACE VIEW dashboard_stats AS
    SELECT 
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as bl_aujourd_hui,
        COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as bl_en_attente,
        COUNT(CASE WHEN statut = 'valide' THEN 1 END) as bl_valides,
        (SELECT COUNT(*) FROM ecarts WHERE statut = 'en_cours') as ecarts_detectes,
        (SELECT COUNT(*) FROM palettes_stockees WHERE statut = 'stockee') as palettes_stockees,
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM date_preparation) = EXTRACT(MONTH FROM CURRENT_DATE)
                              AND EXTRACT(YEAR FROM date_preparation) = EXTRACT(YEAR FROM CURRENT_DATE)
                         THEN montant_total ELSE 0 END), 0) as montant_total_mois
    FROM bons_livraison;

    -- Vue pour les BL avec informations complètes
    CREATE OR REPLACE VIEW bl_complets AS
    SELECT 
        bl.*,
        c.nom_complet as chauffeur_nom,
        c.username as chauffeur_username,
        a.nom_complet as agent_nom,
        a.username as agent_username,
        COUNT(img.id) as nombre_images,
        COUNT(e.id) as nombre_ecarts
    FROM bons_livraison bl
    LEFT JOIN users c ON bl.chauffeur_id = c.id
    LEFT JOIN users a ON bl.agent_id = a.id
    LEFT JOIN bl_images img ON bl.id = img.bl_id
    LEFT JOIN ecarts e ON bl.id = e.bl_id
    GROUP BY bl.id, c.nom_complet, c.username, a.nom_complet, a.username;

    -- Vue pour le rapport mensuel
    CREATE OR REPLACE VIEW rapport_mensuel AS
    SELECT 
        numero_bl,
        montant_total,
        date_preparation,
        date_reception,
        date_saisie,
        statut,
        nom_complet as chauffeur_nom
    FROM bons_livraison bl
    JOIN users u ON bl.chauffeur_id = u.id
    ORDER BY date_preparation DESC;
  `;
    try {
        console.log('🔄 Création des vues...');
        await database.query(createViewsSQL);
        console.log('✅ Vues créées avec succès');
    }
    catch (error) {
        console.error('❌ Erreur lors de la création des vues:', error);
        throw error;
    }
};
const insertInitialData = async () => {
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
    const insertDataSQL = `
    -- Insertion des utilisateurs de test
    INSERT INTO users (username, email, password_hash, role, nom_complet, telephone) VALUES
    ('admin', 'admin@aegean.com', $1, 'chef', 'Administrateur Système', '+213555000001'),
    ('chauffeur1', 'chauffeur1@aegean.com', $2, 'chauffeur', 'Ahmed Benaissa', '+213555000002'),
    ('chauffeur2', 'chauffeur2@aegean.com', $3, 'chauffeur', 'Mohamed Khelifi', '+213555000003'),
    ('agent1', 'agent1@aegean.com', $4, 'agent', 'Fatima Zenati', '+213555000004'),
    ('agent2', 'agent2@aegean.com', $5, 'agent', 'Leila Mammeri', '+213555000005'),
    ('chef1', 'chef1@aegean.com', $6, 'chef', 'Karim Boudiaf', '+213555000006')
    ON CONFLICT (username) DO NOTHING;
  `;
    try {
        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);
        console.log('🔄 Insertion des données initiales...');
        await database.query(insertDataSQL, [
            adminPassword, userPassword, userPassword, userPassword, userPassword, adminPassword
        ]);
        console.log('✅ Données initiales insérées avec succès');
    }
    catch (error) {
        console.error('❌ Erreur lors de l\'insertion des données:', error);
        throw error;
    }
};
const runMigration = async () => {
    try {
        console.log('🚀 Démarrage de la migration de la base de données...');
        const isHealthy = await database.healthCheck();
        if (!isHealthy) {
            throw new Error('Impossible de se connecter à la base de données');
        }
        await createTables();
        await createViews();
        await insertInitialData();
        console.log('🎉 Migration terminée avec succès !');
    }
    catch (error) {
        console.error('💥 Erreur lors de la migration:', error);
        process.exit(1);
    }
    finally {
        await database.close();
    }
};
exports.runMigration = runMigration;
if (require.main === module) {
    runMigration();
}
//# sourceMappingURL=migrate.js.map