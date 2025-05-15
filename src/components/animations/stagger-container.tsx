"use client"

import type React from "react"

import { useRef, useEffect, Children } from "react"
import { gsap } from "gsap"
import { cn } from "../../lib/utils"

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0,
  direction = "up",
  distance = 20,
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const childrenArray = Children.toArray(children)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const childElements = container.children

    const fromVars: gsap.TweenVars = { opacity: 0 }

    // Add direction-based starting position
    if (direction === "up") fromVars.y = distance
    else if (direction === "down") fromVars.y = -distance
    else if (direction === "left") fromVars.x = distance
    else if (direction === "right") fromVars.x = -distance

    gsap.set(childElements, fromVars)

    gsap.to(childElements, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.6,
      stagger: staggerDelay,
      delay: initialDelay,
      ease: "power3.out",
    })
  }, [childrenArray.length, staggerDelay, initialDelay, direction, distance])

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  )
}
