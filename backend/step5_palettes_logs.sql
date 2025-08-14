-- ==========================================
-- SCRIPT SUPABASE - ÉTAPE 5: PALETTES ET LOGS
-- ==========================================

-- 1. Table pour les palettes stockées chez le fournisseur
CREATE TABLE palettes_stockees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_palette VARCHAR(50) UNIQUE NOT NULL,
    numero_bl_associe VARCHAR(50),
    montant DECIMAL(10,2) NOT NULL,
    date_stockage DATE NOT NULL,
    date_recuperation_prevue DATE,
    date_recuperation_reelle TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'stockee',
    emplacement VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contraintes pour palettes_stockees
ALTER TABLE palettes_stockees ADD CONSTRAINT check_statut_palette 
CHECK (statut IN ('stockee', 'planifiee', 'recuperee', 'perdue'));

-- 2. Table pour les logs d'activité
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    bl_id UUID,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contraintes pour activity_logs
ALTER TABLE activity_logs ADD CONSTRAINT fk_logs_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE activity_logs ADD CONSTRAINT fk_logs_bl 
FOREIGN KEY (bl_id) REFERENCES bons_livraison(id) ON DELETE SET NULL;

-- Index pour les recherches fréquentes
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_bl ON activity_logs(bl_id);
CREATE INDEX idx_palettes_statut ON palettes_stockees(statut);

-- Vérifier
SELECT 'Tables palettes_stockees et activity_logs créées!' as message;