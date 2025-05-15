import { useEffect, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/lib/theme-provider" 
import { gsap } from "gsap"

import { Button } from "../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const sunIconRef = useRef<SVGSVGElement>(null)
  const moonIconRef = useRef<SVGSVGElement>(null)

  // Animate theme change
  useEffect(() => {
    if (!sunIconRef.current || !moonIconRef.current) return

    const isDark = theme === "dark"

    gsap.to(sunIconRef.current, {
      rotate: isDark ? -90 : 0,
      scale: isDark ? 0 : 1,
      opacity: isDark ? 0 : 1,
      duration: 0.5,
      ease: "power2.inOut",
    })

    gsap.to(moonIconRef.current, {
      rotate: isDark ? 0 : 90,
      scale: isDark ? 1 : 0,
      opacity: isDark ? 1 : 0,
      duration: 0.5,
      ease: "power2.inOut",
    })

    // Button animation
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button ref={buttonRef} variant="outline" size="icon" className="h-9 w-9 relative">
          <Sun
            ref={sunIconRef}
            className="h-[1.2rem] w-[1.2rem] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
          <Moon
            ref={moonIconRef}
            className="h-[1.2rem] w-[1.2rem] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
      {/*     <span className="sr-only">Cambiar tema</span> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <span className="mr-2">💻</span>
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Luego se usa theme y setTheme sin estar definidos
