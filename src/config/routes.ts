import { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

// Layouts
/* import MainLayout from '../layouts/MainLayout' */

// Pages generales
/* import LandingPage from '../pages/LandingPage'
import NotFound from '../pages/NotFound' */

// Features
/* import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import CalendarPage from '../features/calendar/pages/CalendarPage'
import BookingPage from '../features/booking/pages/BookingPage' */

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout/>,
    children: [
      { index: true, element: <div>landingpage</div>  },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "booking", element: <BookingPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];
