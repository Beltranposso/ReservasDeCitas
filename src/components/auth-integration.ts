// src/features/auth/index.ts
// Exportaciones principales del módulo de autenticación

// Contexto y hooks
export { AuthProvider, useAuth } from './context/AuthContext';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { AuthGuard } from './components/AuthGuard';
export { useCurrentUser } from './hooks/useCurrentUser';
export { usePlanSubscription } from './hooks/usePlanSubscription';

// Componentes de páginas
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';
export { default as PlansPage } from './pages/PlansPage';
export { default as ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { default as ResetPasswordPage } from './pages/ResetPasswordPage';
export { default as RegisterSuccessPage } from './pages/RegisterSuccessPage';

// Componentes utilitarios
export { UserRoleSelection } from './components/UserRoleSelection';
export { InviteUserForm } from './components/InviteUserForm';
export { RoleManager } from './components/RoleManager';

// Servicio de autenticación
export { authService } from './authService';
export type { User, Organization, AuthResponse, LoginCredentials, RegisterData } from './authService';

// src/features/auth/routes.ts
import { RouteObject } from 'react-router-dom';
import AuthLayout from '../../context/layouts/AuthLayout';

// Importar páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlansPage from './pages/PlansPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RegisterSuccessPage from './pages/RegisterSuccessPage';

// Definir rutas de autenticación
export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "plans", element: <PlansPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "register/success", element: <RegisterSuccessPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
    ],
  },
];

// src/App.tsx
// Ejemplo de integración del sistema de autenticación en la aplicación principal

import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import AppRouter from './context/router/AppRouter';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/proveedor-temas';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <AppRouter />
          <Toaster position="top-right" />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

// src/context/router/AppRouter.tsx
// Ejemplo de implementación del enrutador principal con rutas protegidas

import { useRoutes } from 'react-router-dom';
import { AuthGuard } from '../../features/auth';
import { routes } from '../../config/routes';

// El AppRouter utiliza las rutas definidas en la configuración
// y aplica la protección de autenticación según sea necesario
export default function AppRouter() {
  const element = useRoutes(routes);
  
  return element;
}

// Ejemplo de cómo utilizar la protección de rutas en la configuración
/*
// En config/routes.ts
import { ProtectedRoute } from '../features/auth';

export const routes = [
  // Rutas públicas
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      // ... otras rutas públicas
    ]
  },
  
  // Rutas protegidas
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <DashboardPage /> },
      // Ruta que requiere un rol específico
      { 
        path: "admin", 
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        ) 
      },
      // ... otras rutas protegidas
    ]
  }
];
*/

// src/components/proveedor-temas.tsx
// Incluido como referencia para mostrar la integración con el tema oscuro/claro

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      
      root.classList.add(systemTheme);
      return;
    }
    
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
    
  return context;
};
