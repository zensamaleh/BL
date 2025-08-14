import dns from 'dns';

const testIPv4 = async (): Promise<void> => {
  console.log('🔍 Test DNS et IPv4...');
  
  const domain = 'db.siicppcypillvxkoycep.supabase.co';
  
  try {
    // Forcer la résolution IPv4
    dns.setDefaultResultOrder('ipv4first');
    
    const addresses = await new Promise<string[]>((resolve, reject) => {
      dns.resolve4(domain, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    
    console.log(`✅ Adresses IPv4 pour ${domain}:`, addresses);
    
    // Test de résolution avec family forcée
    const lookup = await new Promise<{ address: string; family: number }>((resolve, reject) => {
      dns.lookup(domain, { family: 4 }, (err, address, family) => {
        if (err) reject(err);
        else resolve({ address, family });
      });
    });
    
    console.log(`✅ Lookup IPv4: ${lookup.address} (family: ${lookup.family})`);
    
  } catch (error) {
    console.error(`❌ Erreur DNS IPv4:`, error);
  }
};

export default testIPv4;