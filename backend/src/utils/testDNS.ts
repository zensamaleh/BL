import * as dns from 'dns';
import { promisify } from 'util';

const resolve = promisify(dns.resolve4);
const lookup = promisify(dns.lookup);

const testDNSResolution = async (): Promise<void> => {
  const hostname = 'db.siicppcypillvxkoycep.supabase.co';
  
  console.log('🔍 Test de résolution DNS pour:', hostname);
  console.log('='.repeat(60));
  
  try {
    // Test 1: Lookup général
    console.log('\n🔍 Test 1: DNS Lookup général...');
    try {
      const result = await lookup(hostname);
      console.log('✅ Lookup réussi:', result);
    } catch (error: any) {
      console.log('❌ Échec lookup:', error.message);
      console.log('Code d\'erreur:', error.code);
    }
    
    // Test 2: Tester le domaine parent
    console.log('\n🔍 Test 2: Test domaine parent supabase.co...');
    try {
      const parentResult = await lookup('supabase.co');
      console.log('✅ Domaine parent accessible:', parentResult);
    } catch (error: any) {
      console.log('❌ Domaine parent inaccessible:', error.message);
    }
    
    // Test 3: Configuration DNS actuelle
    console.log('\n🔍 Test 3: Configuration DNS actuelle...');
    try {
      const dnsServers = dns.getServers();
      console.log('✅ Serveurs DNS configurés:', dnsServers);
    } catch (error: any) {
      console.log('❌ Erreur récupération serveurs DNS:', error.message);
    }
    
  } catch (error: any) {
    console.error('❌ Erreur générale:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test DNS terminé');
};

// Exécution si appelé directement
if (require.main === module) {
  testDNSResolution().catch(console.error);
}

export { testDNSResolution };