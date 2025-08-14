-- ==========================================
-- SCRIPT SUPABASE SIMPLE - ÉTAPE 1: TEST DE BASE
-- ==========================================

-- Test de base pour vérifier que tout fonctionne
SELECT 'Test de connexion réussi!' as message;

-- Vérifier les extensions disponibles
SELECT name FROM pg_available_extensions WHERE name = 'uuid-ossp';