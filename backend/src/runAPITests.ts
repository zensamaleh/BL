import dotenv from 'dotenv';
import runAPITests from './testAPI';

// Charger les variables d'environnement
dotenv.config();

console.log('🧪 Test complet de l\'API Aegean BL Management\n');

// Attendre un peu que le serveur soit prêt
setTimeout(() => {
  runAPITests().catch(console.error);
}, 2000);