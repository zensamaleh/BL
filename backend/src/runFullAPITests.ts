import dotenv from 'dotenv';
import runFullAPITests from './testAPIFull';

// Charger les variables d'environnement
dotenv.config();

console.log('🧪 Test complet et réaliste de l\'API Aegean BL Management\n');

// Attendre un peu que le serveur soit prêt
setTimeout(() => {
  runFullAPITests().catch(console.error);
}, 2000);