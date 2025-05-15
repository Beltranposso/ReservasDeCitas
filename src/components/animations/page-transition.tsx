import type React from "react"

import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { gsap } from "gsap"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Page enter animation
      gsap.fromTo(
        pageRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
      )
    })

    return () => ctx.revert()
  }, [location.pathname])

  return (
    <div ref={pageRef} className="w-full">
      {children}
    </div>
  )
}
