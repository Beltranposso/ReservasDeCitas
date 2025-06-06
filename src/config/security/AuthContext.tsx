// AuthContext.tsx - Actualizado para usar authUtils integrado
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  isAuthenticated, 
  getUserRole, 
  getUserId,
  login as loginUtil,
  logout as logoutUtil,
  refreshTokenSilently,
  getProfile,
  register as registerUtil,
  type LoginCredentials,
  type RegisterData,
  type UserProfile
} from './authUtils'; // Ajusta la ruta según tu estructura

// Interfaz para el usuario (usando la del authUtils)
interface User extends UserProfile {
  role?: string; // Agregamos role para compatibilidad
}

// Interfaz para el contexto
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuth: boolean;
  refreshUserProfile: () => Promise<void>;
}

// Valor por defecto del contexto
const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuth: false,
  refreshUserProfile: async () => {}
};

// Crear el contexto
const AuthContext = createContext<AuthContextType>(defaultContext);

// Custom hook para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  // Función para cargar el perfil del usuario
  const loadUserProfile = async () => {
    try {
      const profile = await getProfile();
      const role = getUserRole();
      
      const userData: User = {
        ...profile,
        role: role || undefined
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error al cargar el perfil del usuario:', error);
      // Si hay error al cargar el perfil, pero tenemos datos básicos del token
      const id = getUserId();
      const role = getUserRole();
      
      if (id && role) {
        const basicUser: User = {
          id: parseInt(id),
          name: '',
          email: '',
          timezone: '',
          is_active: true,
          role
        };
        setUser(basicUser);
        return basicUser;
      }
      
      throw error;
    }
  };

  // Función para refrescar el perfil del usuario
  const refreshUserProfile = async () => {
    if (isAuthenticated()) {
      try {
        await loadUserProfile();
      } catch (error) {
        console.error('Error al refrescar el perfil:', error);
      }
    }
  };

  // Efecto para cargar el usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      
      try {
        // Verificar si el usuario está autenticado
        const authenticated = isAuthenticated();
        setIsAuth(authenticated);
        
        if (authenticated) {
          await loadUserProfile();
          
          // Configurar renovación automática del token
          const tokenCheckInterval = setInterval(() => {
            refreshTokenSilently();
          }, 10 * 60 * 1000); // Cada 10 minutos
          
          return () => clearInterval(tokenCheckInterval);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        setIsAuth(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Función de login
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    
    try {
      const response = await loginUtil(credentials);
      
      if (response.success) {
        // Cargar el perfil completo del usuario
        await loadUserProfile();
        setIsAuth(true);
        
        // Redirigir al dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error('Login falló');
      }
    } catch (error: any) {
      console.error('Error de login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de registro
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    
    try {
      const response = await registerUtil(userData);
      
      if (response.success) {
        // Cargar el perfil completo del usuario
        await loadUserProfile();
        setIsAuth(true);
        
        // Redirigir al dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error('Registro falló');
      }
    } catch (error: any) {
      console.error('Error de registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    logoutUtil(); // Esta función ya maneja la redirección
    setUser(null);
    setIsAuth(false);
  };

  // Valor del contexto
  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuth,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;