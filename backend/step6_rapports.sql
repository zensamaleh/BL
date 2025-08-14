-- ==========================================
-- SCRIPT SUPABASE - ÉTAPE 6: RAPPORTS MENSUELS
-- ==========================================

-- Table pour sauvegarder les rapports mensuels générés
CREATE TABLE rapports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_rapport VARCHAR(50) NOT NULL,
    periode VARCHAR(20) NOT NULL, -- Format: YYYY-MM
    date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    genere_par UUID NOT NULL,
    donnees JSONB NOT NULL,
    fichier_pdf VARCHAR(500),
    fichier_excel VARCHAR(500),
    statut VARCHAR(20) DEFAULT 'genere',
    notes TEXT
);

-- Contraintes pour rapports
ALTER TABLE rapports ADD CONSTRAINT fk_rapports_user 
FOREIGN KEY (genere_par) REFERENCES users(id);

ALTER TABLE rapports ADD CONSTRAINT check_type_rapport 
CHECK (type_rapport IN ('mensuel', 'hebdomadaire', 'personnalise', 'ecarts'));

ALTER TABLE rapports ADD CONSTRAINT check_statut_rapport 
CHECK (statut IN ('genere', 'envoye', 'archive'));

-- Index pour les recherches
CREATE INDEX idx_rapports_periode ON rapports(periode);
CREATE INDEX idx_rapports_type ON rapports(type_rapport);

-- Vue pour les statistiques rapides
CREATE VIEW vue_statistiques_bl AS
SELECT 
    DATE_TRUNC('month', date_preparation) as mois,
    COUNT(*) as total_bl,
    COUNT(CASE WHEN statut = 'valide' THEN 1 END) as bl_valides,
    COUNT(CASE WHEN statut = 'capture' THEN 1 END) as bl_en_attente,
    SUM(montant_total) as montant_total_mois,
    SUM(CASE WHEN statut = 'valide' THEN montant_total ELSE 0 END) as montant_valide
FROM bons_livraison
GROUP BY DATE_TRUNC('month', date_preparation)
ORDER BY mois DESC;

-- Vérifier
SELECT 'Table rapports et vue statistiques créées!' as message;