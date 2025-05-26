// src/features/auth/pages/RegisterPage.tsx
import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { FadeIn } from '../../../components/animations/fade-in';
import * as lucideReact from 'lucide-react';
import authService from '../authservice';
import { toast } from 'sonner';

const planDetails = {
  'starter': { name: 'Starter', price: 49900 },
  'professional': { name: 'Professional', price: 99900 },
  'business': { name: 'Business', price: 199900 },
  'enterprise': { name: 'Enterprise', price: 399900 },
};

// Lista de zonas horarias comunes
const timezones = [
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' },
  { value: 'Asia/Tokyo', label: 'Tokio (GMT+9)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'starter';
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Datos del formulario simplificados para registro inicial
  const [formData, setFormData] = useState({
    // Datos de cuenta
    email: '',
    password: '',
    confirmPassword: '',
    // Datos personales
    name: '',
    timezone: 'America/Bogota',
    // Plan seleccionado
    selectedPlan: planId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'account') {
      if (!formData.email) {
        newErrors.email = 'El correo es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Correo inválido';
      }

      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (activeTab === 'personal') {
      if (!formData.name) {
        newErrors.name = 'El nombre es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      if (activeTab === 'account') {
        setActiveTab('personal');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Registrar usuario con los datos básicos
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        timezone: formData.timezone,
      });

      if (response.success) {
        toast.success('¡Cuenta creada exitosamente!');
        
        // Guardar información del plan seleccionado para el proceso de pago posterior
        localStorage.setItem('selectedPlan', formData.selectedPlan);
        
        // Redirección a página de éxito o dashboard
        navigate('/register/success');
      }
    } catch (error: any) {
      console.error('Error durante el registro:', error);
      toast.error(error.message || 'Error al crear la cuenta. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear el precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <FadeIn className="w-full max-w-2xl">
        <Link to="/plans" className="inline-flex items-center text-pastel-blue hover:underline mb-4">
          <lucideReact.ChevronLeft className="h-4 w-4 mr-1" />
          Volver a planes
        </Link>
        
        <Card className="shadow-lg border-pastel-blue/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Crear tu cuenta</CardTitle>
            <CardDescription className="text-center flex flex-col items-center gap-2">
              <span>Completa tus datos para iniciar tu prueba de 14 días</span>
              <div className="bg-muted/50 px-4 py-2 rounded-full text-sm">
                Plan seleccionado: <span className="font-semibold">{planDetails[planId as keyof typeof planDetails]?.name}</span> - 
                <span className="font-semibold"> {formatPrice(planDetails[planId as keyof typeof planDetails]?.price)} /mes</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="account">Cuenta</TabsTrigger>
                <TabsTrigger value="personal">Información Personal</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                <TabsContent value="account" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <lucideReact.Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nombre@empresa.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <lucideReact.Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <lucideReact.EyeOff className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <lucideReact.Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {errors.password ? (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        La contraseña debe tener al menos 8 caracteres
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <div className="relative">
                      <lucideReact.Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    className="w-full mt-6 bg-pastel-pink hover:bg-pastel-pink/90"
                    onClick={handleNext}
                  >
                    Continuar
                  </Button>
                </TabsContent>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <div className="relative">
                      <lucideReact.User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona horaria</Label>
                    <div className="relative">
                      <lucideReact.Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground z-10" />
                      <Select 
                        value={formData.timezone} 
                        onValueChange={(value) => handleSelectChange('timezone', value)}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Selecciona tu zona horaria" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <h3 className="font-medium mb-2">Información importante:</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Tu prueba gratuita de 14 días comenzará inmediatamente</li>
                      <li>• No se te cobrará hasta que finalice el período de prueba</li>
                      <li>• Puedes cancelar en cualquier momento sin cargo</li>
                      <li>• Configurarás los métodos de pago después del registro</li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-pastel-pink hover:bg-pastel-pink/90" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('account')}
                    >
                      Volver
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-center text-muted-foreground">
              Al registrarte, aceptas nuestros{" "}
              <Link to="/terms" className="text-pastel-blue hover:underline">
                Términos de servicio
              </Link>{" "}
              y{" "}
              <Link to="/privacy" className="text-pastel-blue hover:underline">
                Política de privacidad
              </Link>
            </p>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}