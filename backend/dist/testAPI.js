"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const API_BASE_URL = 'http://localhost:3001/api';
const testEndpoint = async (endpoint, method = 'GET', body, headers = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const options = {
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
        const response = await (0, node_fetch_1.default)(url, options);
        const data = await response.json();
        const result = {
            endpoint,
            method,
            status: response.status,
            success: response.ok,
            data: response.ok ? data : undefined,
            error: !response.ok ? JSON.stringify(data) : undefined
        };
        console.log(`📡 ${response.status} ${response.statusText}${response.ok ? ' ✅' : ' ❌'}`);
        return result;
    }
    catch (error) {
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
const runAPITests = async () => {
    console.log('🚀 Test des endpoints API...\n');
    const tests = [];
    console.log('1️⃣ Test Health Check');
    tests.push(await testEndpoint('/health'));
    console.log('');
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
    console.log('4️⃣ Test Get All BL');
    tests.push(await testEndpoint('/bl', 'GET', undefined, {
        'Authorization': `Bearer ${authToken}`
    }));
    console.log('');
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
    console.log('6️⃣ Test Get User Profile');
    tests.push(await testEndpoint('/auth/profile', 'GET', undefined, {
        'Authorization': `Bearer ${authToken}`
    }));
    console.log('');
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
exports.default = runAPITests;
//# sourceMappingURL=testAPI.js.map