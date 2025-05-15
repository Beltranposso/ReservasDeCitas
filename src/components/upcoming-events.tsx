"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Calendar, Clock, Video } from "lucide-react"
import { StaggerContainer } from "../components/animations/stagger-container"
import { AnimatedCard } from "../components/animations/animated-card"

export default function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "Reunión de Planificación",
      date: "12 Mayo, 2025",
      time: "10:00 - 11:00",
      attendees: [
        { name: "Juan Pérez", email: "juan@example.com", avatar: "/placeholder-user.jpg" },
        { name: "María López", email: "maria@example.com", avatar: "/placeholder-user.jpg" },
      ],
      platform: "Google Meet",
      status: "confirmed",
    },
    {
      id: 2,
      title: "Entrevista con Cliente",
      date: "12 Mayo, 2025",
      time: "14:00 - 15:00",
      attendees: [{ name: "Carlos Rodríguez", email: "carlos@example.com", avatar: "/placeholder-user.jpg" }],
      platform: "Zoom",
      status: "pending",
    },
    {
      id: 3,
      title: "Sesión de Feedback",
      date: "13 Mayo, 2025",
      time: "11:00 - 12:00",
      attendees: [
        { name: "Ana Martínez", email: "ana@example.com", avatar: "/placeholder-user.jpg" },
        { name: "Pedro Sánchez", email: "pedro@example.com", avatar: "/placeholder-user.jpg" },
        { name: "Laura Gómez", email: "laura@example.com", avatar: "/placeholder-user.jpg" },
      ],
      platform: "Google Meet",
      status: "confirmed",
    },
  ]

  return (
    <StaggerContainer className="space-y-4">
      {events.map((event, index) => (
        <AnimatedCard key={event.id} index={index}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {event.date}
                    <Clock className="h-3.5 w-3.5 ml-2" />
                    {event.time}
                  </CardDescription>
                </div>
                <Badge
                  variant={event.status === "confirmed" ? "default" : "outline"}
                  className={event.status === "confirmed" ? "bg-pastel-mint text-accent-foreground" : ""}
                >
                  {event.status === "confirmed" ? "Confirmado" : "Pendiente"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{event.platform}</span>
                  <div className="flex -space-x-2 ml-4">
                    {event.attendees.map((attendee, i) => (
                      <Avatar key={i} className="border-2 border-background h-8 w-8">
                        <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {event.attendees.length > 3 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                        +{event.attendees.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                  >
                    Unirse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      ))}
    </StaggerContainer>
  )
}
