-- Aegean BL - Database Schema PostgreSQL
-- Schéma de base de données pour la gestion des bons de livraison

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('chauffeur', 'agent', 'chef', 'admin')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des bons de livraison
CREATE TABLE bons_livraison (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(100) UNIQUE NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    palettes INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'captured' CHECK (status IN ('captured', 'pending', 'validated', 'rejected')),
    
    -- Dates importantes
    date_preparation TIMESTAMP WITH TIME ZONE,
    date_reception TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_saisie TIMESTAMP WITH TIME ZONE,
    
    -- Relations utilisateurs
    chauffeur_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES users(id),
    
    -- Notes et commentaires
    notes_chauffeur TEXT,
    notes_agent TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des images des BL
CREATE TABLE bl_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bl_id UUID REFERENCES bons_livraison(id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    image_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des écarts détectés
CREATE TABLE ecarts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bl_id UUID REFERENCES bons_livraison(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'montant', 'palettes', 'manquant', 'delai'
    description TEXT NOT NULL,
    montant_ecart DECIMAL(15,2),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT
);

-- Table des palettes stockées chez fournisseur
CREATE TABLE palettes_stockees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bl_id UUID REFERENCES bons_livraison(id),
    quantite INTEGER NOT NULL,
    produit VARCHAR(255),
    date_stockage TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_prevue_recuperation TIMESTAMP WITH TIME ZONE,
    date_recuperation TIMESTAMP WITH TIME ZONE,
    statut VARCHAR(50) DEFAULT 'stocke' CHECK (statut IN ('stocke', 'programme', 'recupere'))
);

-- Table des logs d'activité pour traçabilité
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    bl_id UUID REFERENCES bons_livraison(id),
    action VARCHAR(100) NOT NULL, -- 'created', 'validated', 'rejected', 'updated'
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rapports générés
CREATE TABLE rapports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre VARCHAR(255) NOT NULL,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    format VARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'excel')),
    file_path VARCHAR(500),
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_count INTEGER DEFAULT 0
);

-- Indexes pour améliorer les performances
CREATE INDEX idx_bl_numero ON bons_livraison(numero);
CREATE INDEX idx_bl_status ON bons_livraison(status);
CREATE INDEX idx_bl_chauffeur ON bons_livraison(chauffeur_id);
CREATE INDEX idx_bl_date_reception ON bons_livraison(date_reception);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_bl ON activity_logs(bl_id);
CREATE INDEX idx_ecarts_bl ON ecarts(bl_id);
CREATE INDEX idx_palettes_statut ON palettes_stockees(statut);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_bl_updated_at BEFORE UPDATE ON bons_livraison
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données de test initiales
INSERT INTO users (email, name, role, password_hash) VALUES
('ahmed@aegean.com', 'Ahmed Benkiran', 'chauffeur', '$2b$10$hashedpassword1'),
('sara@aegean.com', 'Sara Alami', 'agent', '$2b$10$hashedpassword2'),
('hassan@aegean.com', 'Hassan Benali', 'chef', '$2b$10$hashedpassword3'),
('admin@aegean.com', 'Admin Système', 'admin', '$2b$10$hashedpassword4');

-- Vue pour les statistiques
CREATE VIEW bl_statistics AS
SELECT 
    DATE_TRUNC('month', date_reception) as mois,
    COUNT(*) as total_bl,
    COUNT(CASE WHEN status = 'validated' THEN 1 END) as validated_bl,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bl,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_bl,
    SUM(montant) as montant_total,
    SUM(palettes) as palettes_total,
    AVG(EXTRACT(EPOCH FROM (date_saisie - date_reception))/3600) as delai_moyen_heures
FROM bons_livraison 
WHERE date_reception >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', date_reception)
ORDER BY mois DESC;

-- Vue pour le dashboard en temps réel
CREATE VIEW dashboard_realtime AS
SELECT 
    (SELECT COUNT(*) FROM bons_livraison WHERE status = 'pending') as bl_pending,
    (SELECT COUNT(*) FROM bons_livraison WHERE DATE(date_reception) = CURRENT_DATE AND status = 'validated') as bl_validated_today,
    (SELECT COUNT(*) FROM ecarts WHERE resolved_at IS NULL) as ecarts_non_resolus,
    (SELECT COUNT(*) FROM palettes_stockees WHERE statut = 'stocke') as palettes_stockees_count,
    (SELECT SUM(montant) FROM bons_livraison WHERE DATE(date_reception) = CURRENT_DATE) as montant_total_today;

COMMENT ON TABLE bons_livraison IS 'Table principale des bons de livraison avec traçabilité complète';
COMMENT ON TABLE users IS 'Utilisateurs du système avec rôles et permissions';
COMMENT ON TABLE ecarts IS 'Écarts détectés entre facturé et reçu pour lutte anti-fraude';
COMMENT ON TABLE activity_logs IS 'Log complet de toutes les actions pour audit et traçabilité';
COMMENT ON VIEW bl_statistics IS 'Statistiques mensuelles pour rapports et analytics';
COMMENT ON VIEW dashboard_realtime IS 'KPI temps réel pour le dashboard chef/manager';