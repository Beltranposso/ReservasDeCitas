"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { cn } from "../../lib/utils"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  index?: number
}

export function AnimatedCard({ children, className, delay = 0, index = 0 }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    gsap.set(card, {
      y: 20,
      opacity: 0,
    })

    gsap.to(card, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
      delay: delay || index * 0.1,
    })

    // Hover animation
    const enterAnimation = (e: MouseEvent) => {
      gsap.to(card, {
        y: -5,
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out",
      })
    }

    const leaveAnimation = (e: MouseEvent) => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out",
      })
    }

    card.addEventListener("mouseenter", enterAnimation)
    card.addEventListener("mouseleave", leaveAnimation)

    return () => {
      card.removeEventListener("mouseenter", enterAnimation)
      card.removeEventListener("mouseleave", leaveAnimation)
    }
  }, [delay, index])

  return (
    <div ref={cardRef} className={cn("transition-shadow", className)}>
      {children}
    </div>
  )
}
