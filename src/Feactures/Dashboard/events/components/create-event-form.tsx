// src/features/dashboard/events/components/create-event-form.tsx
import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Switch } from "../../../../components/ui/switch";
import eventsService from '../EventsService';
import { toast } from "sonner";
import * as lucideReact from "lucide-react";


interface CreateEventFormProps {
  onEventCreated?: () => void;
}

export default function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
  // const [checkingUrl, setCheckingUrl] = useState(false);
  
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

  // Generar URL sugerida cuando cambie el nombre
  useEffect(() => {
    if (formData.name && !formData.custom_url) {
      const suggestedUrl = eventsService.generateSuggestedUrl(formData.name);
      setFormData(prev => ({ ...prev, custom_url: suggestedUrl }));
    }
  }, [formData.name]);

  // Verificar disponibilidad de URL con debounce
  // useEffect(() => {
  //   const timer = setTimeout(async () => {
  //     if (formData.custom_url && formData.custom_url.length > 2) {
  //       setCheckingUrl(true);
  //       try {
  //         const available = await eventsService.validateCustomUrl(formData.custom_url);
  //         setUrlAvailable(available);
  //         if (!available) {
  //           setErrors(prev => ({ ...prev, custom_url: 'Esta URL ya está en uso' }));
  //         } else {
  //           setErrors(prev => {
  //             const { custom_url, ...rest } = prev;
  //             return rest;
  //           });
  //         }
  //       } catch (error) {
  //         console.error('Error verificando URL:', error);
  //       } finally {
  //         setCheckingUrl(false);
  //       }
  //     }
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [formData.custom_url]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value) || 0 : value;
    
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del evento es requerido';
    }

    if (formData.duration_minutes < 5 || formData.duration_minutes > 480) {
      newErrors.duration_minutes = 'La duración debe estar entre 5 y 480 minutos';
    }

    if (!formData.custom_url.trim()) {
      newErrors.custom_url = 'La URL personalizada es requerida';
    } else if (!/^[a-z0-9-]+$/.test(formData.custom_url)) {
      newErrors.custom_url = 'La URL solo puede contener letras minúsculas, números y guiones';
    }

    if (urlAvailable === false) {
      newErrors.custom_url = 'Esta URL ya está en uso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      const newEvent = await eventsService.createEventType(formData);
      
      toast.success('¡Tipo de evento creado exitosamente!');
      
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

      // Notificar al componente padre
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (error: any) {
      console.error('Error creando evento:', error);
      toast.error(error.message || 'Error al crear el tipo de evento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información básica</h3>
        
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del evento *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: Consulta de 30 minutos"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <lucideReact.AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe brevemente de qué trata este tipo de evento"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom_url">URL personalizada *</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">tudominio.com/</span>
            <div className="relative flex-1">
              <Input
                id="custom_url"
                name="custom_url"
                value={formData.custom_url}
                onChange={handleInputChange}
                placeholder="mi-evento"
                className={`${errors.custom_url ? 'border-red-500' : ''} ${
                  urlAvailable === true ? 'border-green-500' : ''
                }`}
              />
              {checkingUrl && (
                <lucideReact.Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!checkingUrl && urlAvailable === true && (
                <div className="absolute right-3 top-2.5 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          {errors.custom_url && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <lucideReact.AlertCircle className="h-3 w-3" />
              {errors.custom_url}
            </p>
          )}
          {urlAvailable === true && !errors.custom_url && (
            <p className="text-sm text-green-600">¡URL disponible!</p>
          )}
        </div>
      </div>

      {/* Configuración del evento */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuración del evento</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration_minutes" className="flex items-center gap-2">
              <lucideReact.Clock className="h-4 w-4" />
              Duración *
            </Label>
            <Select 
              value={formData.duration_minutes.toString()} 
              onValueChange={(value) => handleSelectChange('duration_minutes', value)}
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
            <Label htmlFor="location_type" className="flex items-center gap-2">
              <lucideReact.MapPin className="h-4 w-4" />
              Ubicación *
            </Label>
            <Select 
              value={formData.location_type} 
              onValueChange={(value) => handleSelectChange('location_type', value)}
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
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_booking_notice">Tiempo mínimo de anticipación</Label>
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
                <SelectItem value="1440">1 día</SelectItem>
                <SelectItem value="2880">2 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buffer_time">Tiempo entre eventos</Label>
            <Select 
              value={formData.buffer_time.toString()} 
              onValueChange={(value) => handleSelectChange('buffer_time', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sin tiempo de descanso</SelectItem>
                <SelectItem value="5">5 minutos</SelectItem>
                <SelectItem value="10">10 minutos</SelectItem>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="daily_limit" className="flex items-center gap-2">
            <lucideReact.Users className="h-4 w-4" />
            Límite diario de reservas
          </Label>
          <Input
            id="daily_limit"
            name="daily_limit"
            type="number"
            min="0"
            value={formData.daily_limit}
            onChange={handleInputChange}
            placeholder="0 = Sin límite"
          />
          <p className="text-xs text-muted-foreground">
            Número máximo de reservas permitidas por día (0 = sin límite)
          </p>
        </div>
      </div>

      {/* Opciones adicionales */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Opciones adicionales</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="requires_confirmation">Requiere confirmación</Label>
            <p className="text-sm text-muted-foreground">
              Las reservas deberán ser aprobadas manualmente
            </p>
          </div>
          <Switch
            id="requires_confirmation"
            checked={formData.requires_confirmation}
            onCheckedChange={(checked) => handleSwitchChange('requires_confirmation', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications_enabled">Notificaciones habilitadas</Label>
            <p className="text-sm text-muted-foreground">
              Recibir notificaciones por email de nuevas reservas
            </p>
          </div>
          <Switch
            id="notifications_enabled"
            checked={formData.notifications_enabled}
            onCheckedChange={(checked) => handleSwitchChange('notifications_enabled', checked)}
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => {
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
          }}
        >
          Limpiar
        </Button>
        <Button 
          type="submit" 
          className="bg-pastel-pink hover:bg-pastel-pink/90"
          disabled={isLoading || checkingUrl}
        >
          {isLoading ? (
            <>
              <lucideReact.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear tipo de evento'
          )}
        </Button>
      </div>
    </form>
  );
}