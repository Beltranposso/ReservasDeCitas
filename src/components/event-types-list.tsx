"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  Clock,
  Link,
  MoreHorizontal,
  Users,
  Calendar,
  Info,
  Video,
  X,
  BarChart,
  Download,
  Edit,
  Copy,
  Share2,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { StaggerContainer } from "../components/animations/stagger-container"
import { AnimatedCard } from "../components/animations/animated-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { FadeIn } from "../components/animations/fade-in"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {toast} from "sonner"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"
import CreateEventForm from "../Feactures/events/components/create-event-form"

export default function EventTypesList() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("info")
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)

  const openNewEventDialog = () => {
    setShowNewEventDialog(true)
  }

  const closeNewEventDialog = () => {
    setShowNewEventDialog(false)
  }

  const openEventDetails = (id: number) => {
    setSelectedEventId(id)
    setActiveTab("info")
    setIsEditMode(false)

    // Simular carga de gráfico después de abrir el modal
    setTimeout(() => {
      if (chartRef.current) {
        renderChart(chartRef.current)
      }
    }, 300)
  }

  const closeEventDetails = () => {
    setSelectedEventId(null)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)

    if (isEditMode) {
      toast({
        title: "Changes saved",
        description: "All changes have been saved successfully",
        duration: 2000,
      })
    }
  }

  const copyEventLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
      duration: 2000,
    })
  }

  const shareEvent = (id: number) => {
    toast({
      title: "Evento compartido",
      description: "Se ha abierto el diálogo para compartir el evento",
      duration: 2000,
    })
  }

  const exportEventData = (id: number) => {
    const event = eventTypes.find((e) => e.id === id)
    if (!event) return

    const data = JSON.stringify(event, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `event-${id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Datos exportados",
      description: "Los datos del evento han sido exportados como JSON",
      duration: 2000,
    })
  }

  // Función para renderizar un gráfico simple
  const renderChart = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Datos de ejemplo
    const data = [12, 19, 8, 15, 7, 13, 9]
    const labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    const colors = ["#F8C8DC", "#C8E7F8", "#C8F8E7", "#F8F4C8", "#E7C8F8", "#F8C8DC", "#C8E7F8"]

    const barWidth = (canvas.width - 40) / data.length
    const maxValue = Math.max(...data)
    const scale = (canvas.height - 60) / maxValue

    // Dibujar ejes
    ctx.beginPath()
    ctx.strokeStyle = "#ccc"
    ctx.moveTo(30, 10)
    ctx.lineTo(30, canvas.height - 30)
    ctx.lineTo(canvas.width - 10, canvas.height - 30)
    ctx.stroke()

    // Dibujar barras
    data.forEach((value, index) => {
      const x = 30 + index * barWidth + 5
      const barHeight = value * scale
      const y = canvas.height - 30 - barHeight

      ctx.fillStyle = colors[index]
      ctx.fillRect(x, y, barWidth - 10, barHeight)

      // Etiquetas en el eje X
      ctx.fillStyle = "#666"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(labels[index], x + (barWidth - 10) / 2, canvas.height - 15)

      // Valores encima de las barras
      ctx.fillText(value.toString(), x + (barWidth - 10) / 2, y - 5)
    })
  }

  const eventTypes = [
    {
      id: 1,
      title: "Reunión 1:1",
      description: "Reunión personal de 30 minutos",
      duration: 30,
      url: "meetsync.com/user/reunion-1-1",
      active: true,
      registeredContacts: 18,
      startTime: "09:00",
      endTime: "17:00",
      daysAvailable: ["Lun", "Mar", "Mié", "Jue", "Vie"],
      location: "Google Meet",
      questions: [
        "Nombre completo",
        "Email de contacto",
        "¿Cuál es el motivo de la reunión?",
        "¿Tienes algún documento o material que quieras compartir antes de la reunión?",
        "¿Prefieres algún tema específico para discutir?",
        "¿Has tenido reuniones similares anteriormente?",
        "¿Cómo te enteraste de este servicio?",
      ],
      upcomingMeetings: [
        { name: "Juan Pérez", date: "13 Mayo, 2025", time: "10:00", status: "confirmed" },
        { name: "María López", date: "14 Mayo, 2025", time: "15:30", status: "confirmed" },
        { name: "Carlos Rodríguez", date: "15 Mayo, 2025", time: "09:15", status: "pending" },
        { name: "Ana Martínez", date: "15 Mayo, 2025", time: "14:00", status: "confirmed" },
        { name: "Pedro Sánchez", date: "16 Mayo, 2025", time: "11:30", status: "confirmed" },
        { name: "Laura Gómez", date: "16 Mayo, 2025", time: "16:45", status: "cancelled" },
        { name: "Miguel Torres", date: "17 Mayo, 2025", time: "10:30", status: "confirmed" },
      ],
      stats: {
        conversion: 68,
        avgDuration: 28,
        cancellations: 2,
        satisfaction: 4.8,
        totalBookings: 24,
        completedBookings: 18,
        popularDays: ["Martes", "Jueves"],
        popularTimes: ["10:00", "15:00"],
      },
    },
    {
      id: 2,
      title: "Entrevista Inicial",
      description: "Primera entrevista con clientes potenciales",
      duration: 45,
      url: "meetsync.com/user/entrevista-inicial",
      active: true,
      registeredContacts: 7,
      startTime: "10:00",
      endTime: "16:00",
      daysAvailable: ["Lun", "Mié", "Vie"],
      location: "Zoom",
      questions: ["Nombre", "Email", "Empresa", "¿Cómo nos conociste?"],
      upcomingMeetings: [{ name: "Carlos Rodríguez", date: "15 Mayo, 2025", time: "11:00", status: "confirmed" }],
      stats: {
        conversion: 45,
        avgDuration: 42,
        cancellations: 1,
        satisfaction: 4.2,
        totalBookings: 9,
        completedBookings: 7,
        popularDays: ["Miércoles"],
        popularTimes: ["11:00"],
      },
    },
    {
      id: 3,
      title: "Sesión de Consultoría",
      description: "Sesión de consultoría detallada",
      duration: 60,
      url: "meetsync.com/user/consultoria",
      active: false,
      registeredContacts: 0,
      startTime: "11:00",
      endTime: "15:00",
      daysAvailable: ["Mar", "Jue"],
      location: "Microsoft Teams",
      questions: ["Nombre", "Email", "Empresa", "Sector", "Descripción del proyecto"],
      upcomingMeetings: [],
      stats: {
        conversion: 0,
        avgDuration: 0,
        cancellations: 0,
        satisfaction: 0,
        totalBookings: 0,
        completedBookings: 0,
        popularDays: [],
        popularTimes: [],
      },
    },
  ]

  // Filtrar eventos según la búsqueda y filtros
  const filteredEvents = eventTypes.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesActiveFilter = filterActive === null || event.active === filterActive

    return matchesSearch && matchesActiveFilter
  })

  const selectedEvent = eventTypes.find((event) => event.id === selectedEventId)

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar tipos de eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterActive(null)}>Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterActive(true)}>Activos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterActive(false)}>Inactivos</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="bg-pastel-pink text-primary-foreground hover:bg-pastel-pink/90 gap-2"
              onClick={openNewEventDialog}
            >
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No se encontraron eventos</h3>
            <p className="text-muted-foreground mt-1">Intenta con otra búsqueda o crea un nuevo tipo de evento</p>
          </div>
        )}
      </div>

      <StaggerContainer className="space-y-4">
        {filteredEvents.map((eventType, index) => (
          <AnimatedCard key={eventType.id} index={index}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{eventType.title}</CardTitle>
                      {!eventType.active && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">{eventType.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEventDetails(eventType.id)}>
                        <Info className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyEventLink(eventType.url)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Enlace
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareEvent(eventType.id)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportEventData(eventType.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Datos
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{eventType.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{eventType.url}</span>
                  </div>
                  {eventType.registeredContacts > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{eventType.registeredContacts} contactos</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => copyEventLink(eventType.url)}>
                  <Link className="h-4 w-4 mr-2" />
                  Copiar Enlace
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-pastel-pink text-gray-800 hover:bg-pastel-pink/90"
                  onClick={() => openEventDetails(eventType.id)}
                >
                  Ver Detalles
                </Button>
              </CardFooter>
            </Card>
          </AnimatedCard>
        ))}
      </StaggerContainer>

      <Dialog open={selectedEventId !== null} onOpenChange={closeEventDetails}>
        {selectedEvent && (
          <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DialogTitle>
                    {isEditMode ? (
                      <Input defaultValue={selectedEvent.title} className="font-semibold text-lg" />
                    ) : (
                      selectedEvent.title
                    )}
                  </DialogTitle>
                  {!selectedEvent.active && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactivo
                    </Badge>
                  )}
                </div>
              
              </div>
              <DialogDescription>
                {isEditMode ? (
                  <Textarea defaultValue={selectedEvent.description} className="mt-2" />
                ) : (
                  selectedEvent.description
                )}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4 w-full">
                <TabsTrigger value="info" className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Información
                </TabsTrigger>
                <TabsTrigger value="meetings" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Reuniones
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  Estadísticas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                  <FadeIn className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                        <Info className="h-4 w-4 text-pastel-blue" />
                        Información General
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-pastel-pink" />
                          <span className="font-medium">Contactos registrados:</span>
                          <Badge
                            variant={selectedEvent.registeredContacts > 0 ? "default" : "outline"}
                            className={
                              selectedEvent.registeredContacts > 0 ? "bg-pastel-mint text-primary-foreground" : ""
                            }
                          >
                            {selectedEvent.registeredContacts}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-pastel-yellow" />
                          <span className="font-medium">Duración:</span>
                          {isEditMode ? (
                            <Select defaultValue={selectedEvent.duration.toString()}>
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 min</SelectItem>
                                <SelectItem value="30">30 min</SelectItem>
                                <SelectItem value="45">45 min</SelectItem>
                                <SelectItem value="60">60 min</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{selectedEvent.duration} minutos</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-pastel-yellow" />
                          <span className="font-medium">Horario:</span>
                          {isEditMode ? (
                            <div className="flex items-center gap-1">
                              <Input type="time" defaultValue={selectedEvent.startTime} className="w-24" />
                              <span>a</span>
                              <Input type="time" defaultValue={selectedEvent.endTime} className="w-24" />
                            </div>
                          ) : (
                            <span>
                              {selectedEvent.startTime} - {selectedEvent.endTime}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-pastel-lavender" />
                          <span className="font-medium">Días disponibles:</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedEvent.daysAvailable.map((day) => (
                              <Badge key={day} variant="outline" className="text-xs">
                                {day}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-pastel-blue" />
                          <span className="font-medium">Plataforma:</span>
                          {isEditMode ? (
                            <Select defaultValue={selectedEvent.location.toLowerCase().replace(" ", "")}>
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="googlemeet">Google Meet</SelectItem>
                                <SelectItem value="zoom">Zoom</SelectItem>
                                <SelectItem value="microsoftteams">Microsoft Teams</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{selectedEvent.location}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-pastel-mint" />
                          <span className="font-medium">URL:</span>
                          {isEditMode ? (
                            <Input defaultValue={selectedEvent.url} className="flex-1" />
                          ) : (
                            <span className="text-muted-foreground">{selectedEvent.url}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                        <Info className="h-4 w-4 text-pastel-blue" />
                        Preguntas Requeridas
                      </h3>
                      <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {isEditMode ? (
                          <div className="space-y-2">
                            {selectedEvent.questions.map((question, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Input defaultValue={question} className="flex-1" />
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              <Plus className="h-4 w-4 mr-2" />
                              Añadir Pregunta
                            </Button>
                          </div>
                        ) : (
                          <ul className="list-disc list-inside ml-2 text-sm space-y-2">
                            {selectedEvent.questions.map((question, i) => (
                              <li key={i} className="text-muted-foreground">
                                {question}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </FadeIn>

                  <FadeIn delay={0.1} className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-pastel-pink" />
                        Disponibilidad
                      </h3>
                      <div className="space-y-3">
                        {isEditMode ? (
                          <div className="space-y-2">
                            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(
                              (day) => {
                                const shortDay = day.substring(0, 3)
                                const isEnabled = selectedEvent.daysAvailable.includes(shortDay)

                                return (
                                  <div key={day} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
<Switch checked={isEnabled} onCheckedChange={(checked) => console.log(checked)} />
                                      <Label>{day}</Label>
                                    </div>
                                    {isEnabled && (
                                      <div className="flex items-center gap-1">
                                        <Input type="time" defaultValue={selectedEvent.startTime} className="w-24" />
                                        <span>-</span>
                                        <Input type="time" defaultValue={selectedEvent.endTime} className="w-24" />
                                      </div>
                                    )}
                                  </div>
                                )
                              },
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-7 gap-2 text-center">
                            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => {
                              const isAvailable = selectedEvent.daysAvailable.includes(day)
                              return (
                                <div
                                  key={day}
                                  className={`p-2 rounded-md ${
                                    isAvailable ? "bg-pastel-pink/20" : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <div className="font-medium text-sm">{day}</div>
                                  <div className="text-xs mt-2">
                                    {isAvailable ? (
                                      <>
                                        {selectedEvent.startTime}
                                        <br />
                                        {selectedEvent.endTime}
                                      </>
                                    ) : (
                                      "-"
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                        <Info className="h-4 w-4 text-pastel-blue" />
                        Acciones Rápidas
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start gap-2"
                          onClick={() => copyEventLink(selectedEvent.url)}
                        >
                          <Copy className="h-4 w-4" />
                          Copiar Enlace
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start gap-2"
                          onClick={() => shareEvent(selectedEvent.id)}
                        >
                          <Share2 className="h-4 w-4" />
                          Compartir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start gap-2"
                          onClick={() => exportEventData(selectedEvent.id)}
                        >
                          <Download className="h-4 w-4" />
                          Exportar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </FadeIn>
                </div>
              </TabsContent>

              <TabsContent value="meetings">
                <div className="py-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-pastel-pink" />
                      Próximas Reuniones
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Filter className="h-4 w-4" />
                        Filtrar
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </div>

                  {selectedEvent.upcomingMeetings.length > 0 ? (
                    <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-3">
                        {selectedEvent.upcomingMeetings.map((meeting, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-background p-3 rounded-md border"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={meeting.name} />
                                <AvatarFallback>{meeting.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{meeting.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{meeting.date}</span>
                                  <Clock className="h-3.5 w-3.5 ml-1" />
                                  <span>{meeting.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  meeting.status === "confirmed"
                                    ? "default"
                                    : meeting.status === "pending"
                                      ? "outline"
                                      : "secondary"
                                }
                                className={
                                  meeting.status === "confirmed"
                                    ? "bg-pastel-mint text-primary-foreground"
                                    : meeting.status === "cancelled"
                                      ? "bg-destructive/10 text-destructive border-destructive/20"
                                      : ""
                                }
                              >
                                {meeting.status === "confirmed" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {meeting.status === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                                {meeting.status === "cancelled" && <XCircle className="h-3 w-3 mr-1" />}
                                {meeting.status === "confirmed"
                                  ? "Confirmado"
                                  : meeting.status === "pending"
                                    ? "Pendiente"
                                    : "Cancelado"}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                  <DropdownMenuItem>Enviar Recordatorio</DropdownMenuItem>
                                  <DropdownMenuItem>Reprogramar</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No hay reuniones programadas</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        Aún no hay reuniones programadas para este tipo de evento
                      </p>
                      <Button variant="outline">Programar Reunión</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="stats">
                <div className="py-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Tasa de Conversión</p>
                      <p className="text-xl font-bold text-pastel-pink">{selectedEvent.stats.conversion}%</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Tiempo Promedio</p>
                      <p className="text-xl font-bold text-pastel-blue">{selectedEvent.stats.avgDuration} min</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Cancelaciones</p>
                      <p className="text-xl font-bold text-pastel-mint">{selectedEvent.stats.cancellations}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Satisfacción</p>
                      <p className="text-xl font-bold text-pastel-lavender">{selectedEvent.stats.satisfaction}/5</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                        <BarChart className="h-4 w-4 text-pastel-blue" />
                        Reservas por Día
                      </h3>
                      <div className="h-[200px] relative">
                        <canvas ref={chartRef} className="w-full h-full" />
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                        <Info className="h-4 w-4 text-pastel-pink" />
                        Resumen de Actividad
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total de Reservas:</span>
                          <Badge variant="outline" className="font-mono">
                            {selectedEvent.stats.totalBookings}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Reuniones Completadas:</span>
                          <Badge variant="outline" className="font-mono">
                            {selectedEvent.stats.completedBookings}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Días Populares:</span>
                          <div className="flex gap-1">
                            {selectedEvent.stats.popularDays.length > 0 ? (
                              selectedEvent.stats.popularDays.map((day, i) => (
                                <Badge key={i} className="bg-pastel-blue/20">
                                  {day}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Horas Populares:</span>
                          <div className="flex gap-1">
                            {selectedEvent.stats.popularTimes.length > 0 ? (
                              selectedEvent.stats.popularTimes.map((time, i) => (
                                <Badge key={i} className="bg-pastel-pink/20">
                                  {time}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between sm:justify-between gap-2 mt-4">
              <Button variant="outline" onClick={closeEventDetails}>
                Cerrar
              </Button>
              <div className="flex gap-2">
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  className={
                    isEditMode ? "bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90" : "bg-pastel-blue/10"
                  }
                  onClick={toggleEditMode}
                >
                  {isEditMode ? "Guardar Cambios" : "Editar Evento"}
                </Button>
                <Button className="bg-pastel-pink text-primary-foreground hover:bg-pastel-pink/90">
                  Ver Calendario
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={showNewEventDialog} onOpenChange={closeNewEventDialog}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tipo de Evento</DialogTitle>
            <DialogDescription>Define los detalles para tu nuevo tipo de evento</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <CreateEventForm />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeNewEventDialog}>
              Cancelar
            </Button>
            <Button
              className="bg-pastel-pink text-primary-foreground hover:bg-pastel-pink/90"
              onClick={() => {
                toast({
                  title: "Evento creado",
                  description: "El nuevo evento ha sido creado correctamente",
                  duration: 2000,
                })
                closeNewEventDialog()
              }}
            >
              Crear Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
