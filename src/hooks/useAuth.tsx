import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../App';
import { api, AuthResponse } from '../backend/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, nom: string, role: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  // Vérifier l'authentification au chargement
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const profile = await api.getProfile();
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      // Si l'authentification échoue, nettoyer les tokens
      await api.logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Login
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await api.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (
    email: string, 
    password: string, 
    nom: string, 
    role: string
  ): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await api.register(email, password, nom, role as any);
      
      if (response.success && response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook simple pour les composants qui n'ont besoin que de l'état
export function useAuthState() {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isAuthenticated };
}