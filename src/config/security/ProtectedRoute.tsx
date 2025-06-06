// ProtectedRoute.tsx - Adaptado para funcionar con createBrowserRouter
import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole, checkAndRefreshAuth } from './authUtils';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[]; // Roles que pueden acceder a esta ruta
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const userRole = getUserRole();

  // Usamos useEffect para manejar la validación asíncrona
  useEffect(() => {
    const validateAuth = async () => {
      // Primero hacemos una comprobación rápida (sincrónica)
      const initialAuthCheck = isAuthenticated();
      
      // Si la comprobación rápida falla, podríamos estar en un caso donde
      // el token expiró pero tenemos un refresh token válido
      if (!initialAuthCheck) {
        // Intentamos refrescar el token de forma asíncrona
        const refreshedAuth = await checkAndRefreshAuth();
        setIsAuth(refreshedAuth);
      } else {
        setIsAuth(true);
      }
      
      setChecking(false);
    };

    validateAuth();
  }, [location.pathname]);

  // Mientras verificamos, podemos mostrar un loader
  if (checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, redirige al login con la ruta original como estado
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si hay roles requeridos y el usuario no tiene ninguno de ellos
  if (requiredRoles.length > 0 && userRole && !requiredRoles.includes(userRole)) {
    // Redirige al dashboard o a una página de acceso denegado
    return <Navigate to="/dashboard" replace />;
  }

  // Si está autenticado y tiene los permisos necesarios, muestra el contenido
  return <>{children}</>;
};

// PublicRoute.tsx - Componente para rutas públicas (redirige si ya está autenticado)
interface PublicRouteProps {
  children: ReactNode;
  restricted?: boolean; // Si es true, los usuarios autenticados serán redirigidos
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  restricted = false 
}) => {
  const isAuth = isAuthenticated();
  const location = useLocation();
  
  // Si la ruta es restringida y el usuario está autenticado, redirige
  if (restricted && isAuth) {
    // Si hay una ruta anterior guardada en el estado, redirige allí
    const from = location.state?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // De lo contrario, muestra el contenido normalmente
  return <>{children}</>;
};