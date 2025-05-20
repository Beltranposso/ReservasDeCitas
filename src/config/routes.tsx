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

export const routes: RouteObject[] = [
  {
    path: "/",
    element:<AuthLayaut/>,
    children: [
      { index: true, element:<div className="h-full w-full bg-amber-300 flex justify-center items-center font-sans">Ladingpage</div>},
      { path: "login", element: <Loggin></Loggin> },
      { path: "register", element: <Register></Register> },
      { path: "Plans", element: <PlansPage></PlansPage> },
      { path: "invitacion", element: (
        <AgendacionPage
          anfitrion="Julian Caro Santafe"
          evento="prueba"
          duracion="30 min"
          descripcion="Descripcion"
        />
      ) },
      { path: "*", element: (
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
      )},
    ],
  },
  
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {   index: true, element:<DashboardPage></DashboardPage>  },
      { path: "eventos", element: <EventPage></EventPage> },
      { path: "Metricas", element: <MetricasPagae></MetricasPagae> },
      { path: "Integraciones", element: <Intergations></Intergations>},
      { path: "contactos", element: <Contacs></Contacs>},
    ],
  },
];
 