import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";
import { Clock, MapPin, User, Mail, AlertCircle, Check } from "lucide-react";
import { api, API_ENDPOINTS } from "../../services/apiclient";

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

export default function AgendacionPage({ eventId }: EventRegistrationProps) {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (eventId) loadEventData();
  }, [eventId]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!validateForm() || !eventData) return;
    setIsSubmitting(true);
    try {
      const contactData = {
        name: formData.name,
        email: formData.email
      };
      const contactResponse = await api.post(API_ENDPOINTS.contacts.create, contactData);
      if (contactResponse.data.success) {
        toast.success("¡Registro exitoso!", {
          description: `Te has registrado para "${eventData.name}"`
        });
        setFormData({ name: "", email: "" });
        setIsRegistered(true);
      }
    } catch (error: any) {
      console.error("Error en registro:", error);
      if (error.response?.status === 409) {
        toast.error("Este correo ya está registrado");
      } else {
        toast.error("Error al registrarse. Intenta nuevamente");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="mb-6 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-blue-600">
              {eventData.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">
              {eventData.description || "Únete a este evento"}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>{eventData.duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="capitalize">
                  {eventData.location_type.replace("_", " ")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isRegistered ? (
          <Card className="border-green-300">
            <CardHeader className="text-center">
              <Check className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-xl text-green-600">
                ¡Te has registrado exitosamente!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Revisa tu correo para más detalles del evento.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Regístrate al evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Correo electrónico <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@correo.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Registrarme al evento
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Al registrarte, recibirás información sobre el evento en tu correo
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
