import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { Clock, MapPin, User, Mail, AlertCircle, Check, Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { api, API_ENDPOINTS } from "../../services/apiclient";
import { gsap } from "gsap";

interface EventRegistrationProps {
  eventId: number;
}

interface EventData {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  location_type: string;
  custom_url: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

export default function AgendacionPage({ eventId }: EventRegistrationProps) {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (eventId) loadEventData();
  }, [eventId]);

  useEffect(() => {
    // Configurar fecha por defecto (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
    setTimeSlots(generateTimeSlots(tomorrow));
    setCurrentStep(2); // Mostrar tanto calendario como horarios
  }, [eventData]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/events/${eventId}`);
      if (response.data.success) {
        setEventData(response.data.data);
      } else {
        toast.error("Evento no encontrado");
      }
    } catch (error: any) {
      console.error("Error cargando evento:", error);
      toast.error("Error al cargar el evento");
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSlots = (date: Date) => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    const interval = 15; // minutos

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: Math.random() > 0.3 // Simulación de disponibilidad
        });
      }
    }
    return slots;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // Días del mes anterior
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, new Date(year, month, 0).getDate() - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Completar la semana con días del siguiente mes
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  // Funciones de hover con GSAP
  const handleDayHover = (element: HTMLElement, isHover: boolean) => {
    gsap.to(element, {
      scale: isHover ? 1.05 : 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleButtonHover = (element: HTMLElement, isHover: boolean) => {
    gsap.to(element, {
      scale: isHover ? 1.02 : 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleDateSelect = (date: Date) => {
    if (date < new Date()) return;
    
    // Animación de selección
    const dayButton = event?.target as HTMLElement;
    if (dayButton) {
      gsap.fromTo(dayButton,
        { scale: 1 },
        { 
          scale: 1.1, 
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        }
      );
    }
    
    setSelectedDate(date);
    setTimeSlots(generateTimeSlots(date));
    // No cambiar automáticamente de paso, mantener calendario y horarios visibles
  };

  const handleTimeSelect = (time: string) => {
    // Animación de selección
    const timeButton = event?.target as HTMLElement;
    if (timeButton) {
      gsap.fromTo(timeButton,
        { scale: 1 },
        { 
          scale: 1.05, 
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        }
      );
    }

    setSelectedTime(time);
    setCurrentStep(3);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const { [name]: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo válido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !eventData || !selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    try {
      const bookingData = {
        name: formData.name,
        email: formData.email,
        notes: formData.notes,
        event_id: eventData.id,
        scheduled_date: selectedDate.toISOString().split('T')[0],
        scheduled_time: selectedTime
      };
      
      const response = await api.post(API_ENDPOINTS.contacts.create, bookingData);
      if (response.data.success) {
        setCurrentStep(4);
        toast.success("¡Reserva confirmada!", {
          description: `Tu cita para "${eventData.name}" ha sido agendada`
        });
      }
    } catch (error: any) {
      console.error("Error en reserva:", error);
      if (error.response?.status === 409) {
        toast.error("Este horario ya no está disponible");
      } else {
        toast.error("Error al realizar la reserva. Intenta nuevamente");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const addMinutes = (time: string, minutesToAdd: number) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-800">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Evento no encontrado</h2>
            <p className="text-muted-foreground">
              El evento que buscas no existe o no está disponible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-8 px-4 min-h-screen bg-white">
      <div className="w-full max-w-5xl">
        {/* Header con información del evento */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {eventData.name.charAt(0).toLowerCase()}
              </span>
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm">angel coavas</h3>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">{eventData.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-pink-400" />
              <span>{eventData.duration_minutes}m</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-pink-500 rounded-sm"></span>
              <span className="capitalize">
                {eventData.location_type.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-pink-500"></span>
              <span>America/Bogota</span>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative flex">
          {/* Paso 1 y 2: Calendario y Horarios lado a lado */}
          {(currentStep === 1 || currentStep === 2) && (
            <div className="flex w-full justify-center gap-6">
              {/* Calendario */}
              <Card className="w-full hover:shadow-md transition-all duration-200 border-l-4 border-l-pink-400">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToPreviousMonth}
                        onMouseEnter={(e) => handleButtonHover(e.target as HTMLElement, true)}
                        onMouseLeave={(e) => handleButtonHover(e.target as HTMLElement, false)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToNextMonth}
                        onMouseEnter={(e) => handleButtonHover(e.target as HTMLElement, true)}
                        onMouseLeave={(e) => handleButtonHover(e.target as HTMLElement, false)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {DAYS.map(day => (
                      <div key={day} className="text-center text-muted-foreground text-sm font-medium py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="calendar-grid grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      const isToday = day.date.toDateString() === new Date().toDateString();
                      const isPast = day.date < new Date();
                      const isSelected = selectedDate?.toDateString() === day.date.toDateString();

                      return (
                        <button
                          key={index}
                          onClick={(e) => {
                            if (day.isCurrentMonth && !isPast) {
                              handleDateSelect(day.date);
                            }
                          }}
                          onMouseEnter={(e) => !isPast && handleDayHover(e.target as HTMLElement, true)}
                          onMouseLeave={(e) => !isPast && handleDayHover(e.target as HTMLElement, false)}
                          disabled={!day.isCurrentMonth || isPast}
                          className={`
                            calendar-day aspect-square p-2 text-sm rounded transition-all duration-200
                            ${day.isCurrentMonth 
                              ? isPast 
                                ? 'text-muted-foreground cursor-not-allowed'
                                : isSelected
                                  ? 'bg-pink-400 text-white font-semibold shadow-lg'
                                  : isToday
                                    ? 'bg-pink-600 text-white'
                                    : 'hover:bg-pink-400/20 hover:text-pink-600'
                              : 'text-muted-foreground'
                            }
                          `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Horarios */}
              <Card className="w-full hover:shadow-md transition-all duration-200 border-l-4 border-l-pink-400">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {selectedDate ? (
                        <>lun {selectedDate.getDate()}</>
                      ) : (
                        'Selecciona una fecha'
                      )}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-7 px-2">
                        12 h
                      </Button>
                      <Button variant="ghost" size="sm" className="bg-pink-600 hover:bg-pink-700 text-white text-xs h-7 px-2">
                        24hs
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={(e) => slot.available && handleTimeSelect(slot.time)}
                          onMouseEnter={(e) => slot.available && handleButtonHover(e.target as HTMLElement, true)}
                          onMouseLeave={(e) => slot.available && handleButtonHover(e.target as HTMLElement, false)}
                          disabled={!slot.available}
                          className={`
                            time-slot p-3 rounded border text-sm transition-all duration-200 text-left
                            ${slot.available
                              ? 'border-border hover:border-pink-400 hover:bg-pink-400/10 hover:text-pink-600'
                              : 'border-border text-muted-foreground cursor-not-allowed'
                            }
                          `}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-muted-foreground">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-pink-400" />
                        <p>Selecciona una fecha para ver los horarios disponibles</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Paso 3: Formulario */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto">
              <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-pink-400">
                <CardHeader>
                  <CardTitle className="text-xl">Completa tu reserva</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Resumen de la cita seleccionada */}
                  {selectedDate && selectedTime && (
                    <div className="bg-muted p-4 rounded-lg border border-pink-400/30 mb-6">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 text-pink-400" />
                        <span className="text-sm capitalize">{formatDate(selectedDate)}</span>
                      </div>
                      <div className="text-base font-medium">
                        {formatTime(selectedTime)} – {formatTime(addMinutes(selectedTime, eventData.duration_minutes))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Tu Nombre <span className="text-pink-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nombre completo"
                        className={`h-10 ${errors.name ? "border-red-500" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-pink-400">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@correo.com"
                        className={`h-10 ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">
                        Notas Adicionales
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Por favor, comparta cualquier cosa que ayude a preparar nuestra reunión."
                        className="resize-none text-sm"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm cursor-pointer hover:text-pink-400 transition-colors">
                      <Users className="h-4 w-4" />
                      <span>Añadir invitados</span>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-4">
                        Al continuar, acepta nuestras{" "}
                        <span className="text-pink-400 underline cursor-pointer hover:text-pink-300">condiciones de uso</span>{" "}
                        y nuestra{" "}
                        <span className="text-pink-400 underline cursor-pointer hover:text-pink-300">política de privacidad</span>.
                      </p>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentStep(2)}
                          onMouseEnter={(e) => handleButtonHover(e.target as HTMLElement, true)}
                          onMouseLeave={(e) => handleButtonHover(e.target as HTMLElement, false)}
                          className="h-10 px-6"
                        >
                          Atrás
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          onMouseEnter={(e) => !isSubmitting && handleButtonHover(e.target as HTMLElement, true)}
                          onMouseLeave={(e) => !isSubmitting && handleButtonHover(e.target as HTMLElement, false)}
                          className="flex-1 bg-pink-400 text-white hover:bg-pink-500 h-10"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Confirmando...
                            </>
                          ) : (
                            "Confirmar"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto">
              <Card className="border border-pink-400/50 text-center hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <Check className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">
                      ¡Reserva confirmada!
                    </h2>
                    <p className="text-muted-foreground">
                      Tu cita ha sido agendada exitosamente
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded border border-pink-400/30 mb-6">
                    <div className="text-left space-y-2">
                      <p className="font-medium">{eventData.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {selectedDate && formatDate(selectedDate)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {selectedTime && formatTime(selectedTime)} – {formatTime(addMinutes(selectedTime, eventData.duration_minutes))} ({eventData.duration_minutes} minutos)
                      </p>
                      <p className="text-muted-foreground text-sm">
                        📧 {formData.email}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Recibirás un correo con los detalles de la reunión
                  </p>

                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-pink-400 hover:bg-pink-500 text-white"
                  >
                    Agendar otra cita
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}