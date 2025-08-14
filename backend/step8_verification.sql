-- ==========================================
-- SCRIPT SUPABASE - ÉTAPE 8: VÉRIFICATION COMPLÈTE
-- ==========================================

-- 1. Vérifier que toutes les tables existent
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 
    'bons_livraison', 
    'bl_images', 
    'ecarts', 
    'palettes_stockees', 
    'activity_logs', 
    'rapports'
)
ORDER BY table_name;

-- 2. Vérifier le nombre de colonnes par table
SELECT 
    table_name,
    COUNT(*) as nombre_colonnes
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 
    'bons_livraison', 
    'bl_images', 
    'ecarts', 
    'palettes_stockees', 
    'activity_logs', 
    'rapports'
)
GROUP BY table_name
ORDER BY table_name;

-- 3. Vérifier les contraintes de clés étrangères
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. Compter les données dans chaque table
SELECT 'users' as table_name, COUNT(*) as nombre_lignes FROM users
UNION ALL
SELECT 'bons_livraison', COUNT(*) FROM bons_livraison
UNION ALL
SELECT 'bl_images', COUNT(*) FROM bl_images
UNION ALL
SELECT 'ecarts', COUNT(*) FROM ecarts
UNION ALL
SELECT 'palettes_stockees', COUNT(*) FROM palettes_stockees
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs
UNION ALL
SELECT 'rapports', COUNT(*) FROM rapports;

-- 5. Message final
SELECT '✅ Vérification complète terminée ! Base de données prête.' as resultat;