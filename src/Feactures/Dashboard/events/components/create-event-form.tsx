import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";
import { AlertCircle, Check, Clock, Loader2, MapPin, Users, Settings, Globe, X, HelpCircle, Plus, Trash2, GripVertical } from "lucide-react";
import eventsService from '../EventsService';


// Interfaz para las preguntas
interface EventQuestion {
  id?: number;
  question: string;
  is_required: boolean;
  question_order: number;
}

interface CreateEventFormProps {
  onEventCreated?: (linkGenerated?: string) => void;
}

export default function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    location_type: "google_meet",
    custom_url: "",
    requires_confirmation: false,
    min_booking_notice: 60,
    buffer_time: 0,
    daily_limit: 0,
    notifications_enabled: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [meetLink, setMeetLink] = useState<string | null>(null);
  // Estado para las preguntas personalizadas
  const [questions, setQuestions] = useState<EventQuestion[]>([]);

  // Generar URL sugerida cuando cambie el nombre
  useEffect(() => {
    if (formData.name && !formData.custom_url) {
      const suggestedUrl = eventsService.generateSuggestedUrl(formData.name);
      setFormData(prev => ({ ...prev, custom_url: suggestedUrl }));
    }
  }, [formData.name]);

  // Función para verificar disponibilidad de URL
  const checkUrlAvailability = async (url: string) => {
    if (!url.trim()) {
      setUrlAvailable(null);
      return;
    }

    setIsCheckingUrl(true);

    try {
      const validation = await eventsService.validateCustomUrl(url);
      setUrlAvailable(validation.valid);

      if (!validation.valid) {
        setErrors(prev => ({ ...prev, custom_url: validation.message || 'Esta URL no está disponible' }));
      } else {
        setErrors(prev => {
          const { custom_url, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('Error verificando URL:', error);
      setUrlAvailable(null);
    } finally {
      setIsCheckingUrl(false);
    }
  };

  // Debounce para verificación de URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.custom_url && formData.custom_url.length > 2) {
        checkUrlAvailability(formData.custom_url);
      } else {
        setUrlAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.custom_url]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'number') {
      finalValue = parseInt(value) || 0;
    }

    // Validación especial para custom_url
    if (name === 'custom_url') {
      finalValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    const finalValue = ['duration_minutes', 'min_booking_notice', 'buffer_time', 'daily_limit'].includes(name)
      ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Funciones para manejar preguntas
  const handleAddQuestion = () => {
    const newQuestion: EventQuestion = {
      question: "",
      is_required: false,
      question_order: questions.length + 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, field: keyof EventQuestion, value: any) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };



  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Reordenar los question_order
    updatedQuestions.forEach((q, i) => {
      q.question_order = i + 1;
    });
    setQuestions(updatedQuestions);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];

    // Actualizar order
    updatedQuestions.forEach((q, i) => {
      q.question_order = i + 1;
    });

    setQuestions(updatedQuestions);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validación de nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del evento es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validación de duración
    if (formData.duration_minutes < 5) {
      newErrors.duration_minutes = 'La duración mínima es de 5 minutos';
    } else if (formData.duration_minutes > 480) {
      newErrors.duration_minutes = 'La duración máxima es de 8 horas';
    }

    // Validación de URL personalizada
    if (!formData.custom_url.trim()) {
      newErrors.custom_url = 'La URL personalizada es requerida';
    } else if (formData.custom_url.length < 3) {
      newErrors.custom_url = 'La URL debe tener al menos 3 caracteres';
    } else if (!/^[a-z0-9-]+$/.test(formData.custom_url)) {
      newErrors.custom_url = 'La URL solo puede contener letras minúsculas, números y guiones';
    } else if (urlAvailable === false) {
      newErrors.custom_url = 'Esta URL ya está en uso';
    }

    // Validaciones adicionales
    if (formData.min_booking_notice < 0) {
      newErrors.min_booking_notice = 'El tiempo de anticipación no puede ser negativo';
    }

    if (formData.buffer_time < 0) {
      newErrors.buffer_time = 'El tiempo entre eventos no puede ser negativo';
    }

    if (formData.daily_limit < 0) {
      newErrors.daily_limit = 'El límite diario no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    if (isCheckingUrl) {
      toast.error('Espera a que se verifique la disponibilidad de la URL');
      return;
    }

    if (urlAvailable === false) {
      toast.error('La URL personalizada no está disponible. Por favor, elige otra.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Iniciando proceso de creación de evento...');
      console.log('📝 Datos del formulario:', formData);

      const dataToSend = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes.toString()),
        min_booking_notice: parseInt(formData.min_booking_notice.toString()),
        buffer_time: parseInt(formData.buffer_time.toString()),
        daily_limit: parseInt(formData.daily_limit.toString())
      };

      console.log('📤 Datos finales a enviar:', dataToSend);
      if (formData.location_type === 'google_meet') {
        try {
          const now = new Date();
          const start = new Date(now.getTime() + 10 * 60000); // En 10 minutos
          const end = new Date(start.getTime() + formData.duration_minutes * 60000); // Duración

          console.log('📅 Fechas generadas:', {
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          });

          const meetEventData = {
            title: formData.name,
            description: formData.description || 'Reunión programada',
            start_time: start.toISOString(), // ✅ Corregido a snake_case
            end_time: end.toISOString(), // ✅ Corregido a snake_case
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone, // ✅ Corregido a snake_case
          };

          const createdEvent = await eventsService.createGoogleMeeting(meetEventData);
          setMeetLink(createdEvent.hangoutLink);

          toast.success('Google Meet creado exitosamente', {
            action: {
              label: 'Unirse ahora',
              onClick: () => window.open(createdEvent.hangoutLink, '_blank'),
            },
          });
        } catch (error: any) {
          console.error('❌ Error creando reunión con Google Meet:', error);
          toast.error('No se pudo crear la reunión con Google Meet. Inténtalo nuevamente.');
          return;
        }
      }
      const newEvent = await eventsService.createEventType(dataToSend);

      console.log('✅ Evento creado exitosamente:', newEvent);

      // Si hay preguntas, crearlas también
      if (questions.length > 0 && newEvent.id) {
        try {
          console.log('📝 Creando preguntas para el evento:', questions);
          const validQuestions = questions.filter(q => q.question.trim() !== '');

          for (const question of validQuestions) {
            await eventsService.addEventQuestion(newEvent.id, {
              question: question.question,
              is_required: question.is_required,
              question_order: question.question_order
            });
          }

          console.log('✅ Preguntas creadas exitosamente');
        } catch (questionError) {
          console.error('⚠️ Error creando preguntas:', questionError);
          // No fallar todo el proceso por las preguntas
        }
      }

      toast.success('¡Tipo de evento creado exitosamente!', {
        description: `El evento "${formData.name}" ha sido creado con la URL: ${formData.custom_url}${questions.length > 0 ? ` y ${questions.length} pregunta(s)` : ''}`
      });

      // Limpiar formulario
      setFormData({
        name: "",
        description: "",
        duration_minutes: 30,
        location_type: "google_meet",
        custom_url: "",
        requires_confirmation: false,
        min_booking_notice: 60,
        buffer_time: 0,
        daily_limit: 0,
        notifications_enabled: true,
      });

      setErrors({});
      setUrlAvailable(null);
      setQuestions([]);

      // Notificar al componente padre
      if (onEventCreated) {
        console.log('🔄 Notificando al componente padre para actualizar la lista...');
        onEventCreated(meetLink || undefined)
      }

    } catch (error: any) {
      console.error('❌ Error completo creando evento:', error);

      // Manejo específico de errores
      if (error.message.includes('400')) {
        toast.error('Datos inválidos: ' + error.message);
      } else if (error.message.includes('401')) {
        toast.error('No tienes permisos para crear eventos. Por favor, inicia sesión nuevamente.');
      } else if (error.message.includes('409') || error.message.includes('custom_url')) {
        toast.error('Ya existe un evento con esa URL. Por favor, elige otra URL.');
        setErrors({ custom_url: 'Esta URL ya está en uso' });
        setUrlAvailable(false);
      } else if (error.message.includes('500')) {
        toast.error('Error del servidor. Por favor, intenta nuevamente en unos minutos.');
      } else {
        toast.error(error.message || 'Error inesperado al crear el tipo de evento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: "",
      description: "",
      duration_minutes: 30,
      location_type: "google_meet",
      custom_url: "",
      requires_confirmation: false,
      min_booking_notice: 60,
      buffer_time: 0,
      daily_limit: 0,
      notifications_enabled: true,
    });
    setErrors({});
    setUrlAvailable(null);
    setQuestions([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-8">
        {/* Información Básica */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Información Básica del Evento
            </CardTitle>
            <CardDescription>
              Define los detalles principales de tu tipo de evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre del evento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Reunión de consultoría"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_minutes">
                  Duración <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.duration_minutes.toString()}
                  onValueChange={(value) => handleSelectChange('duration_minutes', value)}
                >
                  <SelectTrigger className={errors.duration_minutes ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1.5 horas</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="180">3 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                  </SelectContent>
                </Select>
                {errors.duration_minutes && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.duration_minutes}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del evento</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe brevemente el propósito de este tipo de evento..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Esta descripción será visible para las personas que reserven tu evento
              </p>
            </div>
          </CardContent>
        </Card>

        {/* URL y Ubicación */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              URL y Ubicación
            </CardTitle>
            <CardDescription>
              Configura cómo y dónde se realizará tu evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campo de URL personalizada */}
            {formData.location_type !== 'google_meet' && (
              <div className="space-y-2">
                <Label htmlFor="custom_url">
                  URL personalizada <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    calendly.app/
                  </span>
                  <div className="flex-1 relative">
                    <Input
                      id="custom_url"
                      name="custom_url"
                      value={formData.custom_url}
                      onChange={handleInputChange}
                      placeholder="mi-evento-personalizado"
                      className={`pr-10 ${errors.custom_url ? "border-red-500" : ""}`}
                    />
                    <div className="absolute right-3 top-2.5">
                      {isCheckingUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : urlAvailable === true ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : urlAvailable === false ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>
                </div>
                {errors.custom_url ? (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.custom_url}
                  </p>
                ) : urlAvailable === true ? (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    URL disponible
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Solo letras minúsculas, números y guiones
                  </p>
                )}
              </div>
            )}

            {/* Mostrar enlace de Google Meet si existe */}
            {meetLink && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
                <h3 className="font-semibold mb-2">Enlace de Google Meet generado:</h3>
                <p className="mb-2 text-sm truncate">{meetLink}</p>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(meetLink)}
                  >
                    Copiar enlace
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(meetLink, '_blank')}
                  >
                    Unirse ahora
                  </Button>
                </div>
              </div>
            )}

            {/* Selector de tipo de ubicación */}
            <div className="space-y-2">
              <Label htmlFor="location_type">Tipo de ubicación</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => handleSelectChange('location_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_meet">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      Google Meet
                    </div>
                  </SelectItem>
                  <SelectItem value="zoom">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      Zoom
                    </div>
                  </SelectItem>
                  <SelectItem value="teams">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-600 rounded"></div>
                      Microsoft Teams
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      Teléfono
                    </div>
                  </SelectItem>
                  <SelectItem value="in_person">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      Presencial
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {/* Configuraciones Avanzadas */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-500" />
              Configuraciones Avanzadas
            </CardTitle>
            <CardDescription>
              Personaliza el comportamiento y restricciones de tu evento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="min_booking_notice">
                  Tiempo mínimo de anticipación
                </Label>
                <Select
                  value={formData.min_booking_notice.toString()}
                  onValueChange={(value) => handleSelectChange('min_booking_notice', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin restricción</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                    <SelectItem value="720">12 horas</SelectItem>
                    <SelectItem value="1440">1 día</SelectItem>
                    <SelectItem value="2880">2 días</SelectItem>
                    <SelectItem value="10080">1 semana</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tiempo mínimo antes del evento para poder reservar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buffer_time">
                  Tiempo entre eventos
                </Label>
                <Select
                  value={formData.buffer_time.toString()}
                  onValueChange={(value) => handleSelectChange('buffer_time', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin tiempo extra</SelectItem>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="10">10 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tiempo de descanso después de cada evento
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_limit">
                  Límite diario de eventos
                </Label>
                <Select
                  value={formData.daily_limit.toString()}
                  onValueChange={(value) => handleSelectChange('daily_limit', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin límite</SelectItem>
                    <SelectItem value="1">1 evento por día</SelectItem>
                    <SelectItem value="2">2 eventos por día</SelectItem>
                    <SelectItem value="3">3 eventos por día</SelectItem>
                    <SelectItem value="5">5 eventos por día</SelectItem>
                    <SelectItem value="10">10 eventos por día</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Máximo número de reservas por día
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="requires_confirmation" className="text-base">
                    Requiere confirmación manual
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Las reservas necesitarán tu aprobación antes de confirmarse
                  </p>
                </div>
                <Switch
                  id="requires_confirmation"
                  checked={formData.requires_confirmation}
                  onCheckedChange={(checked) => handleSwitchChange('requires_confirmation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications_enabled" className="text-base">
                    Notificaciones habilitadas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones por email sobre nuevas reservas
                  </p>
                </div>
                <Switch
                  id="notifications_enabled"
                  checked={formData.notifications_enabled}
                  onCheckedChange={(checked) => handleSwitchChange('notifications_enabled', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preguntas Personalizadas */}
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-orange-500" />
                  Preguntas Personalizadas
                </CardTitle>
                <CardDescription>
                  Agrega preguntas adicionales que los invitados deberán responder al reservar
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar pregunta
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h4 className="font-medium mb-2">Sin preguntas configuradas</h4>
                <p className="text-sm mb-4">
                  Las preguntas personalizadas te ayudan a obtener información específica de tus invitados antes de la reunión.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar primera pregunta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-500 bg-orange-50/30">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1 pt-2">
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-orange-100"
                                onClick={() => handleMoveQuestion(index, 'up')}
                                disabled={index === 0}
                                title="Mover arriba"
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-orange-100"
                                onClick={() => handleMoveQuestion(index, 'down')}
                                disabled={index === questions.length - 1}
                                title="Mover abajo"
                              >
                                ↓
                              </Button>
                            </div>
                            <div className="flex items-center justify-center">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="text-xs text-muted-foreground text-center font-mono">
                              #{index + 1}
                            </span>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Pregunta</Label>
                              <Textarea
                                value={question.question}
                                onChange={(e) => handleUpdateQuestion(index, 'question', e.target.value)}
                                placeholder="Escribe tu pregunta aquí... (ej: ¿Cuál es el objetivo principal de esta reunión?)"
                                rows={2}
                                className="resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={question.is_required}
                                  onCheckedChange={(checked) => handleUpdateQuestion(index, 'is_required', checked)}
                                />
                                <Label className="text-sm">
                                  Respuesta obligatoria
                                  {question.is_required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteQuestion(index)}
                                title="Eliminar pregunta"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="w-full flex items-center gap-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4" />
                  Agregar otra pregunta
                </Button>
              </div>
            )}

            {questions.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Vista previa para invitados
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Así verán las preguntas tus invitados al reservar:
                </p>
                <div className="space-y-3 bg-white p-4 rounded border">
                  {questions
                    .filter(q => q.question.trim() !== '')
                    .map((question, index) => (
                      <div key={index} className="space-y-1">
                        <Label className="text-sm flex items-center gap-1">
                          {question.question}
                          {question.is_required && <span className="text-red-500">*</span>}
                        </Label>
                        <Textarea
                          placeholder="Respuesta del invitado..."
                          disabled
                          className="bg-gray-50 text-sm"
                          rows={2}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen y Botón de Crear */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Resumen del Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formData.duration_minutes} min
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {formData.location_type.replace('_', ' ')}
                </Badge>
                {formData.requires_confirmation && (
                  <Badge variant="secondary">Requiere confirmación</Badge>
                )}
                {formData.daily_limit > 0 && (
                  <Badge variant="outline">
                    Máx. {formData.daily_limit} por día
                  </Badge>
                )}
                {questions.length > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    {questions.filter(q => q.question.trim() !== '').length} pregunta{questions.filter(q => q.question.trim() !== '').length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {formData.name && formData.custom_url && (
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium">URL del evento:</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    calendly.app/{formData.custom_url}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || isCheckingUrl || urlAvailable === false}
                  className="flex-1 bg-pink-300 hover:bg-pink-400"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando evento...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Crear tipo de evento
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={isLoading}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}