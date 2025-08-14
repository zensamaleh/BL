-- ==========================================
-- SCRIPT SUPABASE - ÉTAPE 7: DONNÉES DE TEST
-- ==========================================

-- 1. Créer des utilisateurs de test
INSERT INTO users (username, email, password_hash, role, nom_complet, telephone) VALUES
('chauffeur1', 'chauffeur1@aegean.com', '$2b$10$example_hash_1', 'chauffeur', 'Ahmed Benali', '+33612345678'),
('agent1', 'agent1@aegean.com', '$2b$10$example_hash_2', 'agent', 'Fatima Zahra', '+33612345679'),
('chef1', 'chef@aegean.com', '$2b$10$example_hash_3', 'chef', 'Mohamed Chef', '+33612345680');

-- 2. Créer quelques BL de test
INSERT INTO bons_livraison (numero_bl, montant_total, nombre_palettes, date_preparation, chauffeur_id, statut)
SELECT 
    'BL-2024-001',
    15000.50,
    3,
    DATE('2024-01-15'),
    (SELECT id FROM users WHERE username = 'chauffeur1'),
    'capture'
UNION ALL
SELECT 
    'BL-2024-002',
    22500.75,
    5,
    DATE('2024-01-16'),
    (SELECT id FROM users WHERE username = 'chauffeur1'),
    'valide';

-- 3. Créer une palette stockée de test
INSERT INTO palettes_stockees (numero_palette, numero_bl_associe, montant, date_stockage, statut)
VALUES ('PAL-2024-001', 'BL-2024-003', 8500.00, DATE('2024-01-10'), 'stockee');

-- 4. Vérifier les données
SELECT 'Données de test ajoutées!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_bl FROM bons_livraison;
SELECT COUNT(*) as total_palettes FROM palettes_stockees;