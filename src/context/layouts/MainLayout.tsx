import type React from "react"
import { Outlet } from 'react-router-dom'
import "./globals.css"
import Sidebar from "../../components/sidebar"
import { ThemeProvider } from "../../components/proveedor-temas"
import PageTransition from "../../components/animations/page-transition"

// Nota: Reemplazamos la fuente de Next.js con una importación CSS estándar
// Deberás instalar @fontsource/inter con: npm install @fontsource/inter
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';

const MainLayout: React.FC = () => {
  return (
    <div className="font-sans">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="flex h-screen overflow-hidden">
          <Sidebar /> 
          <main className="flex-1 overflow-y-auto p-6">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div> 
      </ThemeProvider>
    </div>
  )
}

export default MainLayout