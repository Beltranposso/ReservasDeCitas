import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"
import { PlusCircle } from "lucide-react"
import CreateEventForm from "./components/create-event-form"
import { FadeIn } from "../../../components/animations/fade-in"
import { useState, useEffect } from "react";
import { Badge } from "../../../components/ui/badge";
import * as lucideReact from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { toast } from "sonner";
import eventsService from './EventsService';

// Interfaz para los eventos
interface EventType {
  id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  location_type: string;
  custom_url: string;
  user_id: number;
  requires_confirmation?: boolean;
  min_booking_notice?: number;
  buffer_time?: number;
  daily_limit?: number;
  notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interfaz para las preguntas
interface EventQuestion {
  id?: number;
  event_type_id?: number;
  question: string;
  is_required: boolean;
  question_order: number;
}

// Componente de lista de eventos
function EventsList({ refreshTrigger }: { refreshTrigger: number }) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // Estados para el modal de edición
  const [eventQuestions, setEventQuestions] = useState<EventQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Estado para el formulario de edición
  const [editFormData, setEditFormData] = useState({
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

  // Función para cargar preguntas del evento usando el servicio real
  const loadEventQuestions = async (eventId: number) => {
    try {
      setLoadingQuestions(true);
      console.log('🔄 Cargando preguntas para evento:', eventId);
      
      const questions = await eventsService.getEventQuestions(eventId);
      console.log('📋 Preguntas cargadas desde EventsService:', questions);
      
      setEventQuestions(questions);
    } catch (error: any) {
      console.error('❌ Error cargando preguntas desde EventsService:', error);
      console.warn('No se pudieron cargar las preguntas del evento');
      setEventQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Funciones para manejar preguntas en el modal de edición
  const handleAddQuestion = () => {
    const newQuestion: EventQuestion = {
      question: "",
      is_required: false,
      question_order: eventQuestions.length + 1
    };
    setEventQuestions([...eventQuestions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, field: keyof EventQuestion, value: any) => {
    const updatedQuestions = eventQuestions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setEventQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = async (index: number) => {
    const question = eventQuestions[index];
    
    if (question.id && editingEvent) {
      try {
        await eventsService.deleteEventQuestion(editingEvent.id, question.id);
        toast.success('Pregunta eliminada correctamente');
      } catch (error: any) {
        console.error('❌ Error eliminando pregunta:', error);
        toast.error(`Error al eliminar pregunta: ${error.message}`);
        return;
      }
    }
    
    const updatedQuestions = eventQuestions.filter((_, i) => i !== index);
    updatedQuestions.forEach((q, i) => {
      q.question_order = i + 1;
    });
    setEventQuestions(updatedQuestions);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= eventQuestions.length) return;

    const updatedQuestions = [...eventQuestions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
    
    updatedQuestions.forEach((q, i) => {
      q.question_order = i + 1;
    });
    
    setEventQuestions(updatedQuestions);
  };

  const handleSaveQuestions = async () => {
    if (!editingEvent) return;

    try {
      console.log('💾 Guardando preguntas:', eventQuestions);
      
      const validQuestions = eventQuestions.filter(q => q.question.trim() !== '');
      
      await eventsService.saveEventQuestions(editingEvent.id, validQuestions);
      console.log('✅ Preguntas guardadas exitosamente');
      
    } catch (error: any) {
      console.error('❌ Error guardando preguntas:', error);
      throw error; // Re-lanzar para que handleSaveEdit lo maneje
    }
  };

  // Función para abrir modal de edición usando el servicio real
  const handleEditEvent = async (event: EventType) => {
    console.log('✏️ Abriendo modal de edición para evento:', event);
    setEditingEvent(event);
    setEditFormData({
      name: event.name,
      description: event.description || "",
      duration_minutes: event.duration_minutes,
      location_type: event.location_type,
      custom_url: event.custom_url,
      requires_confirmation: event.requires_confirmation || false,
      min_booking_notice: event.min_booking_notice || 60,
      buffer_time: event.buffer_time || 0,
      daily_limit: event.daily_limit || 0,
      notifications_enabled: event.notifications_enabled !== false,
    });
    
    // Cargar preguntas del evento usando el servicio real
    await loadEventQuestions(event.id);
    setIsEditModalOpen(true);
  };
  
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando eventos desde el EventsService...');
      
      // Usar el método correcto del EventsService
      const eventsList = await eventsService.getAllEventTypes();
      
      console.log('📡 Eventos recibidos del EventsService:', eventsList);
      console.log('📊 Cantidad de eventos:', eventsList.length);
      
      setEvents(eventsList);
      
      if (eventsList.length > 0) {
        toast.success(`Se encontraron ${eventsList.length} eventos`);
      } else {
        console.log('ℹ️ No se encontraron eventos para mostrar');
      }
      
    } catch (err: any) {
      console.error('❌ Error cargando eventos desde EventsService:', err);
      setError(err.message);
      toast.error(`Error al cargar eventos: ${err.message}`);
      
      // En caso de error, mostrar array vacío para no romper la UI
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar eventos al montar y cuando cambie refreshTrigger
  useEffect(() => {
    console.log('🎬 Efecto de carga de eventos ejecutado (trigger:', refreshTrigger, ')');
    loadEvents();
  }, [refreshTrigger]);

  // Función para eliminar evento usando el servicio real
  const handleDeleteEvent = async (eventId: number) => {
    try {
      console.log(`🔍 Verificando dependencias para evento ${eventId}...`);
      
      // Usar el método del EventsService para verificar dependencias
      const deps = await eventsService.checkEventDependencies(eventId);
      console.log('📊 Dependencias encontradas:', deps);
      
      let confirmMessage = "¿Estás seguro de que deseas eliminar este evento?";
      
      if (deps.questions > 0 || deps.bookings > 0 || deps.reminders > 0) {
        confirmMessage += "\n\nEsto también eliminará:";
        if (deps.questions > 0) confirmMessage += `\n• ${deps.questions} pregunta(s) personalizada(s)`;
        if (deps.bookings > 0) confirmMessage += `\n• ${deps.bookings} reserva(s) existente(s)`;
        if (deps.reminders > 0) confirmMessage += `\n• ${deps.reminders} recordatorio(s)`;
        confirmMessage += "\n\n⚠️ Esta acción no se puede deshacer.";
      }
      
      if (!confirm(confirmMessage)) return;

      console.log(`🗑️ Eliminando evento ${eventId} usando EventsService...`);
      
      // Usar el método del EventsService para eliminar
      const result = await eventsService.deleteEventType(eventId);
      console.log('✅ Resultado de eliminación:', result);

      toast.success("Evento eliminado correctamente");
      
      // Recargar la lista de eventos
      await loadEvents();
      
    } catch (error: any) {
      console.error('❌ Error eliminando evento desde EventsService:', error);
      
      // Manejo específico de errores
      if (error.message.includes('datos relacionados') || error.message.includes('constraint')) {
        toast.error("No se puede eliminar: el evento tiene reservas o datos relacionados");
      } else {
        toast.error(`Error al eliminar evento: ${error.message}`);
      }
    }
  };

  // Función para copiar enlace
  const handleCopyLink = (eventUrl: string) => {
    const fullUrl = `${window.location.origin}/book/${eventUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Enlace copiado al portapapeles");
  };

  // Función para duplicar evento usando el servicio real
  const handleDuplicateEvent = async (eventId: number, eventName: string) => {
    try {
      console.log(`📋 Duplicando evento ${eventId} usando EventsService...`);
      
      const duplicatedEvent = await eventsService.duplicateEvent(eventId, `${eventName} (Copia)`);
      console.log('✅ Evento duplicado exitosamente:', duplicatedEvent);
      
      toast.success(`Evento duplicado: ${duplicatedEvent.name}`);
      
      // Recargar la lista para mostrar el evento duplicado
      await loadEvents();
    } catch (error: any) {
      console.error('❌ Error duplicando evento desde EventsService:', error);
      toast.error(`Error al duplicar evento: ${error.message}`);
    }
  };

  // Handlers para el formulario de edición
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value) || 0 : value;
    setEditFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [name]: name === 'duration_minutes' ? parseInt(value) : value }));
  };

  const handleEditSwitchChange = (name: string, checked: boolean) => {
    setEditFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Función para guardar cambios usando el servicio real
  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    try {
      setIsUpdating(true);
      console.log('💾 Guardando cambios del evento usando EventsService:', editingEvent.id, editFormData);

      // Usar el método del EventsService para actualizar
      const updatedEvent = await eventsService.updateEventType(editingEvent.id, editFormData);
      console.log('✅ Evento actualizado exitosamente:', updatedEvent);
      
      // Guardar también las preguntas
      await handleSaveQuestions();
      
      toast.success('Evento actualizado correctamente');
      
      // Cerrar modal y limpiar estado
      setIsEditModalOpen(false);
      setEditingEvent(null);
      setEventQuestions([]); // Limpiar preguntas al cerrar
      
      // Recargar la lista para mostrar los cambios
      await loadEvents();
      
    } catch (error: any) {
      console.error('❌ Error actualizando evento desde EventsService:', error);
      
      // Manejo específico de errores
      if (error.message.includes('custom_url')) {
        toast.error('La URL personalizada ya está en uso. Prueba con otra.');
      } else if (error.message.includes('400')) {
        toast.error('Datos inválidos. Verifica la información ingresada.');
      } else {
        toast.error(`Error al actualizar evento: ${error.message}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8 space-y-4">
        <lucideReact.RefreshCw className="h-8 w-8 animate-spin text-pink-400" />
        <span className="text-muted-foreground">Cargando tipos de eventos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <lucideReact.AlertCircle className="h-5 w-5" />
            Error al cargar eventos
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadEvents} variant="outline">
            <lucideReact.RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <lucideReact.Calendar className="h-5 w-5" />
            No hay tipos de eventos
          </CardTitle>
          <CardDescription>
            No se encontraron eventos. Crea tu primer tipo de evento para comenzar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadEvents} variant="outline">
            <lucideReact.RefreshCw className="h-4 w-4 mr-2" />
            Recargar eventos
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Mis Tipos de Eventos</h3>
            <p className="text-sm text-muted-foreground">
              {events.length} tipo{events.length !== 1 ? 's' : ''} de evento{events.length !== 1 ? 's' : ''} configurado{events.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadEvents}>
            <lucideReact.RefreshCw className="h-4 w-4 mr-1" />
            Actualizar
          </Button>
        </div>
        
        {events.map((event, index) => (
          <FadeIn key={`event-${event.id}-${refreshTrigger}`} delay={index * 0.1}>
            <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-pink-400">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {event.name}
                    {event.requires_confirmation && (
                      <Badge variant="secondary" className="text-xs">
                        Requiere confirmación
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {event.description || "Sin descripción"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <lucideReact.MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                      <lucideReact.Edit className="mr-2 h-4 w-4" />
                      Editar evento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyLink(event.custom_url)}>
                      <lucideReact.Copy className="mr-2 h-4 w-4" />
                      Copiar enlace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateEvent(event.id, event.name)}>
                      <lucideReact.Copy className="mr-2 h-4 w-4" />
                      Duplicar evento
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600" 
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <lucideReact.Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 py-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <lucideReact.Clock className="h-3 w-3" />
                    {event.duration_minutes} min
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <lucideReact.Link className="h-3 w-3" />
                    {event.location_type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <lucideReact.Users className="h-3 w-3" />
                    1 a 1
                  </Badge>
                  {event.daily_limit && event.daily_limit > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <lucideReact.Calendar className="h-3 w-3" />
                      Máx. {event.daily_limit}/día
                    </Badge>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    URL: <span className="font-mono bg-muted px-1 rounded">{event.custom_url}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Creado: {event.created_at ? new Date(event.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditEvent(event)}
                    className="flex items-center gap-2"
                  >
                    <lucideReact.Eye className="h-3.5 w-3.5" />
                    Ver detalles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyLink(event.custom_url)}
                    className="flex items-center gap-2"
                  >
                    <lucideReact.Copy className="h-3.5 w-3.5" />
                    Copiar enlace
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Modal de edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <lucideReact.Edit className="h-5 w-5" />
              Editar Evento: {editingEvent?.name}
            </DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu evento. Los cambios se guardarán al hacer clic en "Guardar cambios".
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <lucideReact.HelpCircle className="h-4 w-4" />
                Preguntas
                {eventQuestions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {eventQuestions.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre del evento *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="Ej: Consulta de 30 minutos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descripción (opcional)</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    placeholder="Describe brevemente de qué trata este tipo de evento"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-custom_url">URL personalizada *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">tudominio.com/</span>
                    <Input
                      id="edit-custom_url"
                      name="custom_url"
                      value={editFormData.custom_url}
                      onChange={handleEditInputChange}
                      placeholder="mi-evento"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <lucideReact.Clock className="h-4 w-4" />
                    Duración *
                  </Label>
                  <Select 
                    value={editFormData.duration_minutes.toString()} 
                    onValueChange={(value) => handleEditSelectChange('duration_minutes', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1.5 horas</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <lucideReact.Settings className="h-4 w-4" />
                    Ubicación *
                  </Label>
                  <Select 
                    value={editFormData.location_type} 
                    onValueChange={(value) => handleEditSelectChange('location_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_meet">Google Meet</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                      <SelectItem value="phone">Llamada telefónica</SelectItem>
                      <SelectItem value="in_person">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Requiere confirmación</Label>
                    <p className="text-sm text-muted-foreground">
                      Las reservas deberán ser aprobadas manualmente
                    </p>
                  </div>
                  <Switch
                    checked={editFormData.requires_confirmation}
                    onCheckedChange={(checked) => handleEditSwitchChange('requires_confirmation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Notificaciones habilitadas</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones por email de nuevas reservas
                    </p>
                  </div>
                  <Switch
                    checked={editFormData.notifications_enabled}
                    onCheckedChange={(checked) => handleEditSwitchChange('notifications_enabled', checked)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <lucideReact.HelpCircle className="h-5 w-5" />
                      Preguntas Personalizadas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configura preguntas adicionales que se mostrarán durante la reserva
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddQuestion}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <lucideReact.Plus className="h-4 w-4" />
                    Agregar Pregunta
                  </Button>
                </div>

                {loadingQuestions ? (
                  <div className="flex items-center justify-center p-8">
                    <lucideReact.RefreshCw className="h-6 w-6 animate-spin text-pink-400" />
                    <span className="ml-2">Cargando preguntas...</span>
                  </div>
                ) : eventQuestions.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <lucideReact.MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg mb-2">No hay preguntas configuradas</h3>
                      <p className="text-muted-foreground mb-4">
                        Agrega preguntas personalizadas para obtener más información de tus invitados
                      </p>
                      <Button
                        onClick={handleAddQuestion}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <lucideReact.Plus className="h-4 w-4" />
                        Agregar Primera Pregunta
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {eventQuestions.map((question, index) => (
                      <Card key={`question-${index}`} className="border-l-4 border-l-blue-400">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex flex-col gap-1 pt-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleMoveQuestion(index, 'up')}
                                  disabled={index === 0}
                                >
                                  <lucideReact.ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleMoveQuestion(index, 'down')}
                                  disabled={index === eventQuestions.length - 1}
                                >
                                  <lucideReact.ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Pregunta {question.question_order}
                                  </Badge>
                                  {question.is_required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Obligatoria
                                    </Badge>
                                  )}
                                </div>
                                
                                <Textarea
                                  value={question.question}
                                  onChange={(e) => handleUpdateQuestion(index, 'question', e.target.value)}
                                  placeholder="Escribe tu pregunta aquí..."
                                  rows={2}
                                  className="resize-none"
                                />
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={question.is_required}
                                      onCheckedChange={(checked) => handleUpdateQuestion(index, 'is_required', checked)}
                                    />
                                    <Label className="text-sm">Pregunta obligatoria</Label>
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <lucideReact.Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {eventQuestions.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <lucideReact.Info className="h-4 w-4" />
                      <span>
                        {eventQuestions.filter(q => q.is_required).length} de {eventQuestions.length} preguntas son obligatorias
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <lucideReact.Plus className="h-4 w-4" />
                      Agregar Otra
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditModalOpen(false);
                setEventQuestions([]); // Limpiar preguntas
                setEditingEvent(null);
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="bg-pink-400 hover:bg-pink-500"
            >
              {isUpdating ? (
                <>
                  <lucideReact.RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <lucideReact.Check className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("types");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateEventClick = () => {
    setActiveTab("create");
  }

  // Función para actualizar la lista después de crear evento
  const handleEventCreated = () => {
    console.log('🎉 Evento creado, actualizando lista...');
    
    // Incrementar refreshKey para forzar recarga
    setRefreshKey(prev => {
      console.log('🔄 Cambiando refreshKey de', prev, 'a', prev + 1);
      return prev + 1;
    });
    
    // Cambiar a la pestaña de eventos
    setActiveTab("types");
    
    console.log('🔄 Lista de eventos debería actualizarse ahora');
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gestiona tus tipos de eventos y configuraciones</p>
        </div>
        <Button 
          className="gap-2 bg-pink-400 text-white hover:bg-pink-500"
          onClick={handleCreateEventClick}
        >
          <PlusCircle className="h-4 w-4" />
          Crear Evento
        </Button>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="types">Tipos de Eventos</TabsTrigger>
            <TabsTrigger value="create">Crear Evento</TabsTrigger>
          </TabsList>
          <TabsContent value="types" className="mt-4">
            <EventsList refreshTrigger={refreshKey} />
          </TabsContent>
          <TabsContent value="create" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Tipo de Evento</CardTitle>
                <CardDescription>Define los detalles para tu nuevo tipo de evento</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateEventForm onEventCreated={handleEventCreated} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}