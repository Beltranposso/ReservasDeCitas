// src/features/auth/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, Organization } from '../authService';

// Definir la interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Componente Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        const currentOrg = authService.getCurrentOrganization();
        
        if (currentUser) {
          setUser(currentUser);
          setOrganization(currentOrg);
        }
      } catch (error) {
        console.error('Error al inicializar la autenticación:', error);
        // Si hay un error, limpiar los datos de autenticación
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      setOrganization(response.organization);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para registrar usuario
  const register = async (formData: any) => {
    setIsLoading(true);
    try {
      const response = await authService.register(formData);
      setUser(response.user);
      setOrganization(response.organization);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    authService.logout();
    setUser(null);
    setOrganization(null);
  };

  // Función para actualizar datos del usuario
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('calendly_clone_user', JSON.stringify(updatedUser));
    }
  };

  // Valor del contexto
  const value = {
    user,
    organization,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// src/features/auth/components/AuthGuard.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles permitidos, verificar si el usuario tiene el rol necesario
  if (allowedRoles && allowedRoles.length > 0 && user) {
    if (!allowedRoles.includes(user.role)) {
      // Redirigir a una página de acceso denegado o al dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si todo está bien, renderizar los hijos
  return <>{children}</>;
};

// src/features/auth/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar indicador de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pastel-blue"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Verificar rol si se especifica
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!roles.includes(user.role)) {
      // Redirigir si no tiene el rol requerido
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// src/features/auth/hooks/useCurrentUser.ts
import { useAuth } from '../context/AuthContext';

export function useCurrentUser() {
  const { user, organization, updateUser } = useAuth();
  
  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';
  
  // Verificar si el usuario es propietario de la organización
  const isOwner = organization && user ? organization.ownerId === user.id : false;
  
  // Verificar si el usuario tiene un rol específico
  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };
  
  // Formatear el nombre completo del usuario
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  
  // Obtener iniciales del usuario para avatar
  const initials = user ? 
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
  
  return {
    user,
    organization,
    isAdmin,
    isOwner,
    hasRole,
    fullName,
    initials,
    updateUser,
  };
}

// src/features/auth/hooks/usePlanSubscription.ts
import { useAuth } from '../context/AuthContext';

interface PlanFeature {
  key: string;
  name: string;
  description: string;
  included: boolean;
}

interface PlanDetails {
  name: string;
  features: PlanFeature[];
  maxUsers: number;
  maxEvents: number | null; // null significa ilimitado
  price: number;
}

const planDetailsMap: Record<string, PlanDetails> = {
  'starter': {
    name: 'Starter',
    price: 49900,
    maxUsers: 1,
    maxEvents: 5,
    features: [
      { key: 'calendar_integration', name: 'Integración con Google Calendar', description: 'Sincronizar eventos con Google Calendar', included: true },
      { key: 'email_reminders', name: 'Recordatorios por email', description: 'Envío automático de recordatorios', included: true },
      { key: 'custom_booking_page', name: 'Página de reserva personalizable', description: 'Personalizar la apariencia de la página de reserva', included: true },
      { key: 'advanced_integrations', name: 'Integraciones avanzadas', description: 'Conectar con servicios externos', included: false },
      { key: 'team_scheduling', name: 'Programación en equipo', description: 'Gestionar disponibilidad de múltiples usuarios', included: false },
    ],
  },
  'professional': {
    name: 'Professional',
    price: 99900,
    maxUsers: 5,
    maxEvents: null,
    features: [
      { key: 'calendar_integration', name: 'Integración con todos los calendarios', description: 'Google, Outlook, Apple y más', included: true },
      { key: 'email_reminders', name: 'Recordatorios personalizados', description: 'Plantillas y programación personalizada', included: true },
      { key: 'custom_booking_page', name: 'Página de reserva personalizable', description: 'Personalización completa de la página', included: true },
      { key: 'advanced_integrations', name: 'Integraciones avanzadas', description: 'API, webhooks y más', included: true },
      { key: 'team_scheduling', name: 'Programación en equipo', description: 'Gestión completa de equipos', included: true },
      { key: 'analytics', name: 'Análisis de uso', description: 'Métricas y reportes avanzados', included: false },
    ],
  },
  'business': {
    name: 'Business',
    price: 199900,
    maxUsers: 15,
    maxEvents: null,
    features: [
      { key: 'calendar_integration', name: 'Integración con todos los calendarios', description: 'Google, Outlook, Apple y más', included: true },
      { key: 'email_reminders', name: 'Recordatorios personalizados', description: 'Plantillas y programación personalizada', included: true },
      { key: 'custom_booking_page', name: 'Marca personalizada', description: 'Personalización completa de marca', included: true },
      { key: 'advanced_integrations', name: 'Integraciones completas', description: 'API, webhooks, CRM y más', included: true },
      { key: 'team_scheduling', name: 'Programación en equipo avanzada', description: 'Gestión completa de equipos y departamentos', included: true },
      { key: 'analytics', name: 'Análisis avanzados', description: 'Métricas, reportes y exportación', included: true },
      { key: 'custom_api', name: 'API personalizada', description: 'Acceso a API personalizada', included: true },
    ],
  },
  'enterprise': {
    name: 'Enterprise',
    price: 399900,
    maxUsers: null, // ilimitado
    maxEvents: null, // ilimitado
    features: [
      { key: 'calendar_integration', name: 'Integración con todos los calendarios', description: 'Google, Outlook, Apple y más', included: true },
      { key: 'email_reminders', name: 'Recordatorios multi-canal', description: 'Email, SMS, notificaciones push', included: true },
      { key: 'custom_booking_page', name: 'Marca completamente personalizada', description: 'Personalización total y dominio propio', included: true },
      { key: 'advanced_integrations', name: 'Todas las integraciones', description: 'Acceso a todas las integraciones disponibles', included: true },
      { key: 'team_scheduling', name: 'Programación en equipo empresarial', description: 'Gestión completa de organización', included: true },
      { key: 'analytics', name: 'Análisis avanzados y reportes', description: 'Análisis completo con exportación', included: true },
      { key: 'custom_api', name: 'API personalizada & SSO', description: 'API dedicada y autenticación SSO', included: true },
      { key: 'dedicated_support', name: 'Soporte premium 24/7', description: 'Soporte prioritario con gestor dedicado', included: true },
    ],
  },
};

export function usePlanSubscription() {
  const { organization } = useAuth();
  
  const currentPlan = organization ? organization.plan : null;
  const planDetails = currentPlan ? planDetailsMap[currentPlan] : null;
  
  // Verificar si una característica está incluida en el plan actual
  const hasFeature = (featureKey: string): boolean => {
    if (!planDetails) return false;
    
    const feature = planDetails.features.find(f => f.key === featureKey);
    return feature ? feature.included : false;
  };
  
  // Verificar si puede añadir más usuarios
  const canAddUsers = (currentUserCount: number): boolean => {
    if (!planDetails) return false;
    if (planDetails.maxUsers === null) return true; // ilimitado
    
    return currentUserCount < planDetails.maxUsers;
  };
  
  // Verificar si puede crear más eventos
  const canCreateMoreEvents = (currentEventCount: number): boolean => {
    if (!planDetails) return false;
    if (planDetails.maxEvents === null) return true; // ilimitado
    
    return currentEventCount < planDetails.maxEvents;
  };
  
  // Obtener detalles de los límites del plan
  const getPlanLimits = () => {
    if (!planDetails) return { users: 0, events: 0 };
    
    return {
      users: planDetails.maxUsers === null ? 'Ilimitados' : planDetails.maxUsers,
      events: planDetails.maxEvents === null ? 'Ilimitados' : planDetails.maxEvents,
    };
  };
  
  // Formatea el precio del plan
  const formatPrice = (price: number | undefined) => {
    if (!price) return '';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return {
    currentPlan,
    planDetails,
    hasFeature,
    canAddUsers,
    canCreateMoreEvents,
    getPlanLimits,
    formatPrice,
  };
}
