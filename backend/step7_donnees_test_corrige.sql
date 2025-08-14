-- ==========================================
-- SCRIPT SUPABASE - ÉTAPE 7: DONNÉES DE TEST (VERSION CORRIGÉE)
-- ==========================================

-- 1. Créer des utilisateurs de test
INSERT INTO users (username, email, password_hash, role, nom_complet, telephone) VALUES
('chauffeur1', 'chauffeur1@aegean.com', '$2b$10$example_hash_1', 'chauffeur', 'Ahmed Benali', '+33612345678'),
('agent1', 'agent1@aegean.com', '$2b$10$example_hash_2', 'agent', 'Fatima Zahra', '+33612345679'),
('chef1', 'chef@aegean.com', '$2b$10$example_hash_3', 'chef', 'Mohamed Chef', '+33612345680')
ON CONFLICT (username) DO NOTHING;

-- 2. Créer quelques BL de test avec la syntaxe PostgreSQL correcte
INSERT INTO bons_livraison (numero_bl, montant_total, nombre_palettes, date_preparation, chauffeur_id, statut)
VALUES 
    ('BL-2024-001', 15000.50, 3, '2024-01-15'::DATE, 
     (SELECT id FROM users WHERE username = 'chauffeur1'), 'capture'),
    ('BL-2024-002', 22500.75, 5, '2024-01-16'::DATE, 
     (SELECT id FROM users WHERE username = 'chauffeur1'), 'valide')
ON CONFLICT (numero_bl) DO NOTHING;

-- 3. Créer une palette stockée de test
INSERT INTO palettes_stockees (numero_palette, numero_bl_associe, montant, date_stockage, statut)
VALUES ('PAL-2024-001', 'BL-2024-003', 8500.00, '2024-01-10'::DATE, 'stockee')
ON CONFLICT (numero_palette) DO NOTHING;

-- 4. Créer un écart de test
INSERT INTO ecarts (bl_id, type_ecart, description, quantite_manquante, valeur_manquante, statut, signale_par)
VALUES (
    (SELECT id FROM bons_livraison WHERE numero_bl = 'BL-2024-001'),
    'manquant',
    'Il manque 2 caisses de produits', 
    2, 
    150.00, 
    'signale',
    (SELECT id FROM users WHERE username = 'chauffeur1')
);

-- 5. Vérifier les données
SELECT 'Données de test ajoutées avec succès!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_bl FROM bons_livraison;
SELECT COUNT(*) as total_palettes FROM palettes_stockees;
SELECT COUNT(*) as total_ecarts FROM ecarts;