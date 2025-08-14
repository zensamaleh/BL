import Database from '../config/database';

const testDatabaseConnection = async (): Promise<void> => {
  console.log('🚀 Démarrage du test de connexion Supabase...');
  console.log('='.repeat(60));
  
  const database = Database.getInstance();
  
  try {
    // Test de connexion détaillé
    console.log('🔍 Étape 1: Test de connexion détaillé');
    const testResult = await database.testConnection();
    
    if (testResult.success) {
      console.log('✅ Test de connexion réussi!');
      console.log('Détails:', JSON.stringify(testResult.details, null, 2));
    } else {
      console.log('❌ Test de connexion échoué');
      console.log('Erreur:', testResult.message);
      console.log('Détails:', JSON.stringify(testResult.details, null, 2));
    }
    
    console.log('\n🎯 Étape 2: Health check');
    const healthResult = await database.healthCheck();
    
    if (healthResult) {
      console.log('✅ Health check réussi!');
    } else {
      console.log('❌ Health check échoué');
    }
    
    console.log('\n📅 Étape 3: Test de requête simple');
    try {
      const result = await database.query('SELECT \'Test de connexion Supabase\' as message, NOW() as timestamp');
      console.log('✅ Requête simple réussie:', result.rows[0]);
    } catch (queryError: any) {
      console.log('❌ Requête simple échouée:', queryError.message);
    }
    
  } catch (error: any) {
    console.error('❌ Erreur générale:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  } finally {
    try {
      await database.close();
      console.log('\n🔌 Connexions fermées');
    } catch (closeError) {
      console.log('⚠️ Erreur lors de la fermeture:', closeError);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test de connexion terminé');
};

// Exécution si appelé directement
if (require.main === module) {
  testDatabaseConnection().catch(console.error);
}

export { testDatabaseConnection };