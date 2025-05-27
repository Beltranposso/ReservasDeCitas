// AuthContext.tsx - Adaptado para funcionar con createBrowserRouter
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  isAuthenticated, 
  getUserRole, 
  getUserId,
  setAuthTokens,
  logout as logoutUtil,
  refreshTokenSilently
} from './authUtils';

// Interfaz para el usuario
interface User {
  id: string;
  role: string;
  // Otros datos del usuario que necesites
}

// Interfaz para el contexto
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuth: boolean;
}

// Valor por defecto del contexto
const defaultContext: AuthContextType = {
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  isAuth: false
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

  // Efecto para cargar el usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      
      // Verificar si el usuario está autenticado
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      
      if (authenticated) {
        // Obtenemos datos básicos del usuario desde el token
        const id = getUserId();
        const role = getUserRole();
        
        if (id && role) {
          setUser({ id, role });
          
          // Opcionalmente, cargar datos adicionales del usuario desde la API
          try {
            const response = await fetch(`/api/users/${id}`);
            if (response.ok) {
              const userData = await response.json();
              setUser(prev => ({
                ...prev,
                ...userData
              }));
            }
          } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
          }
        }
        
        // Configurar renovación automática del token
        const tokenCheckInterval = setInterval(() => {
          refreshTokenSilently();
        }, 10 * 60 * 1000); // Cada 10 minutos
        
        return () => clearInterval(tokenCheckInterval);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  // Función de login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }
      
      const { accessToken, refreshToken, user: userData } = await response.json();
      
      // Guardar tokens
      setAuthTokens(accessToken, refreshToken);
      
      // Actualizar estado
      setUser(userData);
      setIsAuth(true);
      
      // Redirigir al dashboard (usando window.location en lugar de useNavigate)
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error de login:', error);
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
    logout,
    isAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;