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

const runAPITests = async (): Promise<void> => {
  console.log('🚀 Test des endpoints API...\n');
  
  const tests: TestResult[] = [];
  
  // Test 1: Health check
  console.log('1️⃣ Test Health Check');
  tests.push(await testEndpoint('/health'));
  console.log('');
  
  // Test 2: Register nouveau utilisateur
  console.log('2️⃣ Test Register');
  const registerData = {
    username: 'testuser',
    email: 'test@aegean.com',
    password: 'password123',
    role: 'chauffeur',
    nom_complet: 'Test User',
    telephone: '+33612345678'
  };
  tests.push(await testEndpoint('/auth/register', 'POST', registerData));
  console.log('');
  
  // Test 3: Login
  console.log('3️⃣ Test Login');
  const loginData = {
    username: 'chauffeur1',
    password: 'password123'
  };
  const loginResult = await testEndpoint('/auth/login', 'POST', loginData);
  tests.push(loginResult);
  console.log('');
  
  let authToken = '';
  if (loginResult.success && loginResult.data?.token) {
    authToken = loginResult.data.token;
    console.log('🔑 Token d\'authentification récupéré');
  }
  
  // Test 4: Get tous les BL (avec auth)
  console.log('4️⃣ Test Get All BL');
  tests.push(await testEndpoint('/bl', 'GET', undefined, {
    'Authorization': `Bearer ${authToken}`
  }));
  console.log('');
  
  // Test 5: Create nouveau BL
  console.log('5️⃣ Test Create BL');
  const newBL = {
    numero_bl: 'BL-TEST-001',
    montant_total: 12500.00,
    nombre_palettes: 4,
    date_preparation: '2024-01-20',
    notes: 'Test BL créé depuis l\'API'
  };
  tests.push(await testEndpoint('/bl', 'POST', newBL, {
    'Authorization': `Bearer ${authToken}`
  }));
  console.log('');
  
  // Test 6: Get user profile
  console.log('6️⃣ Test Get User Profile');
  tests.push(await testEndpoint('/auth/profile', 'GET', undefined, {
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
};

export default runAPITests;