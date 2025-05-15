import { createContext, useContext, useEffect, useState } from 'react'
import { gsap } from "gsap"

type Theme = 'light' | 'dark' | 'system'
type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: Theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey)
    return (storedTheme as Theme) || defaultTheme
  })
  
  // Determinar el tema resuelto (para compatibilidad con theme-toggle)
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(theme)
  
  useEffect(() => {
    // Resolver el tema del sistema si es necesario
    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setResolvedTheme(systemTheme)
      
      // Observar cambios en la preferencia del sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      setResolvedTheme(theme)
    }
  }, [theme, enableSystem])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark', 'system')
    
    if (attribute === 'class') {
      root.classList.add(theme)
    } else {
      root.setAttribute(attribute, theme)
    }
    
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey, attribute])

  useEffect(() => {
    // Función para manejar cambios de tema
    const handleThemeChange = () => {
      if (disableTransitionOnChange) return;
      
      // Crear una animación de flash suave para toda la página
      gsap.to("body", {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        duration: 0.1,
        onComplete: () => {
          gsap.to("body", {
            backgroundColor: "transparent",
            duration: 0.3,
          })
        },
      })

      // Animar todos los elementos con clase card para un efecto sutil
      gsap.fromTo(
        ".card, button, .badge",
        { scale: 0.98, opacity: 0.8 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.02, ease: "power2.out" },
      )
    }

    // Observar cambios en el atributo class del html para detectar cambios de tema
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === attribute) {
          handleThemeChange()
        }
      })
    })

    // Iniciar observación
    observer.observe(document.documentElement, { attributes: true })

    // Limpiar observador al desmontar
    return () => observer.disconnect()
  }, [attribute, disableTransitionOnChange])

  const value = {
    theme,
    setTheme: (theme: Theme) => setTheme(theme),
    resolvedTheme,
  }

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
