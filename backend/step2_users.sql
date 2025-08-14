-- ==========================================
-- SCRIPT SUPABASE - ÉTAPE 2: CRÉER LES TABLES DE BASE
-- ==========================================

-- 1. Activer l'extension UUID (peut déjà être activée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Créer la table users en premier (pas de dépendances)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    nom_complet VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    actif BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ajouter les contraintes de rôle
ALTER TABLE users ADD CONSTRAINT check_role 
CHECK (role IN ('chauffeur', 'agent', 'chef'));

-- 4. Vérifier que la table est créée
SELECT 'Table users créée!' as message;
SELECT count(*) as nombre_colonnes FROM information_schema.columns 
WHERE table_name = 'users';