import { User, UserRole } from '../App';

// Types pour l'API
export interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface BonLivraison {
  id: string;
  numero_commande: string;
  montant_total: number;
  date_preparation: string;
  date_reception?: string;
  date_saisie?: string;
  statut: 'preparation' | 'reception' | 'saisie' | 'valide';
  chauffeur_nom?: string;
  agent_nom?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BLResponse {
  success: boolean;
  data?: BonLivraison[];
  bl?: BonLivraison;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalBL: number;
  pendingReception: number;
  pendingSaisie: number;
  completed: number;
  monthlyTotal: number;
}

// Configuration de l'API
const API_BASE_URL = 'http://localhost:3001/api';

// Gestion des tokens
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'aegean_access_token';
  private static REFRESH_TOKEN_KEY = 'aegean_refresh_token';
  
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }
  
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }
  
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
  
  static getAuthHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Classe principale de l'API
class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Si l'access token a expiré, essayer de le rafraîchir
      if (response.status === 401 && TokenManager.getRefreshToken()) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Réessayer la requête avec le nouveau token
          config.headers = {
            ...config.headers,
            ...TokenManager.getAuthHeaders(),
          };
          const retryResponse = await fetch(url, config);
          if (!retryResponse.ok) {
            throw new Error(`API Error: ${retryResponse.status}`);
          }
          return await retryResponse.json();
        }
      }
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentification
  async login(email: string, password: string): Promise<AuthResponse> {
    // Note: The form uses "name" but the API expects "username". We map it here.
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    });
    
    if (response.success && response.accessToken && response.refreshToken) {
      TokenManager.setAccessToken(response.accessToken);
      TokenManager.setRefreshToken(response.refreshToken);
    }
    
    return response;
  }

  async register(
    email: string,
    password: string,
    nom: string,
    role: UserRole
  ): Promise<AuthResponse> {
    return await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nom, role }),
    });
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await this.request<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.accessToken) {
        TokenManager.setAccessToken(response.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const response = await this.request<{ user: User }>('/auth/profile');
      return response.user;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignore les erreurs de logout côté serveur
    } finally {
      TokenManager.clearTokens();
    }
  }

  // Gestion des Bons de Livraison
  async getBonLivraisons(
    page: number = 1,
    limit: number = 10,
    statut?: string
  ): Promise<BLResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (statut) {
      params.append('statut', statut);
    }
    
    return await this.request<BLResponse>(`/bl?${params}`);
  }

  async getBonLivraisonById(id: string): Promise<BLResponse> {
    return await this.request<BLResponse>(`/bl/${id}`);
  }

  async createBonLivraison(data: {
    numero_commande: string;
    montant_total: number;
    date_preparation: string;
    chauffeur_nom?: string;
    notes?: string;
  }): Promise<BLResponse> {
    return await this.request<BLResponse>('/bl', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBonLivraison(
    id: string,
    data: Partial<BonLivraison>
  ): Promise<BLResponse> {
    return await this.request<BLResponse>(`/bl/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBonLivraison(id: string): Promise<BLResponse> {
    return await this.request<BLResponse>(`/bl/${id}`, {
      method: 'DELETE',
    });
  }

  // Validation des BL (pour chauffeurs et agents)
  async validerReception(id: string, notes?: string): Promise<BLResponse> {
    return await this.updateBonLivraison(id, {
      statut: 'reception',
      date_reception: new Date().toISOString().split('T')[0],
      notes,
    });
  }

  async validerSaisie(id: string, notes?: string): Promise<BLResponse> {
    return await this.updateBonLivraison(id, {
      statut: 'saisie',
      date_saisie: new Date().toISOString().split('T')[0],
      notes,
    });
  }

  async finaliserBL(id: string): Promise<BLResponse> {
    return await this.updateBonLivraison(id, {
      statut: 'valide',
    });
  }

  // Statistiques du dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return await this.request<DashboardStats>('/bl/stats');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return await this.request('/health');
  }
}

// Instance singleton de l'API
export const api = new APIService();

// Export des types et utilitaires
export { TokenManager, APIService };