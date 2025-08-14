-- ==========================================
-- SCRIPT SUPABASE - ÉTAPE 4: IMAGES ET ÉCARTS
-- ==========================================

-- 1. Table pour les images des BL (photos prises par les chauffeurs)
CREATE TABLE bl_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bl_id UUID NOT NULL,
    url_image VARCHAR(500) NOT NULL,
    type_image VARCHAR(20) DEFAULT 'capture',
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Contraintes pour bl_images
ALTER TABLE bl_images ADD CONSTRAINT fk_bl_images_bl 
FOREIGN KEY (bl_id) REFERENCES bons_livraison(id) ON DELETE CASCADE;

ALTER TABLE bl_images ADD CONSTRAINT fk_bl_images_user 
FOREIGN KEY (uploaded_by) REFERENCES users(id);

ALTER TABLE bl_images ADD CONSTRAINT check_type_image 
CHECK (type_image IN ('capture', 'ecart', 'autre'));

-- 2. Table pour gérer les écarts/anomalies
CREATE TABLE ecarts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bl_id UUID NOT NULL,
    type_ecart VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    quantite_manquante INTEGER,
    valeur_manquante DECIMAL(10,2),
    statut VARCHAR(20) DEFAULT 'signale',
    signale_par UUID NOT NULL,
    traite_par UUID,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_traitement TIMESTAMP,
    resolution TEXT
);

-- Contraintes pour ecarts
ALTER TABLE ecarts ADD CONSTRAINT fk_ecarts_bl 
FOREIGN KEY (bl_id) REFERENCES bons_livraison(id) ON DELETE CASCADE;

ALTER TABLE ecarts ADD CONSTRAINT fk_ecarts_signale 
FOREIGN KEY (signale_par) REFERENCES users(id);

ALTER TABLE ecarts ADD CONSTRAINT fk_ecarts_traite 
FOREIGN KEY (traite_par) REFERENCES users(id);

ALTER TABLE ecarts ADD CONSTRAINT check_statut_ecart 
CHECK (statut IN ('signale', 'en_cours', 'resolu', 'rejete'));

-- Vérifier
SELECT 'Tables bl_images et ecarts créées!' as message;