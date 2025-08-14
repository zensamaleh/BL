-- ==========================================
-- SCRIPT SUPABASE - ÉTAPE 3: TABLE BONS DE LIVRAISON
-- ==========================================

-- Créer la table des bons de livraison
CREATE TABLE bons_livraison (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_bl VARCHAR(50) UNIQUE NOT NULL,
    montant_total DECIMAL(12,2) NOT NULL,
    nombre_palettes INTEGER NOT NULL DEFAULT 1,
    date_preparation DATE NOT NULL,
    date_reception TIMESTAMP,
    date_saisie TIMESTAMP,
    statut VARCHAR(20) NOT NULL DEFAULT 'capture',
    notes TEXT,
    notes_ecart TEXT,
    chauffeur_id UUID NOT NULL,
    agent_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter les contraintes
ALTER TABLE bons_livraison ADD CONSTRAINT check_statut 
CHECK (statut IN ('capture', 'en_attente', 'valide', 'rejete', 'integre'));

ALTER TABLE bons_livraison ADD CONSTRAINT fk_chauffeur 
FOREIGN KEY (chauffeur_id) REFERENCES users(id);

ALTER TABLE bons_livraison ADD CONSTRAINT fk_agent 
FOREIGN KEY (agent_id) REFERENCES users(id);

-- Vérifier
SELECT 'Table bons_livraison créée!' as message;