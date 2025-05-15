import { Link, useLocation } from "react-router-dom"
import { Calendar, Users, BarChart3, Settings, PlusCircle, Link2, LogOut } from "lucide-react"

import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
/* import { ThemeToggle } from "@/components/theme-toggle" */

export default function Sidebar() {
  const location = useLocation()

  const routes = [
    {
      to: "/dashboard",
      icon: Calendar,
      title: "Dashboard",
    },
    {
      to: "eventos",
      icon: Calendar,
      title: "Eventos",
    },
    {
      to: "contactos",
      icon: Users,
      title: "Contactos",
    },
    {
      to: "Integraciones",
      icon: Link2,
      title: "Integraciones",
    },
    {
      to: "Metricas",
      icon: BarChart3,
      title: "Métricas",
    },
    {
      to: "/settings",
      icon: Settings,
      title: "Configuración",
    },
  ]


  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Calendar className="h-6 w-6 text-pastel-pink" />
          <span className="text-xl">Programaro</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.to}
              to={route.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium  hover:bg-blue-200 transition-all hover:text-accent-foreground ",
                location.pathname.replace('/dashboard/', '') === route.to ? "bg-blue-200 text-accent-foreground" : "transparent",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
       {/*    <span className="text-sm font-medium">Cambiar tema</span> */}
       {/*    <ThemeToggle /> */}
        </div>
        <Button className="w-full justify-start gap-2 bg-pastel-pink text-acent-foreground hover:bg-pastel-pink/90">
          <PlusCircle className="h-4 w-4" />
          Crear Evento
        </Button>
        <Button variant="outline" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
