"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class SupabaseRestClient {
    constructor(config) {
        this.baseUrl = `${config.url}/rest/v1`;
        this.apiKey = config.serviceRoleKey;
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.apiKey}`,
            'Prefer': 'return=representation'
        };
        console.log(`🔧 Supabase Client initialized with URL: ${this.baseUrl}`);
    }
    async select(table, columns = '*', filters = {}) {
        try {
            let url = `${this.baseUrl}/${table}?select=${columns}`;
            Object.entries(filters).forEach(([key, value]) => {
                url += `&${key}=eq.${value}`;
            });
            console.log(`🔍 SELECT URL: ${url}`);
            const response = await (0, node_fetch_1.default)(url, {
                method: 'GET',
                headers: this.headers
            });
            console.log(`📡 SELECT Status: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`❌ Error response: ${errorText}`);
                return {
                    error: {
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        details: errorText
                    }
                };
            }
            const data = await response.json();
            return { data, status: response.status };
        }
        catch (error) {
            console.log(`❌ Network error:`, error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: 'Network or parsing error'
                }
            };
        }
    }
    async insert(table, data) {
        try {
            const url = `${this.baseUrl}/${table}`;
            console.log(`🔍 INSERT URL: ${url}`);
            console.log(`📤 INSERT Data:`, JSON.stringify(data, null, 2));
            const response = await (0, node_fetch_1.default)(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            console.log(`📡 INSERT Status: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`❌ INSERT Error response: ${errorText}`);
                return {
                    error: {
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        details: errorText
                    }
                };
            }
            const responseData = await response.json();
            return { data: responseData, status: response.status };
        }
        catch (error) {
            console.log(`❌ INSERT Network error:`, error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: 'Network or parsing error'
                }
            };
        }
    }
    async update(table, data, filters) {
        try {
            let url = `${this.baseUrl}/${table}`;
            const filterParams = Object.entries(filters)
                .map(([key, value]) => `${key}=eq.${value}`)
                .join('&');
            if (filterParams) {
                url += `?${filterParams}`;
            }
            console.log(`🔍 UPDATE URL: ${url}`);
            const response = await (0, node_fetch_1.default)(url, {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            console.log(`📡 UPDATE Status: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`❌ UPDATE Error response: ${errorText}`);
                return {
                    error: {
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        details: errorText
                    }
                };
            }
            const responseData = await response.json();
            return { data: responseData, status: response.status };
        }
        catch (error) {
            console.log(`❌ UPDATE Network error:`, error);
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: 'Network or parsing error'
                }
            };
        }
    }
    async delete(table, filters) {
        try {
            let url = `${this.baseUrl}/${table}`;
            const filterParams = Object.entries(filters)
                .map(([key, value]) => `${key}=eq.${value}`)
                .join('&');
            if (filterParams) {
                url += `?${filterParams}`;
            }
            const response = await (0, node_fetch_1.default)(url, {
                method: 'DELETE',
                headers: this.headers
            });
            if (!response.ok) {
                const errorText = await response.text();
                return {
                    error: {
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        details: errorText
                    }
                };
            }
            const responseData = await response.json();
            return { data: responseData, status: response.status };
        }
        catch (error) {
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: 'Network or parsing error'
                }
            };
        }
    }
    async rpc(functionName, params = {}) {
        try {
            const url = `${this.baseUrl}/rpc/${functionName}`;
            const response = await (0, node_fetch_1.default)(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(params)
            });
            const data = await response.json();
            if (!response.ok) {
                return {
                    error: {
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        details: JSON.stringify(data)
                    }
                };
            }
            return { data: [data], status: response.status };
        }
        catch (error) {
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: 'Network or parsing error'
                }
            };
        }
    }
    async testConnection() {
        try {
            const url = `${this.baseUrl}/`;
            const response = await (0, node_fetch_1.default)(url, {
                method: 'GET',
                headers: {
                    'apikey': this.apiKey,
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            console.log(`🔍 Test URL: ${url}`);
            console.log(`📡 Status: ${response.status} ${response.statusText}`);
            if (response.status === 200) {
                return {
                    success: true,
                    message: 'Connexion Supabase REST réussie!'
                };
            }
            else {
                const errorText = await response.text();
                return {
                    success: false,
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    details: errorText
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: `Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: error
            };
        }
    }
}
let supabaseInstance = null;
const getSupabaseClient = () => {
    if (!supabaseInstance) {
        const url = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_KEY;
        if (!url || !serviceKey) {
            console.error('❌ Variables SUPABASE_URL ou SUPABASE_SERVICE_KEY manquantes');
            console.log('SUPABASE_URL:', url ? '✅ présent' : '❌ manquant');
            console.log('SUPABASE_SERVICE_KEY:', serviceKey ? '✅ présent' : '❌ manquant');
            throw new Error('Configuration Supabase incomplète');
        }
        supabaseInstance = new SupabaseRestClient({
            url,
            serviceRoleKey: serviceKey
        });
    }
    return supabaseInstance;
};
exports.getSupabaseClient = getSupabaseClient;
exports.default = SupabaseRestClient;
//# sourceMappingURL=supabaseRest.js.map