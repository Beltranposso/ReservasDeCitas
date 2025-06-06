import type { RouteObject } from "react-router-dom";
/* import { Navigate } from "react-router-dom"; */

// Layouts
import AuthLayaut from "../context/layouts/AuthLayout";
import DashboardLayout from "../context/layouts/MainLayout";
// Pages generales
/* import LandingPage from '../pages/LandingPage'
import NotFound from '../pages/NotFound' */
import Loggin from "../Feactures/auth/pages/loginPage";
import Register from "../Feactures/auth/pages/RegisterPage";
import PlansPage from "../Feactures/auth/pages/PlansPage";
// Features
import MetricasPagae from '../Feactures/Dashboard/metircas/metricas.page'
import DashboardPage from "../Feactures/Dashboard/main/Dasboard.page";
import EventPage from "../Feactures/Dashboard/events/Events.page";
import Contacs from "../Feactures/Dashboard/contacts/Contacts.page";
import Intergations from "../Feactures/Dashboard/integrations/integrations.page";
import AgendacionPage from "../Feactures/Agendacion/AgendacionPage";

// Importar los componentes de protección de rutas
import { ProtectedRoute, PublicRoute } from "./security/ProtectedRoute";

export const routes: RouteObject[] = [
  {
    path: "/",
    element:<AuthLayaut/>,
    children: [
      { index: true, element: <PublicRoute><div className="h-full w-full bg-amber-300 flex justify-center items-center font-sans">Ladingpage</div></PublicRoute> },
      { path: "login", element: <PublicRoute restricted={true}><Loggin></Loggin></PublicRoute> },
      { path: "register", element: <PublicRoute restricted={true}><Register></Register></PublicRoute> },
      { path: "Plans", element: <PublicRoute><PlansPage></PlansPage></PublicRoute> },
      { path: "invitacion", element: (
        <PublicRoute>
          <AgendacionPage
            anfitrion="Julian Caro Santafe"
            evento="prueba"
            duracion="30 min"
            descripcion="Descripcion"
          />
        </PublicRoute>
      ) },
      { path: "*", element: (
        <PublicRoute>
          <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center mb-6">
              <span className="material-icons text-blue-500 text-4xl mr-3">Programaro</span>
              <span className="material-icons text-blue-500 text-4xl">Team</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Estamos en producción</h1>
            <div className="w-16 h-1 bg-blue-500 rounded mb-8"></div>
            <p className="text-gray-600 text-lg mb-8">Volvemos pronto con nuevas funcionalidades</p>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </PublicRoute>
      )},
    ],
  },
  
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <ProtectedRoute><DashboardPage></DashboardPage></ProtectedRoute> },
      { path: "eventos", element: <ProtectedRoute><EventPage></EventPage></ProtectedRoute> },
      { path: "Metricas", element: <ProtectedRoute requiredRoles={["admin"]}><MetricasPagae></MetricasPagae></ProtectedRoute> },
      { path: "Integraciones", element: <ProtectedRoute><Intergations></Intergations></ProtectedRoute> },
      { path: "contactos", element: <ProtectedRoute><Contacs></Contacs></ProtectedRoute> },
    ],
  },
];
 