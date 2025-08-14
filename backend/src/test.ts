import dotenv from 'dotenv';
import testSupabaseRest from './utils/testSupabaseRest';

// Charger les variables d'environnement
dotenv.config();

const runTests = async (): Promise<void> => {
  console.log('🚀 Début des tests backend...\n');
  
  // Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log(`- SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Définie' : '❌ Manquante'}`);
  console.log(`- SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Définie' : '❌ Manquante'}`);
  console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Définie' : '❌ Manquante'}\n`);
  
  // Test de la connexion Supabase REST
  await testSupabaseRest();
  
  console.log('\n🏁 Tests terminés!');
};

runTests().catch(console.error);