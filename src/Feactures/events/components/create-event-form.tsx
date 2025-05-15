"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import {
  X,
  Plus,
  Calendar,
  Save,
  Copy,
  MoveHorizontalIcon as DragHorizontal,
  Check,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { toast } from "sonner"
import { AnimatedCard } from "../../../components/animations/animated-card"

// Tipo para los horarios
type TimeSlot = {
  id: string
  start: string
  end: string
}

// Tipo para los días de la semana
type DaySchedule = {
  enabled: boolean
  timeSlots: TimeSlot[]
}

export default function CreateEventForm() {
  // Estado para los horarios por día
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    Lunes: { enabled: true, timeSlots: [{ id: "lun-1", start: "09:00", end: "17:00" }] },
    Martes: {
      enabled: true,
      timeSlots: [
        { id: "mar-1", start: "10:00", end: "16:00" },
        { id: "mar-2", start: "18:00", end: "20:00" },
      ],
    },
    Miércoles: { enabled: true, timeSlots: [{ id: "mie-1", start: "09:00", end: "17:00" }] },
    Jueves: { enabled: true, timeSlots: [{ id: "jue-1", start: "10:00", end: "16:00" }] },
    Viernes: { enabled: true, timeSlots: [{ id: "vie-1", start: "09:00", end: "15:00" }] },
    Sábado: { enabled: false, timeSlots: [] },
    Domingo: { enabled: false, timeSlots: [] },
  })

  // Estado para las preguntas
  const [questions, setQuestions] = useState([
    { id: "q1", text: "Nombre", required: true },
    { id: "q2", text: "Email", required: true },
    { id: "q3", text: "¿Cuál es el motivo de la reunión?", required: false },
  ])

  // Estado para el elemento que se está arrastrando
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  // Referencias para el formulario
  const formRef = useRef<HTMLFormElement>(null)

  // Plantillas predefinidas
  const scheduleTemplates = [
    {
      name: "Horario Laboral Estándar",
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      timeSlots: [{ start: "09:00", end: "17:00" }],
    },
    {
      name: "Horario de Media Jornada",
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      timeSlots: [{ start: "09:00", end: "13:00" }],
    },
    {
      name: "Horario de Tarde",
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      timeSlots: [{ start: "14:00", end: "20:00" }],
    },
    {
      name: "Horario de Fin de Semana",
      days: ["Sábado", "Domingo"],
      timeSlots: [{ start: "10:00", end: "18:00" }],
    },
  ]

  // Función para cambiar el estado de habilitación de un día
  const toggleDayEnabled = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }))
  }

  // Función para añadir un nuevo horario a un día
  const addTimeSlot = (day: string) => {
    const newId = `${day.toLowerCase().substring(0, 3)}-${schedule[day].timeSlots.length + 1}`
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, { id: newId, start: "09:00", end: "17:00" }],
      },
    }))
  }

  // Función para eliminar un horario
  const removeTimeSlot = (day: string, id: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((slot) => slot.id !== id),
      },
    }))
  }

  // Función para actualizar un horario
  const updateTimeSlot = (day: string, id: string, field: "start" | "end", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)),
      },
    }))
  }

  // Funciones para arrastrar y soltar
  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (day: string, targetId: string) => {
    if (!draggedItem) return

    // Encontrar el día y el horario de origen
    let sourceDayName = ""
    let sourceSlot: TimeSlot | null = null

    for (const [dayName, dayData] of Object.entries(schedule)) {
      const slot = dayData.timeSlots.find((s) => s.id === draggedItem)
      if (slot) {
        sourceDayName = dayName
        sourceSlot = slot
        break
      }
    }

    if (!sourceSlot || (sourceDayName === day && draggedItem === targetId)) {
      setDraggedItem(null)
      return
    }

    // Crear nuevo estado con el horario reordenado
    const newSchedule = { ...schedule }

    // Eliminar del origen
    newSchedule[sourceDayName].timeSlots = newSchedule[sourceDayName].timeSlots.filter((s) => s.id !== draggedItem)

    // Encontrar el índice del destino
    const targetIndex = newSchedule[day].timeSlots.findIndex((s) => s.id === targetId)

    // Insertar en el destino
    newSchedule[day].timeSlots.splice(targetIndex, 0, sourceSlot)

    setSchedule(newSchedule)
    setDraggedItem(null)

    toast({
      title: "Horario movido",
      description: `Horario movido de ${sourceDayName} a ${day}`,
      duration: 2000,
    })
  }

  // Función para aplicar una plantilla
  const applyTemplate = (template: (typeof scheduleTemplates)[0]) => {
    const newSchedule = { ...schedule }

    // Primero, desactivamos todos los días
    for (const day in newSchedule) {
      newSchedule[day].enabled = false
      newSchedule[day].timeSlots = []
    }

    // Luego, aplicamos la plantilla
    template.days.forEach((day) => {
      newSchedule[day].enabled = true
      newSchedule[day].timeSlots = template.timeSlots.map((slot, index) => ({
        id: `${day.toLowerCase().substring(0, 3)}-${index + 1}`,
        start: slot.start,
        end: slot.end,
      }))
    })

    setSchedule(newSchedule)

    toast({
      title: "Plantilla aplicada",
      description: `Se ha aplicado la plantilla "${template.name}"`,
      duration: 2000,
    })
  }

  // Función para guardar una plantilla personalizada
  const saveCustomTemplate = () => {
    // Aquí iría la lógica para guardar la plantilla
    toast({
      title: "Plantilla guardada",
      description: "Tu plantilla personalizada ha sido guardada",
      duration: 2000,
    })
  }

  // Función para añadir una nueva pregunta
  const addQuestion = () => {
    const newId = `q${questions.length + 1}`
    setQuestions([...questions, { id: newId, text: "", required: false }])
  }

  // Función para actualizar una pregunta
  const updateQuestion = (id: string, field: "text" | "required", value: string | boolean) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  // Función para eliminar una pregunta
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  // Función para guardar el formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aquí iría la lógica para guardar el evento
    toast({
      title: "Evento guardado",
      description: "Tu evento ha sido guardado correctamente",
      duration: 2000,
    })
  }

  // Función para exportar la configuración
  const exportConfig = () => {
    const config = {
      schedule,
      questions,
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "event-config.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Configuración exportada",
      description: "La configuración ha sido exportada como JSON",
      duration: 2000,
    })
  }

  return (
    <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Nombre del Evento</Label>
          <Input id="title" placeholder="Ej: Reunión 1:1" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" placeholder="Describe brevemente este tipo de evento" className="min-h-[100px]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="duration">Duración</Label>
            <Select defaultValue="30">
              <SelectTrigger id="duration">
                <SelectValue placeholder="Selecciona duración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
                <SelectItem value="90">90 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Ubicación</Label>
            <Select defaultValue="gmeet">
              <SelectTrigger id="location">
                <SelectValue placeholder="Selecciona plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmeet">Google Meet</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="teams">Microsoft Teams</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="availability">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
            <TabsTrigger value="advanced">Opciones Avanzadas</TabsTrigger>
            <TabsTrigger value="questions">Preguntas</TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">Horarios por Día</h3>
                <p className="text-sm text-muted-foreground">Define horarios específicos para cada día de la semana</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Ver Calendario</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Vista de Calendario</DialogTitle>
                      <DialogDescription>Visualiza tus horarios disponibles en formato de calendario</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                          <div key={day} className="font-medium text-sm">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 h-[300px] border rounded-md">
                        {Object.entries(schedule).map(([day, { enabled, timeSlots }], index) => (
                          <div key={day} className={`border-r last:border-r-0 p-1 ${enabled ? "" : "bg-muted/30"}`}>
                            <div className="text-xs font-medium mb-1">{day.substring(0, 3)}</div>
                            {enabled ? (
                              <div className="space-y-1">
                                {timeSlots.map((slot) => (
                                  <div key={slot.id} className="text-xs bg-pastel-pink/20 p-1 rounded text-center">
                                    {slot.start} - {slot.end}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground italic text-center mt-2">No disponible</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>
                        Cerrar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Save className="h-4 w-4" />
                      <span>Plantillas</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[240px]">
                    <div className="p-2 text-sm font-medium">Aplicar plantilla</div>
                    {scheduleTemplates.map((template, index) => (
                      <DropdownMenuItem key={index} onClick={() => applyTemplate(template)} className="gap-2">
                        <Copy className="h-4 w-4" />
                        {template.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={saveCustomTemplate} className="gap-2 border-t mt-1 pt-1">
                      <Save className="h-4 w-4" />
                      Guardar configuración actual
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" className="gap-1" onClick={exportConfig}>
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(schedule).map(([day, { enabled, timeSlots }]) => (
                <AnimatedCard key={day} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Switch checked={enabled} onCheckedChange={() => toggleDayEnabled(day)} />
                      <Label className="font-medium">{day}</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      type="button"
                      onClick={() => addTimeSlot(day)}
                      disabled={!enabled}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Añadir Horario
                    </Button>
                  </div>

                  {enabled ? (
                    <div className="space-y-2">
                      {timeSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-2 bg-muted/50 p-2 rounded-md ${
                            draggedItem === slot.id ? "border-2 border-pastel-pink" : ""
                          }`}
                          draggable
                          onDragStart={() => handleDragStart(slot.id)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(day, slot.id)}
                        >
                          <div className="cursor-move p-1">
                            <DragHorizontal className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={slot.start}
                              onChange={(e) => updateTimeSlot(day, slot.id, "start", e.target.value)}
                              className="w-24"
                            />
                            <span>a</span>
                            <Input
                              type="time"
                              value={slot.end}
                              onChange={(e) => updateTimeSlot(day, slot.id, "end", e.target.value)}
                              className="w-24"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeTimeSlot(day, slot.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      {timeSlots.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                          No hay horarios definidos. Añade uno para comenzar.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No disponible</p>
                  )}
                </AnimatedCard>
              ))}
            </div>

            <div className="grid gap-2">
              <Label>Zona Horaria</Label>
              <Select defaultValue="america-mexico_city">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america-mexico_city">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="america-new_york">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="europe-madrid">Madrid (GMT+1)</SelectItem>
                  <SelectItem value="asia-tokyo">Tokio (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requerir Confirmación</Label>
                <p className="text-sm text-muted-foreground">Aprobar manualmente las solicitudes de reunión</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tiempo de Antelación</Label>
                <p className="text-sm text-muted-foreground">Tiempo mínimo antes de poder agendar</p>
              </div>
              <Select defaultValue="60">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecciona tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="1440">24 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tiempo entre Eventos</Label>
                <p className="text-sm text-muted-foreground">Tiempo de descanso entre reuniones</p>
              </div>
              <Select defaultValue="10">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecciona tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 minutos</SelectItem>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="10">10 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Límite de Reservas por Día</Label>
                <p className="text-sm text-muted-foreground">Número máximo de reuniones por día</p>
              </div>
              <Select defaultValue="unlimited">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecciona límite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Sin límite</SelectItem>
                  <SelectItem value="1">1 reunión</SelectItem>
                  <SelectItem value="2">2 reuniones</SelectItem>
                  <SelectItem value="3">3 reuniones</SelectItem>
                  <SelectItem value="5">5 reuniones</SelectItem>
                  <SelectItem value="10">10 reuniones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones de nuevas reservas</p>
              </div>
              <Switch defaultChecked />
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Preguntas para el Invitado</Label>
                <p className="text-sm text-muted-foreground">Define las preguntas que se mostrarán al reservar</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1" onClick={addQuestion} type="button">
                <Plus className="h-4 w-4" />
                Añadir Pregunta
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-center gap-2 border p-3 rounded-md" draggable>
                  <div className="cursor-move p-1">
                    <DragHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Nombre de la pregunta"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                    />
                  </div>
                  <Select
                    value={question.required ? "required" : "optional"}
                    onValueChange={(value) => updateQuestion(question.id, "required", value === "required")}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="required">Obligatorio</SelectItem>
                      <SelectItem value="optional">Opcional</SelectItem>
                    </SelectContent>
                  </Select>
                  {index > 1 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeQuestion(question.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-pastel-pink" />
                <h4 className="text-sm font-medium">Previsualización</h4>
              </div>
              <div className="space-y-3 p-3 bg-background rounded-md">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-1">
                    <Label className="text-sm">
                      {question.text}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input disabled placeholder={`Ingresa ${question.text.toLowerCase()}`} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" className="bg-pastel-pink text-primary-foreground hover:bg-pastel-pink/90">
          <Check className="h-4 w-4 mr-2" />
          Guardar Evento
        </Button>
      </div>
    </form>
  )
}
