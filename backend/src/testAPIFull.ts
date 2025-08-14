import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  data?: any;
  error?: string;
}

const testEndpoint = async (
  endpoint: string, 
  method: string = 'GET', 
  body?: any,
  headers: Record<string, string> = {}
): Promise<TestResult> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    console.log(`🔍 Testing ${method} ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    const result: TestResult = {
      endpoint,
      method,
      status: response.status,
      success: response.ok,
      data: response.ok ? data : undefined,
      error: !response.ok ? JSON.stringify(data) : undefined
    };
    
    console.log(`📡 ${response.status} ${response.statusText}${response.ok ? ' ✅' : ' ❌'}`);
    if (response.ok && data) {
      console.log(`📦 Response:`, JSON.stringify(data, null, 2));
    }
    
    return result;
  } catch (error) {
    console.log(`❌ Network error:`, error);
    return {
      endpoint,
      method,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const runFullAPITests = async (): Promise<void> => {
  console.log('🚀 Test complet et réaliste de l\'API...\n');
  
  const tests: TestResult[] = [];
  
  // Test 1: Health check
  console.log('1️⃣ Test Health Check');
  tests.push(await testEndpoint('/health'));
  console.log('');
  
  // Générer un username unique pour éviter les conflits
  const timestamp = Date.now();
  const testUsername = `testuser_${timestamp}`;
  const testEmail = `test_${timestamp}@aegean.com`;
  const testPassword = 'testpassword123';
  
  // Test 2: Register nouveau utilisateur
  console.log('2️⃣ Test Register');
  const registerData = {
    username: testUsername,
    email: testEmail,
    password: testPassword,
    role: 'chauffeur',
    nom_complet: 'Test User Complet',
    telephone: '+33612345678'
  };
  const registerResult = await testEndpoint('/auth/register', 'POST', registerData);
  tests.push(registerResult);
  console.log('');
  
  // Test 3: Login avec le nouvel utilisateur
  console.log('3️⃣ Test Login avec nouvel utilisateur');
  const loginData = {
    username: testUsername,
    password: testPassword
  };
  const loginResult = await testEndpoint('/auth/login', 'POST', loginData);
  tests.push(loginResult);
  console.log('');
  
  let authToken = '';
  if (loginResult.success && loginResult.data?.data?.token) {
    authToken = loginResult.data.data.token;
    console.log('🔑 Token d\'authentification récupéré ✅');
  } else {
    console.log('❌ Impossible de récupérer le token d\'authentification');
  }
  
  // Test 4: Get user profile (avec auth)
  console.log('4️⃣ Test Get User Profile');
  tests.push(await testEndpoint('/auth/profile', 'GET', undefined, {
    'Authorization': `Bearer ${authToken}`
  }));
  console.log('');
  
  // Test 5: Verify token
  console.log('5️⃣ Test Verify Token');
  tests.push(await testEndpoint('/auth/verify', 'GET', undefined, {
    'Authorization': `Bearer ${authToken}`
  }));
  console.log('');
  
  // Test 6: Get tous les BL (avec auth)
  console.log('6️⃣ Test Get All BL');
  tests.push(await testEndpoint('/bl', 'GET', undefined, {
    'Authorization': `Bearer ${authToken}`
  }));
  console.log('');
  
  // Test 7: Create nouveau BL
  console.log('7️⃣ Test Create BL');
  const newBL = {
    numero_bl: `BL-TEST-${timestamp}`,
    montant_total: 12500.00,
    nombre_palettes: 4,
    date_preparation: '2024-01-20',
    notes: 'Test BL créé depuis l\'API'
  };
  tests.push(await testEndpoint('/bl', 'POST', newBL, {
    'Authorization': `Bearer ${authToken}`
  }));
  console.log('');
  
  // Test 8: Logout
  console.log('8️⃣ Test Logout');
  tests.push(await testEndpoint('/auth/logout', 'POST', {}, {
    'Authorization': `Bearer ${authToken}`
  }));
  console.log('');
  
  // Résumé des tests
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('==================');
  
  tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`${index + 1}. ${test.method} ${test.endpoint} - ${test.status} ${status}`);
    if (test.error) {
      console.log(`   Erreur: ${test.error}`);
    }
  });
  
  const successCount = tests.filter(t => t.success).length;
  console.log(`\n🎯 ${successCount}/${tests.length} tests réussis`);
  
  if (successCount === tests.length) {
    console.log('🎉 Tous les tests ont réussi ! L\'API backend est entièrement fonctionnelle.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }
};

export default runFullAPITests;