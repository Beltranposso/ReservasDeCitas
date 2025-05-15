"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { cn } from "../../lib/utils"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  duration?: number
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 20,
  duration = 0.6,
}: FadeInProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const fromVars: gsap.TweenVars = { opacity: 0 }

    // Add direction-based starting position
    if (direction === "up") fromVars.y = distance
    else if (direction === "down") fromVars.y = -distance
    else if (direction === "left") fromVars.x = distance
    else if (direction === "right") fromVars.x = -distance

    gsap.set(element, fromVars)

    gsap.to(element, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: duration,
      delay: delay,
      ease: "power3.out",
    })
  }, [delay, direction, distance, duration])

  return (
    <div ref={elementRef} className={cn(className)}>
      {children}
    </div>
  )
}
