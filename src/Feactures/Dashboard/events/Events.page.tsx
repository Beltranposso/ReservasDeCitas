import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Badge } from "../../../components/ui/badge";
import * as lucideReact from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import CreateEventForm from "./components/create-event-form"
import { FadeIn } from "../../../components/animations/fade-in"
import eventsService from './EventsService';
import ShareModal from "./components/ShareModal";
import EditEventModal from "./components/EditEventModal";
import CopyAnimatedToast from "./components/CopyAnimatedToast"; // <-- Importa el componente animado

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

interface EventQuestion {
  id?: number;
  event_type_id?: number;
  question: string;
  is_required: boolean;
  question_order: number;
}

interface ShareModalData {
  eventId: number;
  eventName: string;
  bookingUrl: string;
  embedUrl: string;
}

function EventsList({ refreshTrigger }: { refreshTrigger: number }) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [eventQuestions, setEventQuestions] = useState<EventQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [lastGeneratedLink, setLastGeneratedLink] = useState<string | null>(null);

  // Animación de copia
  const [showCopyToast, setShowCopyToast] = useState(false);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareModalData | null>(null);
  const [selectedTab, setSelectedTab] = useState("link");
  const [buttonText, setButtonText] = useState("Reservar mi Cal");
  const [buttonPosition, setButtonPosition] = useState("bottom-right");
  const [buttonColor, setButtonColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [embedTheme, setEmbedTheme] = useState("auto");
  const [hideEventDetails, setHideEventDetails] = useState(false);
  const [brandColor, setBrandColor] = useState("#292929");

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

  // Función para copiar enlace con animación
  const handleCopyLink = async (eventId: number, locationType: string, meetLink?: string) => {
    try {
      let linkToCopy: string | null = null;
      let successMessage: string;

      if (locationType === 'google_meet' && meetLink) {
        linkToCopy = meetLink;
        successMessage = "Enlace de Google Meet copiado al portapapeles";
      } else {
        linkToCopy = `${window.location.origin}/book/${eventId}`;
        successMessage = "Enlace de agendación copiado al portapapeles";
      }

      if (linkToCopy) {
        await navigator.clipboard.writeText(linkToCopy);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 1400);
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error("Error al copiar enlace");
    }
  };

  // Función para abrir el modal de compartir
  const handleShareEvent = (event: EventType) => {
    const bookingUrl = `${window.location.origin}/book/${event.id}`;
    const embedUrl = `${window.location.origin}/embed/${event.id}`;

    setShareData({
      eventId: event.id,
      eventName: event.name,
      bookingUrl,
      embedUrl
    });
    setShareModalOpen(true);
  };

  // Función para generar el código del iframe
  const generateIframeCode = () => {
    if (!shareData) return "";

    return `<iframe
  src="${shareData.embedUrl}?theme=${embedTheme}&hideEventTypeDetails=${hideEventDetails}&brandColor=${brandColor.replace('#', '')}"
  width="100%"
  height="600"
  frameborder="0">
</iframe>`;
  };

  // Función para generar el código del botón flotante
  const generateFloatingButtonCode = () => {
    if (!shareData) return "";

    return `<!-- Cal floating-popup embed code begins -->
<script type="text/javascript">
  (function (C, A, L) { 
    let p = function (a, ar) { a.q.push(ar); }; 
    let d = C.document; 
    C.Cal = C.Cal || function () { 
      let cal = C.Cal; 
      let ar = arguments; 
      if (!cal.loaded) {
        cal.ns = {}; 
        cal.q = cal.q || []; 
        d.head.appendChild(d.createElement("script")).src = A; 
        cal.loaded = true; 
      } 
      if (ar[0] === L) { 
        const api = function () { p(api, arguments); }; 
        const namespace = ar[1]; 
        api.q = api.q || []; 
        if(typeof namespace === "string"){
          cal.ns[namespace] = cal.ns[namespace] || api;
          cal.ns[namespace].q = cal.ns[namespace].q || [];
          cal.ns[namespace].q.push(...api.q);
        } else {
          p(cal, ar);
        }
        return;
      }
      p(cal, ar); 
    }; 
  })(window, "https://app.cal.com/embed/embed.js", "init");
  
  Cal("init", {origin:"${window.location.origin}"});
  
  Cal("floatingButton", {
    calLink: "${shareData.bookingUrl}",
    config: {
      theme: "${embedTheme}",
      brandColor: "${brandColor}",
      hideEventTypeDetails: ${hideEventDetails}
    },
    buttonText: "${buttonText}",
    buttonPosition: "${buttonPosition}",
    buttonColor: "${buttonColor}",
    buttonTextColor: "${textColor}"
  });
</script>
<!-- Cal floating-popup embed code ends -->`;
  };

  // Función para generar el código React
  const generateReactCode = () => {
    if (!shareData) return "";

    return `import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function MyApp() {
  useEffect(()=>{
    (async function () {
      const cal = await getCalApi();
      cal("ui", {"theme":"${embedTheme}","styles":{"branding":{"brandColor":"${brandColor}"}},"hideEventTypeDetails":${hideEventDetails}});
    })();
  }, [])
  
  return (
    <Cal
      calLink="${shareData.eventName.toLowerCase().replace(/\s+/g, '-')}"
      style={{width:"100%",height:"100%",overflow:"scroll"}}
      config={{"theme":"${embedTheme}"}}
    />
  );
}`;
  };

  // Función para copiar al portapapeles desde el modal de compartir con animación
  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 1400);
      toast.success(successMessage);
    } catch (error) {
      console.error('Error al copiar:', error);
      toast.error("Error al copiar al portapapeles");
    }
  };

  // Función para cargar preguntas del evento usando el servicio real
  const loadEventQuestions = async (eventId: number) => {
    try {
      setLoadingQuestions(true);
      const questions = await eventsService.getEventQuestions(eventId);
      setEventQuestions(questions);
    } catch (error: any) {
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
      const validQuestions = eventQuestions.filter(q => q.question.trim() !== '');
      await eventsService.saveEventQuestions(editingEvent.id, validQuestions);
    } catch (error: any) {
      throw error;
    }
  };

  // Función para abrir modal de edición usando el servicio real
  const handleEditEvent = async (event: EventType) => {
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
    await loadEventQuestions(event.id);
    setIsEditModalOpen(true);
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const eventsList = await eventsService.getAllEventTypes();
      setEvents(eventsList);
      if (eventsList.length > 0) {
        toast.success(`Se encontraron ${eventsList.length} eventos`);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error al cargar eventos: ${err.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [refreshTrigger]);

  // Función para eliminar evento usando el servicio real
  const handleDeleteEvent = async (eventId: number) => {
    try {
      const deps = await eventsService.checkEventDependencies(eventId);

      let confirmMessage = "¿Estás seguro de que deseas eliminar este evento?";

      if (deps.questions > 0 || deps.bookings > 0 || deps.reminders > 0) {
        confirmMessage += "\n\nEsto también eliminará:";
        if (deps.questions > 0) confirmMessage += `\n• ${deps.questions} pregunta(s) personalizada(s)`;
        if (deps.bookings > 0) confirmMessage += `\n• ${deps.bookings} reserva(s) existente(s)`;
        if (deps.reminders > 0) confirmMessage += `\n• ${deps.reminders} recordatorio(s)`;
        confirmMessage += "\n\n⚠️ Esta acción no se puede deshacer.";
      }

      if (!window.confirm(confirmMessage)) return;

      await eventsService.deleteEventType(eventId);

      toast.success("Evento eliminado correctamente");
      await loadEvents();

    } catch (error: any) {
      if (error.message.includes('datos relacionados') || error.message.includes('constraint')) {
        toast.error("No se puede eliminar: el evento tiene reservas o datos relacionados");
      } else {
        toast.error(`Error al eliminar evento: ${error.message}`);
      }
    }
  };

  // Función para duplicar evento usando el servicio real
  const handleDuplicateEvent = async (eventId: number, eventName: string) => {
    try {
      const duplicatedEvent = await eventsService.duplicateEvent(eventId, `${eventName} (Copia)`);
      toast.success(`Evento duplicado: ${duplicatedEvent.name}`);
      await loadEvents();
    } catch (error: any) {
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

  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    try {
      setIsUpdating(true);
      await eventsService.updateEventType(editingEvent.id, editFormData);
      await handleSaveQuestions();
      toast.success('Evento actualizado correctamente');
      setIsEditModalOpen(false);
      setEditingEvent(null);
      setEventQuestions([]);
      await loadEvents();
    } catch (error: any) {
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
      <CopyAnimatedToast show={showCopyToast} />

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
                    <DropdownMenuItem onClick={() => handleCopyLink(event.id, event.location_type, lastGeneratedLink || undefined)}>
                      <lucideReact.Copy className="mr-2 h-4 w-4" />
                      Copiar enlace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareEvent(event)}>
                      <lucideReact.Share2 className="mr-2 h-4 w-4" />
                      Compartir enlace
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
                    onClick={() => handleCopyLink(event.id, event.location_type, lastGeneratedLink || undefined)}
                    className="flex items-center gap-2"
                  >
                    <lucideReact.Link className="h-3.5 w-3.5" />
                    Copiar enlace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareEvent(event)}
                    className="flex items-center gap-2"
                  >
                    <lucideReact.Share2 className="h-3.5 w-3.5" />
                    Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onOpenChange={setShareModalOpen}
        shareData={shareData}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        embedConfig={{
          theme: embedTheme,
          setTheme: setEmbedTheme,
          hideDetails: hideEventDetails,
          setHideDetails: setHideEventDetails,
          brandColor,
          setBrandColor,
          buttonText,
          setButtonText,
          buttonPosition,
          setButtonPosition,
          buttonColor,
          setButtonColor,
          textColor,
          setTextColor
        }}
        onCopyToClipboard={copyToClipboard}
        generateCodes={{
          iframe: generateIframeCode,
          floating: generateFloatingButtonCode,
          react: generateReactCode
        }}
      />

      {/* Edit Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        event={editingEvent}
        formData={editFormData}
        onInputChange={handleEditInputChange}
        onSelectChange={handleEditSelectChange}
        onSwitchChange={handleEditSwitchChange}
        onSave={handleSaveEdit}
        isUpdating={isUpdating}
        questions={{
          list: eventQuestions,
          loading: loadingQuestions,
          onAdd: handleAddQuestion,
          onUpdate: handleUpdateQuestion,
          onDelete: handleDeleteQuestion,
          onMove: handleMoveQuestion
        }}
      />
    </>
  );
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("types");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateEventClick = () => {
    setActiveTab("create");
  };

  const handleEventCreated = (linkGenerated?: string) => {
    setRefreshKey(prev => prev + 1);
    setActiveTab("types");
    if (linkGenerated) {
      navigator.clipboard.writeText(linkGenerated);
      toast.success("Enlace de Google Meet copiado al portapapeles automáticamente");
      // Si quieres mostrar la animación aquí también, puedes hacer:
      // setShowCopyToast(true);
      // setTimeout(() => setShowCopyToast(false), 1400);
    }
  };

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
          <lucideReact.PlusCircle className="h-4 w-4" />
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
  );
}