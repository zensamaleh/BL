import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Charger les variables d'environnement au début
dotenv.config();

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

interface SupabaseResponse<T = any> {
  data?: T[];
  error?: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  count?: number;
  status?: number;
  statusText?: string;
}

class SupabaseRestClient {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(config: SupabaseConfig) {
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

  async select<T = any>(
    table: string,
    columns = '*',
    filters: Record<string, any> = {}
  ): Promise<SupabaseResponse<T>> {
    try {
      let url = `${this.baseUrl}/${table}?select=${columns}`;
      
      // Ajouter les filtres
      Object.entries(filters).forEach(([key, value]) => {
        url += `&${key}=eq.${value}`;
      });

      console.log(`🔍 SELECT URL: ${url}`);

      const response = await fetch(url, {
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

      const data = await response.json() as T[];
      return { data, status: response.status };
    } catch (error) {
      console.log(`❌ Network error:`, error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: 'Network or parsing error'
        }
      };
    }
  }

  async insert<T = any>(
    table: string,
    data: Record<string, any> | Record<string, any>[]
  ): Promise<SupabaseResponse<T>> {
    try {
      const url = `${this.baseUrl}/${table}`;
      
      console.log(`🔍 INSERT URL: ${url}`);
      console.log(`📤 INSERT Data:`, JSON.stringify(data, null, 2));
      
      const response = await fetch(url, {
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

      const responseData = await response.json() as T[];
      return { data: responseData, status: response.status };
    } catch (error) {
      console.log(`❌ INSERT Network error:`, error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: 'Network or parsing error'
        }
      };
    }
  }

  async update<T = any>(
    table: string,
    data: Record<string, any>,
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    try {
      let url = `${this.baseUrl}/${table}`;
      
      // Ajouter les filtres
      const filterParams = Object.entries(filters)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join('&');
      
      if (filterParams) {
        url += `?${filterParams}`;
      }

      console.log(`🔍 UPDATE URL: ${url}`);

      const response = await fetch(url, {
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

      const responseData = await response.json() as T[];
      return { data: responseData, status: response.status };
    } catch (error) {
      console.log(`❌ UPDATE Network error:`, error);
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: 'Network or parsing error'
        }
      };
    }
  }

  async delete<T = any>(
    table: string,
    filters: Record<string, any>
  ): Promise<SupabaseResponse<T>> {
    try {
      let url = `${this.baseUrl}/${table}`;
      
      // Ajouter les filtres
      const filterParams = Object.entries(filters)
        .map(([key, value]) => `${key}=eq.${value}`)
        .join('&');
      
      if (filterParams) {
        url += `?${filterParams}`;
      }

      const response = await fetch(url, {
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

      const responseData = await response.json() as T[];
      return { data: responseData, status: response.status };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: 'Network or parsing error'
        }
      };
    }
  }

  async rpc<T = any>(
    functionName: string,
    params: Record<string, any> = {}
  ): Promise<SupabaseResponse<T>> {
    try {
      const url = `${this.baseUrl}/rpc/${functionName}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params)
      });

      const data = await response.json() as T;
      
      if (!response.ok) {
        return {
          error: {
            message: `HTTP ${response.status}: ${response.statusText}`,
            details: JSON.stringify(data)
          }
        };
      }

      return { data: [data] as T[], status: response.status };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: 'Network or parsing error'
        }
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Test plus simple d'abord - juste lister les tables
      const url = `${this.baseUrl}/`;
      
      const response = await fetch(url, {
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
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      };
    }
  }
}

// Singleton instance
let supabaseInstance: SupabaseRestClient | null = null;

export const getSupabaseClient = (): SupabaseRestClient => {
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

export default SupabaseRestClient;